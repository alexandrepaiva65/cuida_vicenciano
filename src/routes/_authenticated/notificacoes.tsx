import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BellRing } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { listarNotificacoes, marcarComoLida, marcarTodasComoLidas } from "@/services/notificacoes";
import { formatarDataHora } from "@/lib/status";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/notificacoes")({
  head: () => ({
    meta: [
      { title: "Minhas notificações — Cuida Vicenciano" },
      {
        name: "description",
        content:
          "Todas as atualizações da prefeitura sobre os problemas urbanos que você registrou, em ordem cronológica.",
      },
      { property: "og:title", content: "Minhas notificações — Cuida Vicenciano" },
      {
        property: "og:description",
        content: "Acompanhe as atualizações dos seus registros.",
      },
    ],
  }),
  component: Notificacoes,
});

function Notificacoes() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notificacoes, isLoading } = useQuery({
    queryKey: ["notificacoes", user?.id],
    queryFn: () => listarNotificacoes(user!.id),
    enabled: Boolean(user?.id),
  });

  const invalidar = () =>
    queryClient.invalidateQueries({ queryKey: ["notificacoes", user?.id] });

  const lerUma = useMutation({ mutationFn: marcarComoLida, onSuccess: invalidar });
  const lerTodas = useMutation({
    mutationFn: () => marcarTodasComoLidas(user!.id),
    onSuccess: invalidar,
  });

  const naoLidas = (notificacoes ?? []).filter((n) => !n.lida).length;

  return (
    <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Notificações</h1>
          <p className="mt-2 text-muted-foreground">
            {naoLidas > 0 ? `${naoLidas} não lidas` : "Tudo em dia por aqui."}
          </p>
        </div>
        {naoLidas > 0 ? (
          <Button variant="outline" onClick={() => lerTodas.mutate()} disabled={lerTodas.isPending}>
            Marcar todas como lidas
          </Button>
        ) : null}
      </div>

      {isLoading ? (
        <div className="mt-6 space-y-3">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
      ) : notificacoes && notificacoes.length > 0 ? (
        <ul className="mt-6 space-y-3">
          {notificacoes.map((notificacao) => (
            <li
              key={notificacao.id}
              className={cn(
                "rounded-2xl border p-4 shadow-card",
                notificacao.lida
                  ? "border-border bg-card"
                  : "border-primary/30 bg-primary-soft",
              )}
            >
              <div className="flex items-start gap-3">
                <BellRing
                  className={cn(
                    "mt-0.5 size-4 shrink-0",
                    notificacao.lida ? "text-muted-foreground" : "text-primary",
                  )}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{notificacao.mensagem}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatarDataHora(notificacao.created_at)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-4 text-xs font-semibold">
                    {notificacao.problema_id ? (
                      <Link
                        to="/problema/$id"
                        params={{ id: notificacao.problema_id }}
                        className="text-primary hover:underline"
                      >
                        Ver problema
                      </Link>
                    ) : null}
                    {!notificacao.lida ? (
                      <button
                        onClick={() => lerUma.mutate(notificacao.id)}
                        className="text-muted-foreground hover:underline"
                      >
                        Marcar como lida
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
          Você ainda não tem notificações.
        </p>
      )}
    </section>
  );
}
