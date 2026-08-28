import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/redefinir-senha")({
  head: () => ({
    meta: [
      { title: "Criar nova senha — Cuida Vicenciano" },
      {
        name: "description",
        content: "Defina uma nova senha para a sua conta do Cuida Vicenciano.",
      },
      { property: "og:title", content: "Criar nova senha — Cuida Vicenciano" },
      { property: "og:description", content: "Defina uma nova senha para acessar sua conta." },
    ],
  }),
  component: RedefinirSenha,
});

function RedefinirSenha() {
  const navigate = useNavigate();
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    if (senha !== confirmacao) {
      toast.error("As senhas não coincidem.");
      return;
    }
    setEnviando(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: senha });
      if (error) throw error;
      toast.success("Senha atualizada com sucesso.");
      navigate({ to: "/dashboard", replace: true });
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível atualizar a senha.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="mx-auto max-w-md px-4 py-14 sm:px-6">
      <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Criar nova senha</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Abra esta página pelo link enviado no seu e-mail para poder definir a nova senha.
      </p>
      <form
        onSubmit={enviar}
        className="mt-8 space-y-4 rounded-2xl border border-border bg-card p-6 shadow-card"
      >
        <div>
          <Label htmlFor="senha">Nova senha</Label>
          <Input
            id="senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            minLength={6}
            required
            autoComplete="new-password"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="confirmacao">Confirmar nova senha</Label>
          <Input
            id="confirmacao"
            type="password"
            value={confirmacao}
            onChange={(e) => setConfirmacao(e.target.value)}
            minLength={6}
            required
            autoComplete="new-password"
            className="mt-1.5"
          />
        </div>
        <Button type="submit" className="w-full" disabled={enviando}>
          {enviando ? "Salvando…" : "Salvar nova senha"}
        </Button>
      </form>
    </section>
  );
}
