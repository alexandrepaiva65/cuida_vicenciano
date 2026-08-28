import type { Database } from "@/integrations/supabase/types";

export type ProblemaStatus = Database["public"]["Enums"]["problema_status"];
export type AppRole = Database["public"]["Enums"]["app_role"];

/** Ordem do fluxo: Recebido -> Em análise -> Em andamento -> Resolvido (+ Cancelado). */
export const STATUS_ORDEM: ProblemaStatus[] = [
  "recebido",
  "em_analise",
  "em_andamento",
  "resolvido",
  "cancelado",
];

type StatusConfig = {
  label: string;
  /** Classes do design system (tokens semânticos, nunca cores fixas). */
  badge: string;
  texto: string;
  descricao: string;
};

export const STATUS_CONFIG: Record<ProblemaStatus, StatusConfig> = {
  recebido: {
    label: "Recebido",
    badge: "bg-recebido-soft text-recebido",
    texto: "text-recebido",
    descricao: "Aguardando análise inicial",
  },
  em_analise: {
    label: "Em análise",
    badge: "bg-analise-soft text-analise",
    texto: "text-analise",
    descricao: "A prefeitura está avaliando",
  },
  em_andamento: {
    label: "Em andamento",
    badge: "bg-andamento-soft text-andamento",
    texto: "text-andamento",
    descricao: "Equipes trabalhando no local",
  },
  resolvido: {
    label: "Resolvido",
    badge: "bg-resolvido-soft text-resolvido",
    texto: "text-resolvido",
    descricao: "Problemas concluídos",
  },
  cancelado: {
    label: "Cancelado",
    badge: "bg-cancelado-soft text-cancelado",
    texto: "text-cancelado",
    descricao: "Solicitação encerrada",
  },
};

export const ROLE_LABEL: Record<AppRole, string> = {
  morador: "Morador",
  prefeitura: "Prefeitura",
  admin: "Administrador",
};

export function statusLabel(status: ProblemaStatus) {
  return STATUS_CONFIG[status].label;
}

export function formatarData(valor: string) {
  return new Date(valor).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatarDataHora(valor: string) {
  return new Date(valor).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Código curto e legível da ocorrência, derivado do uuid. */
export function codigoProblema(id: string) {
  return `SV-${id.slice(0, 6).toUpperCase()}`;
}
