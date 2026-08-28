import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CheckCircle2, Camera, ListChecks, MapPin } from "lucide-react";

import heroImagem from "@/assets/igrajaSV.jpeg";
import { Button } from "@/components/ui/button";
import { ProblemaCardPublico } from "@/components/ProblemaCard";
import { StatCard } from "@/components/StatCard";
import { contarPorStatus, listarProblemas } from "@/services/problemas";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cuida Vicenciano — Registre problemas urbanos da cidade" },
      {
        name: "description",
        content:
          "Moradores de São Vicente de Minas registram buracos, iluminação, lixo e outros problemas urbanos e acompanham o atendimento da prefeitura.",
      },
      { property: "og:title", content: "Cuida Vicenciano — Registre problemas urbanos" },
      {
        property: "og:description",
        content:
          "Registre um problema urbano com foto e localização e acompanhe cada etapa até a resolução.",
      },
    ],
  }),
  component: Home,
});

const PASSOS = [
  {
    icone: Camera,
    titulo: "Registre com foto",
    texto: "Escolha a categoria, descreva o que aconteceu e anexe uma foto do local.",
  },
  {
    icone: MapPin,
    titulo: "Informe o local",
    texto: "Endereço ou ponto de referência para a equipe encontrar o problema.",
  },
  {
    icone: ListChecks,
    titulo: "Acompanhe o status",
    texto: "Recebido, em análise, em andamento e resolvido — com histórico completo.",
  },
  {
    icone: CheckCircle2,
    titulo: "Receba a resposta",
    texto: "Você é notificado a cada atualização feita pela prefeitura.",
  },
];

function Home() {
  const { user } = useAuth();
  const { data: problemas } = useQuery({
    queryKey: ["problemas", "publicos", "home"],
    queryFn: () => listarProblemas({ limite: 6 }),
  });

  const contagem = contarPorStatus(problemas ?? []);

  return (
    <>
      <section className="border-b border-border bg-surface">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
              São Vicente de Minas · MG
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
              A cidade cuidada por quem mora nela.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Registre buracos na via, iluminação queimada, lixo acumulado ou qualquer problema
              urbano. A prefeitura recebe, analisa e você acompanha cada etapa até a resolução.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full shadow-brand">
                {user ? (
                  <Link to="/registrar">
                    Registrar um problema
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                ) : (
                  <Link to="/auth" search={{ modo: "cadastrar" }}>
                    Registrar um problema
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                )}
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full">
                <Link to="/problemas-cidade">Ver problemas da cidade</Link>
              </Button>
            </div>
          </div>
          <div className="overflow-hidden rounded-3xl border border-border shadow-elevated">
            <img
              src={heroImagem}
              alt="Vista das ruas e montanhas de São Vicente de Minas"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Problemas registrados" valor={contagem.total} />
          <StatCard label="Em análise" valor={contagem.em_analise} destaque="text-analise" />
          <StatCard label="Em andamento" valor={contagem.em_andamento} destaque="text-andamento" />
          <StatCard label="Resolvidos" valor={contagem.resolvido} destaque="text-resolvido" />
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Como funciona
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Quatro passos simples, do registro à resposta oficial.
          </p>
          <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PASSOS.map((passo, indice) => (
              <li key={passo.titulo} className="rounded-2xl border border-border bg-surface p-5">
                <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary">
                  <passo.icone className="size-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-bold text-foreground">
                  {indice + 1}. {passo.titulo}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{passo.texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Problemas recentes
            </h2>
            <p className="mt-2 text-muted-foreground">
              Registros públicos da cidade — sem exibir dados pessoais de quem registrou.
            </p>
          </div>
          <Link
            to="/problemas-cidade"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            Ver todos <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        {problemas && problemas.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {problemas.map((problema) => (
              <ProblemaCardPublico key={problema.id} problema={problema} />
            ))}
          </div>
        ) : (
          <p className="mt-8 rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
            Nenhum problema registrado ainda. Seja o primeiro a contribuir com a cidade.
          </p>
        )}
      </section>
    </>
  );
}
