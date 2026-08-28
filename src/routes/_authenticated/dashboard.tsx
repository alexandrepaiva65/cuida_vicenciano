import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/StatCard";
import { ProblemaCard } from "@/components/ProblemaCard";
import { contarPorStatus, listarMeusProblemas } from "@/services/problemas";
import { useAuth, usePapeis, usePerfil } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Meu painel — Cuida Vicenciano" },
      {
        name: "description",
        content:
          "Resumo dos seus problemas registrados, status do atendimento e atalhos para registrar uma nova ocorrência.",
      },
      { property: "og:title", content: "Meu painel — Cuida Vicenciano" },
      {
        property: "og:description",
        content: "Acompanhe os seus registros e o andamento do atendimento.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const { data: perfil } = usePerfil();
  const { ehGestor } = usePapeis();

  const { data: problemas, isLoading } = useQuery({
    queryKey: ["meus-problemas", user?.id],
    queryFn: () => listarMeusProblemas(user!.id),
    enabled: Boolean(user?.id),
  });

  const contagem = contarPorStatus(problemas ?? []);
  const recentes = (problemas ?? []).slice(0, 4);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Olá, {perfil?.nome?.split(" ")[0] ?? "morador"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Acompanhe aqui tudo que você já registrou na cidade.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {ehGestor ? (
            <Button asChild variant="outline">
              <Link to="/prefeitura">Painel da prefeitura</Link>
            </Button>
          ) : null}
          <Button asChild className="shadow-brand">
            <Link to="/registrar">
              <Plus className="size-4" aria-hidden /> Registrar problema
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Meus registros" valor={contagem.total} />
        <StatCard label="Em análise" valor={contagem.em_analise} destaque="text-analise" />
        <StatCard label="Em andamento" valor={contagem.em_andamento} destaque="text-andamento" />
        <StatCard label="Resolvidos" valor={contagem.resolvido} destaque="text-resolvido" />
      </div>

      <div className="mt-10 flex items-end justify-between gap-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Registros recentes</h2>
        <Link
          to="/meus-problemas"
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          Ver todos <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>

      {isLoading ? (
        <div className="mt-4 space-y-3">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      ) : recentes.length > 0 ? (
        <div className="mt-4 space-y-3">
          {recentes.map((problema) => (
            <ProblemaCard key={problema.id} problema={problema} />
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <p className="text-muted-foreground">Você ainda não registrou nenhum problema.</p>
          <Button asChild className="mt-4">
            <Link to="/registrar">Registrar o primeiro</Link>
          </Button>
        </div>
      )}
    </section>
  );
}
