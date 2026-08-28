import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { atualizarPerfil } from "@/services/perfil";
import { ROLE_LABEL, formatarData } from "@/lib/status";
import { useAuth, usePapeis, usePerfil } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({
    meta: [
      { title: "Meu perfil — Cuida Vicenciano" },
      {
        name: "description",
        content: "Atualize seu nome de exibição e confira os dados da sua conta no Cuida Vicenciano.",
      },
      { property: "og:title", content: "Meu perfil — Cuida Vicenciano" },
      { property: "og:description", content: "Dados da sua conta de morador." },
    ],
  }),
  component: Perfil,
});

function Perfil() {
  const { user } = useAuth();
  const { data: perfil } = usePerfil();
  const { papelPrincipal } = usePapeis();
  const queryClient = useQueryClient();
  const [nome, setNome] = useState("");

  useEffect(() => {
    if (perfil?.nome) setNome(perfil.nome);
  }, [perfil?.nome]);

  const mutation = useMutation({
    mutationFn: () => atualizarPerfil(user!.id, nome),
    onSuccess: async () => {
      toast.success("Perfil atualizado.");
      await queryClient.invalidateQueries({ queryKey: ["perfil", user?.id] });
    },
    onError: () => toast.error("Não foi possível atualizar o perfil."),
  });

  return (
    <section className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Meu perfil</h1>
      <p className="mt-2 text-muted-foreground">Seus dados de acesso ao Cuida Vicenciano.</p>

      <div className="mt-8 space-y-5 rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
        <div>
          <Label htmlFor="nome">Nome completo</Label>
          <Input
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="mt-1.5"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              E-mail
            </p>
            <p className="mt-1 truncate text-sm text-foreground">{perfil?.email ?? user?.email}</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Perfil de acesso
            </p>
            <p className="mt-1 text-sm text-foreground">{ROLE_LABEL[papelPrincipal]}</p>
          </div>
          {perfil?.created_at ? (
            <div className="rounded-2xl border border-border bg-surface p-4 sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Conta criada em
              </p>
              <p className="mt-1 text-sm text-foreground">{formatarData(perfil.created_at)}</p>
            </div>
          ) : null}
        </div>

        <Button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || nome.trim().length < 3 || nome === perfil?.nome}
        >
          {mutation.isPending ? "Salvando…" : "Salvar alterações"}
        </Button>
      </div>
    </section>
  );
}
