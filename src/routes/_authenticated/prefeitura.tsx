import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listarCategorias } from "@/services/categorias";
import { contarPorStatus, listarProblemas } from "@/services/problemas";
import { STATUS_CONFIG, STATUS_ORDEM, codigoProblema, formatarData, type ProblemaStatus } from "@/lib/status";
import { usePapeis } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/prefeitura")({
  head: () => ({
    meta: [
      { title: "Painel da prefeitura — Cuida Vicenciano" },
      {
        name: "description",
        content:
          "Fila de atendimento dos problemas urbanos registrados pelos moradores, com filtros por status e categoria.",
      },
      { property: "og:title", content: "Painel da prefeitura — Cuida Vicenciano" },
      {
        property: "og:description",
        content: "Gerencie a fila de atendimento das ocorrências da cidade.",
      },
    ],
  }),
  component: Prefeitura,
});

function Prefeitura() {
  const { ehGestor, isLoading: carregandoPapeis } = usePapeis();
  const [status, setStatus] = useState<ProblemaStatus | "todos">("todos");
  const [categoriaId, setCategoriaId] = useState("todas");

  const { data: categorias } = useQuery({
    queryKey: ["categorias", "ativas"],
    queryFn: () => listarCategorias(true),
  });

  const { data: problemas, isLoading } = useQuery({
    queryKey: ["problemas", "gestao", status, categoriaId],
    queryFn: () => listarProblemas({ status, categoriaId }),
    enabled: ehGestor,
  });

  const { data: todos } = useQuery({
    queryKey: ["problemas", "gestao", "total"],
    queryFn: () => listarProblemas({}),
    enabled: ehGestor,
  });
  const contagem = contarPorStatus(todos ?? []);

  if (carregandoPapeis) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Skeleton className="h-40 rounded-2xl" />
      </section>
    );
  }

  if (!ehGestor) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-foreground">Acesso restrito</h1>
        <p className="mt-2 text-muted-foreground">
          Esta área é exclusiva para as equipes da prefeitura. Fale com um administrador se você
          precisa desse acesso.
        </p>
        <Link to="/dashboard" className="mt-6 inline-block font-semibold text-primary">
          Voltar ao meu painel
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
        Painel da prefeitura
      </h1>
      <p className="mt-2 text-muted-foreground">
        Fila de atendimento de todas as ocorrências registradas na cidade.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total" valor={contagem.total} />
        <StatCard label="Recebidos" valor={contagem.recebido} destaque="text-recebido" />
        <StatCard label="Em análise" valor={contagem.em_analise} destaque="text-analise" />
        <StatCard label="Em andamento" valor={contagem.em_andamento} destaque="text-andamento" />
        <StatCard label="Resolvidos" valor={contagem.resolvido} destaque="text-resolvido" />
      </div>

      <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-card sm:flex-row">
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Status
          </label>
          <Select value={status} onValueChange={(valor) => setStatus(valor as typeof status)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              {STATUS_ORDEM.map((item) => (
                <SelectItem key={item} value={item}>
                  {STATUS_CONFIG[item].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Categoria
          </label>
          <Select value={categoriaId} onValueChange={setCategoriaId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as categorias</SelectItem>
              {(categorias ?? []).map((categoria) => (
                <SelectItem key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="mt-6 h-64 rounded-2xl" />
      ) : problemas && problemas.length > 0 ? (
        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-surface text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Código</th>
                <th className="px-4 py-3 font-semibold">Problema</th>
                <th className="hidden px-4 py-3 font-semibold md:table-cell">Categoria</th>
                <th className="hidden px-4 py-3 font-semibold sm:table-cell">Data</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {problemas.map((problema) => (
                <tr key={problema.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {codigoProblema(problema.id)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to="/problema/$id"
                      params={{ id: problema.id }}
                      className="font-semibold text-foreground hover:text-primary hover:underline"
                    >
                      {problema.titulo}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">
                      {problema.localizacao?.endereco || "Sem endereço informado"}
                    </p>
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {problema.categoria?.nome ?? "—"}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                    {formatarData(problema.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={problema.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-6 rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
          Nenhuma ocorrência encontrada com esses filtros.
        </p>
      )}
    </section>
  );
}
