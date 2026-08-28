import { supabase } from "@/integrations/supabase/client";

export type Notificacao = {
  id: string;
  mensagem: string;
  lida: boolean;
  created_at: string;
  problema_id: string | null;
};

export async function listarNotificacoes(userId: string): Promise<Notificacao[]> {
  const { data, error } = await supabase
    .from("notificacoes")
    .select("id, mensagem, lida, created_at, problema_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function marcarComoLida(id: string) {
  const { error } = await supabase.from("notificacoes").update({ lida: true }).eq("id", id);
  if (error) throw error;
}

export async function marcarTodasComoLidas(userId: string) {
  const { error } = await supabase
    .from("notificacoes")
    .update({ lida: true })
    .eq("user_id", userId)
    .eq("lida", false);
  if (error) throw error;
}
