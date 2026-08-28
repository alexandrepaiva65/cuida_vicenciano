import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProblemaCard } from "@/components/ProblemaCard";
import { listarMeusProblemas } from "@/services/problemas";
import { STATUS_CONFIG, STATUS_ORDEM, type ProblemaStatus } from "@/lib/status";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/meus-problemas")({
  head: () => ({
    meta: [
      { title: "Meus problemas registrados — Cuida Vicenciano" },
      {
        name: "description",
        content:
          "Lista completa das ocorrências que você registrou, com filtro por status e acesso ao histórico de cada atendimento.",
      },
      { property: "og:title", content: "Meus problemas registrados — Cuida Vicenciano" },
      {
        property: "og:description",
        content: "Veja todas as suas ocorrências e o andamento de cada uma.",
      },
    ],
  }),
  component: MeusProblemas,
});

function MeusProblemas() {
  const { user } = useAuth();
  const [filtro, setFiltro] = useState<ProblemaStatus | "todos">("todos");

  const { data: problemas, isLoading } = useQuery({
    queryKey: ["meus-problemas", user?.id],
    queryFn: () => listarMeusProblemas(user!.id),
    enabled: Boolean(user?.id),
  });

  const lista = (problemas ?? []).filter((p) => filtro === "todos" || p.status === filtro);

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Meus problemas</h1>
          <p className="mt-2 text-muted-foreground">
            {problemas?.length ?? 0} registros no total.
          </p>
        </div>
        <Button asChild>
          <Link to="/registrar">
            <Plus className="size-4" aria-hidden /> Novo registro
          </Link>
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {(["todos", ...STATUS_ORDEM] as const).map((item) => (
          <button
            key={item}
            onClick={() => setFiltro(item)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
              filtro === item
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary",
            )}
          >
            {item === "todos" ? "Todos" : STATUS_CONFIG[item].label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="mt-6 space-y-3">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      ) : lista.length > 0 ? (
        <div className="mt-6 space-y-3">
          {lista.map((problema) => (
            <ProblemaCard key={problema.id} problema={problema} />
          ))}
        </div>
      ) : (
        <p className="mt-6 rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
          Nenhum registro encontrado com esse filtro.
        </p>
      )}
    </section>
  );
}
