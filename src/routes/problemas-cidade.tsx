import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { ProblemaCardPublico } from "@/components/ProblemaCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { listarCategorias } from "@/services/categorias";
import { listarProblemas } from "@/services/problemas";
import { STATUS_CONFIG, STATUS_ORDEM, type ProblemaStatus } from "@/lib/status";

export const Route = createFileRoute("/problemas-cidade")({
  head: () => ({
    meta: [
      { title: "Problemas da cidade — Cuida Vicenciano" },
      {
        name: "description",
        content:
          "Lista pública dos problemas urbanos registrados em São Vicente de Minas, com filtros por status e categoria.",
      },
      { property: "og:title", content: "Problemas da cidade — Cuida Vicenciano" },
      {
        property: "og:description",
        content: "Acompanhe os problemas urbanos registrados na cidade e seus status.",
      },
    ],
  }),
  component: ProblemasCidade,
});

function ProblemasCidade() {
  const [status, setStatus] = useState<ProblemaStatus | "todos">("todos");
  const [categoriaId, setCategoriaId] = useState<string>("todas");

  const { data: categorias } = useQuery({
    queryKey: ["categorias", "ativas"],
    queryFn: () => listarCategorias(true),
  });

  const { data: problemas, isLoading } = useQuery({
    queryKey: ["problemas", "publicos", status, categoriaId],
    queryFn: () => listarProblemas({ status, categoriaId }),
  });

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        Problemas da cidade
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Todos os registros são públicos para dar transparência ao atendimento. Nenhum dado pessoal de
        quem registrou é exibido.
      </p>

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
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : problemas && problemas.length > 0 ? (
        <>
          <p className="mt-8 text-sm text-muted-foreground">
            {problemas.length} {problemas.length === 1 ? "problema" : "problemas"} encontrados
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {problemas.map((problema) => (
              <ProblemaCardPublico key={problema.id} problema={problema} />
            ))}
          </div>
        </>
      ) : (
        <p className="mt-8 rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
          Nenhum problema encontrado com esses filtros.
        </p>
      )}
    </section>
  );
}
