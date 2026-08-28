import { supabase } from "@/integrations/supabase/client";

export type Categoria = {
  id: string;
  nome: string;
  ativo: boolean;
};

export async function listarCategorias(apenasAtivas = true) {
  let query = supabase.from("categorias").select("id, nome, ativo").order("nome");
  if (apenasAtivas) query = query.eq("ativo", true);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function criarCategoria(nome: string) {
  const { error } = await supabase.from("categorias").insert({ nome: nome.trim() });
  if (error) throw error;
}

export async function atualizarCategoria(id: string, dados: { nome?: string; ativo?: boolean }) {
  const { error } = await supabase.from("categorias").update(dados).eq("id", id);
  if (error) throw error;
}
