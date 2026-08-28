import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { STATUS_CONFIG, STATUS_ORDEM } from "@/lib/status";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre o Cuida Vicenciano — Como o atendimento funciona" },
      {
        name: "description",
        content:
          "Entenda o objetivo do Cuida Vicenciano, o fluxo de atendimento dos problemas urbanos e o papel de moradores, prefeitura e administradores.",
      },
      { property: "og:title", content: "Sobre o Cuida Vicenciano" },
      {
        property: "og:description",
        content: "O fluxo de atendimento dos problemas urbanos de São Vicente de Minas.",
      },
    ],
  }),
  component: Sobre,
});

const PERFIS = [
  {
    titulo: "Morador",
    texto:
      "Cria seu cadastro, registra problemas com foto e localização, acompanha o status e recebe notificações a cada atualização.",
  },
  {
    titulo: "Prefeitura",
    texto:
      "Visualiza todos os problemas, filtra por status e categoria, atualiza o andamento e registra observações no histórico.",
  },
  {
    titulo: "Administrador",
    texto:
      "Gerencia usuários e permissões, mantém as categorias de problemas e acompanha os indicadores gerais da cidade.",
  },
];

function Sobre() {
  return (
    <>
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:py-20">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Sobre o projeto
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Um canal direto entre o morador e a prefeitura
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            O Cuida Vicenciano centraliza os problemas urbanos de São Vicente de Minas em um único
            lugar. Em vez de recados soltos, cada ocorrência recebe um registro, um responsável e um
            histórico visível — o que dá transparência para o morador e organização para a gestão
            pública.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          O fluxo de atendimento
        </h2>
        <ol className="mt-6 space-y-3">
          {STATUS_ORDEM.map((status) => (
            <li
              key={status}
              className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-card"
            >
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${STATUS_CONFIG[status].badge}`}
              >
                {STATUS_CONFIG[status].label}
              </span>
              <span className="text-sm text-muted-foreground">
                {STATUS_CONFIG[status].descricao}
              </span>
            </li>
          ))}
        </ol>

        <h2 className="mt-14 text-2xl font-bold tracking-tight text-foreground">
          Quem usa o sistema
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {PERFIS.map((perfil) => (
            <div
              key={perfil.titulo}
              className="rounded-2xl border border-border bg-card p-5 shadow-card"
            >
              <h3 className="font-bold text-foreground">{perfil.titulo}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{perfil.texto}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-3xl border border-border bg-primary p-8 text-center shadow-brand">
          <h2 className="text-2xl font-bold tracking-tight text-primary-foreground">
            Viu um problema na rua?
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-primary-foreground/80">
            Crie sua conta gratuitamente e registre a ocorrência em menos de dois minutos.
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-6 rounded-full">
            <Link to="/auth" search={{ modo: "cadastrar" }}>
              Criar minha conta
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
