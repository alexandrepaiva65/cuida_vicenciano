import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin } from "lucide-react";

import { ImagemProblema } from "@/components/ImagemProblema";
import { StatusBadge } from "@/components/StatusBadge";
import { AtualizarStatus } from "@/components/AtualizarStatus";
import { Skeleton } from "@/components/ui/skeleton";
import { listarHistorico, obterProblema } from "@/services/problemas";
import { codigoProblema, formatarDataHora, STATUS_CONFIG } from "@/lib/status";
import { useAuth, usePapeis } from "@/hooks/useAuth";

export const Route = createFileRoute("/problema/$id")({
  head: () => ({
    meta: [
      { title: "Detalhes do problema — Cuida Vicenciano" },
      {
        name: "description",
        content:
          "Acompanhe a descrição, a localização e o histórico completo de atendimento de um problema urbano registrado na cidade.",
      },
      { property: "og:title", content: "Detalhes do problema — Cuida Vicenciano" },
      {
        property: "og:description",
        content: "Descrição, localização e histórico de atendimento da ocorrência.",
      },
    ],
  }),
  component: DetalheProblema,
});

function DetalheProblema() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const { ehGestor } = usePapeis();

  const { data: problema, isLoading } = useQuery({
    queryKey: ["problema", id],
    queryFn: () => obterProblema(id),
  });

  const { data: historico } = useQuery({
    queryKey: ["historico", id],
    queryFn: () => listarHistorico(id),
  });

  if (isLoading) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <Skeleton className="h-64 rounded-2xl" />
      </section>
    );
  }

  if (!problema) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-foreground">Problema não encontrado</h1>
        <p className="mt-2 text-muted-foreground">
          Este registro pode ter sido removido ou o endereço está incorreto.
        </p>
        <Link to="/problemas-cidade" className="mt-6 inline-block font-semibold text-primary">
          Ver problemas da cidade
        </Link>
      </section>
    );
  }

  const ehAutor = user?.id === problema.user_id;

  return (
    <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link
        to="/problemas-cidade"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden /> Voltar
      </Link>

      <div className="mt-5 rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={problema.status} />
          <span className="font-mono text-xs text-muted-foreground">
            {codigoProblema(problema.id)}
          </span>
        </div>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          {problema.titulo}
        </h1>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="font-semibold text-primary">
            {problema.categoria?.nome ?? "Sem categoria"}
          </span>
          <span>Registrado em {formatarDataHora(problema.created_at)}</span>
        </div>

        <p className="mt-6 whitespace-pre-line text-foreground/90">{problema.descricao}</p>

        {problema.localizacao ? (
          <div className="mt-6 rounded-2xl border border-border bg-surface p-4">
            <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <MapPin className="size-4 text-primary" aria-hidden /> Localização
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{problema.localizacao.endereco}</p>
            {problema.localizacao.latitude != null && problema.localizacao.longitude != null ? (
              <a
                href={`https://www.google.com/maps?q=${problema.localizacao.latitude},${problema.localizacao.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-xs font-semibold text-primary hover:underline"
              >
                Abrir no mapa
              </a>
            ) : null}
          </div>
        ) : null}

        {problema.imagens.length > 0 ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {problema.imagens.map((imagem) => (
              <ImagemProblema
                key={imagem.id}
                caminho={imagem.url}
                alt={`Foto do problema: ${problema.titulo}`}
                className="aspect-video w-full rounded-2xl border border-border"
              />
            ))}
          </div>
        ) : null}
      </div>

      {ehGestor ? (
        <AtualizarStatus problema={problema} className="mt-6" />
      ) : ehAutor ? (
        <p className="mt-6 rounded-2xl border border-border bg-primary-soft p-4 text-sm text-primary">
          Você registrou esta ocorrência. Cada atualização da prefeitura gera uma notificação para
          você.
        </p>
      ) : null}

      <div className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
        <h2 className="text-lg font-bold text-foreground">Histórico de atendimento</h2>
        {historico && historico.length > 0 ? (
          <ol className="mt-5 space-y-4">
            {historico.map((item) => (
              <li key={item.id} className="flex gap-4">
                <span
                  className={`mt-1.5 size-2.5 shrink-0 rounded-full ${STATUS_CONFIG[item.status_novo].badge}`}
                  aria-hidden
                />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {item.status_anterior
                      ? `${STATUS_CONFIG[item.status_anterior].label} → ${STATUS_CONFIG[item.status_novo].label}`
                      : STATUS_CONFIG[item.status_novo].label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatarDataHora(item.created_at)}
                  </p>
                  {item.observacao ? (
                    <p className="mt-1 text-sm text-foreground/80">{item.observacao}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            Nenhuma atualização registrada até o momento.
          </p>
        )}
      </div>
    </section>
  );
}
