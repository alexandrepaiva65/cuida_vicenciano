import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/status";

export type Perfil = {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  created_at: string;
};

export async function obterPerfil(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, nome, email, ativo, created_at")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function atualizarPerfil(userId: string, nome: string) {
  const { error } = await supabase.from("profiles").update({ nome: nome.trim() }).eq("id", userId);
  if (error) throw error;
}

export async function obterPapeis(userId: string): Promise<AppRole[]> {
  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((linha) => linha.role);
}

export type UsuarioAdmin = Perfil & { papeis: AppRole[] };

export async function listarUsuarios(): Promise<UsuarioAdmin[]> {
  const [{ data: perfis, error }, { data: papeis, error: erroPapeis }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, nome, email, ativo, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("user_roles").select("user_id, role"),
  ]);
  if (error) throw error;
  if (erroPapeis) throw erroPapeis;

  return (perfis ?? []).map((perfil) => ({
    ...perfil,
    papeis: (papeis ?? []).filter((p) => p.user_id === perfil.id).map((p) => p.role),
  }));
}

export async function definirPapel(userId: string, papel: AppRole) {
  const { error: erroRemocao } = await supabase.from("user_roles").delete().eq("user_id", userId);
  if (erroRemocao) throw erroRemocao;
  const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: papel });
  if (error) throw error;
}

export async function alternarAtivo(userId: string, ativo: boolean) {
  const { error } = await supabase.from("profiles").update({ ativo }).eq("id", userId);
  if (error) throw error;
}
