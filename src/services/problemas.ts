import { supabase } from "@/integrations/supabase/client";
import type { ProblemaStatus } from "@/lib/status";

const SELECT_PROBLEMA = `
  id, titulo, descricao, status, created_at, updated_at, user_id, categoria_id,
  categorias ( id, nome ),
  localizacoes ( endereco, latitude, longitude ),
  imagens ( id, url )
`;

export type Localizacao = {
  endereco: string;
  latitude: number | null;
  longitude: number | null;
};

export type Problema = {
  id: string;
  titulo: string;
  descricao: string;
  status: ProblemaStatus;
  created_at: string;
  updated_at: string;
  user_id: string;
  categoria: { id: string; nome: string } | null;
  localizacao: Localizacao | null;
  imagens: { id: string; url: string }[];
};

export type HistoricoItem = {
  id: string;
  status_anterior: ProblemaStatus | null;
  status_novo: ProblemaStatus;
  observacao: string | null;
  created_at: string;
};

function um<T>(valor: T | T[] | null): T | null {
  if (Array.isArray(valor)) return valor[0] ?? null;
  return valor ?? null;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function normalizar(row: any): Problema {
  return {
    id: row.id,
    titulo: row.titulo,
    descricao: row.descricao,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
    user_id: row.user_id,
    categoria: um(row.categorias),
    localizacao: um(row.localizacoes),
    imagens: row.imagens ?? [],
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export type FiltrosProblema = {
  status?: ProblemaStatus | "todos";
  categoriaId?: string | "todas";
  desde?: string;
  limite?: number;
};

export async function listarProblemas(filtros: FiltrosProblema = {}) {
  let query = supabase
    .from("problemas")
    .select(SELECT_PROBLEMA)
    .order("created_at", { ascending: false });

  if (filtros.status && filtros.status !== "todos") query = query.eq("status", filtros.status);
  if (filtros.categoriaId && filtros.categoriaId !== "todas")
    query = query.eq("categoria_id", filtros.categoriaId);
  if (filtros.desde) query = query.gte("created_at", filtros.desde);
  if (filtros.limite) query = query.limit(filtros.limite);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(normalizar);
}

export async function listarMeusProblemas(userId: string) {
  const { data, error } = await supabase
    .from("problemas")
    .select(SELECT_PROBLEMA)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(normalizar);
}

export async function obterProblema(id: string) {
  const { data, error } = await supabase
    .from("problemas")
    .select(SELECT_PROBLEMA)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? normalizar(data) : null;
}

export async function listarHistorico(problemaId: string): Promise<HistoricoItem[]> {
  const { data, error } = await supabase
    .from("problema_historico")
    .select("id, status_anterior, status_novo, observacao, created_at")
    .eq("problema_id", problemaId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export type NovoProblema = {
  titulo: string;
  descricao: string;
  categoriaId: string;
  endereco: string;
  latitude: number | null;
  longitude: number | null;
  imagem: File | null;
};

export async function criarProblema(userId: string, dados: NovoProblema) {
  const { data: problema, error } = await supabase
    .from("problemas")
    .insert({
      titulo: dados.titulo.trim(),
      descricao: dados.descricao.trim(),
      categoria_id: dados.categoriaId,
      user_id: userId,
    })
    .select("id")
    .single();
  if (error) throw error;

  const { error: erroLocal } = await supabase.from("localizacoes").insert({
    problema_id: problema.id,
    endereco: dados.endereco.trim(),
    latitude: dados.latitude,
    longitude: dados.longitude,
  });
  if (erroLocal) throw erroLocal;

  if (dados.imagem) {
    const extensao = dados.imagem.name.split(".").pop() ?? "jpg";
    const caminho = `${userId}/${problema.id}-${Date.now()}.${extensao}`;
    const { error: erroUpload } = await supabase.storage
      .from("problemas")
      .upload(caminho, dados.imagem, { upsert: false });
    if (erroUpload) throw erroUpload;

    const { error: erroImagem } = await supabase
      .from("imagens")
      .insert({ problema_id: problema.id, url: caminho });
    if (erroImagem) throw erroImagem;
  }

  return problema.id;
}

export async function atualizarStatus(params: {
  problemaId: string;
  statusAnterior: ProblemaStatus;
  status: ProblemaStatus;
  observacao: string;
  autorId: string;
}) {
  const { error } = await supabase
    .from("problemas")
    .update({ status: params.status })
    .eq("id", params.problemaId);
  if (error) throw error;

  const { error: erroHistorico } = await supabase.from("problema_historico").insert({
    problema_id: params.problemaId,
    status_anterior: params.statusAnterior,
    status_novo: params.status,
    observacao: params.observacao.trim() || null,
    autor_id: params.autorId,
  });
  if (erroHistorico) throw erroHistorico;
}

/** Gera uma URL temporária para uma imagem guardada no armazenamento. */
export async function urlDaImagem(caminho: string) {
  const { data, error } = await supabase.storage
    .from("problemas")
    .createSignedUrl(caminho, 60 * 60);
  if (error) throw error;
  return data.signedUrl;
}

export function contarPorStatus(problemas: Problema[]) {
  return {
    total: problemas.length,
    recebido: problemas.filter((p) => p.status === "recebido").length,
    em_analise: problemas.filter((p) => p.status === "em_analise").length,
    em_andamento: problemas.filter((p) => p.status === "em_andamento").length,
    resolvido: problemas.filter((p) => p.status === "resolvido").length,
    cancelado: problemas.filter((p) => p.status === "cancelado").length,
  };
}
