import { Link } from "@tanstack/react-router";
import { ArrowRight, MapPin } from "lucide-react";

import { StatusBadge } from "@/components/StatusBadge";
import { ImagemProblema } from "@/components/ImagemProblema";
import { codigoProblema, formatarData } from "@/lib/status";
import type { Problema } from "@/services/problemas";

/** Card usado em "Meus problemas" e no painel do morador (com foto). */
export function ProblemaCard({ problema }: { problema: Problema }) {
  return (
    <Link
      to="/problema/$id"
      params={{ id: problema.id }}
      className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-card transition hover:border-primary/40 hover:shadow-elevated sm:flex-row sm:items-center sm:gap-6 sm:p-5"
    >
      <ImagemProblema
        caminho={problema.imagens[0]?.url}
        alt={problema.titulo}
        className="h-32 w-full shrink-0 rounded-xl sm:size-20"
      />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <h4 className="truncate font-bold text-card-foreground">{problema.titulo}</h4>
          <StatusBadge status={problema.status} />
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">{problema.descricao}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="font-medium">{problema.categoria?.nome ?? "Sem categoria"}</span>
          <span aria-hidden>•</span>
          <span>{formatarData(problema.created_at)}</span>
          {problema.localizacao?.endereco ? (
            <>
              <span aria-hidden>•</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3" aria-hidden />
                {problema.localizacao.endereco}
              </span>
            </>
          ) : null}
          <span aria-hidden>•</span>
          <span className="font-mono">{codigoProblema(problema.id)}</span>
        </div>
      </div>
      <span className="hidden rounded-lg border border-border p-2 text-muted-foreground transition group-hover:border-primary/40 group-hover:text-primary sm:block">
        <ArrowRight className="size-4" aria-hidden />
      </span>
    </Link>
  );
}

/** Card público — não expõe nenhum dado pessoal de quem registrou. */
export function ProblemaCardPublico({ problema }: { problema: Problema }) {
  return (
    <Link
      to="/problema/$id"
      params={{ id: problema.id }}
      className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-card transition hover:border-primary/40 hover:shadow-elevated"
    >
      <StatusBadge status={problema.status} className="mb-4 self-start" />
      <h4 className="font-bold text-card-foreground">{problema.titulo}</h4>
      <p className="mt-1 text-sm text-muted-foreground">
        {problema.localizacao?.endereco || "Localização não informada"}
      </p>
      <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-[11px] text-muted-foreground">
        <span>{formatarData(problema.created_at)}</span>
        <span className="uppercase tracking-tight">
          {problema.categoria?.nome ?? "Sem categoria"}
        </span>
      </div>
    </Link>
  );
}
