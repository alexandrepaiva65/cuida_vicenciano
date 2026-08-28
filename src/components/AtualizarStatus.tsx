import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { atualizarStatus, type Problema } from "@/services/problemas";
import { STATUS_CONFIG, STATUS_ORDEM, type ProblemaStatus } from "@/lib/status";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

/** Painel de gestão do status — visível apenas para prefeitura e administradores. */
export function AtualizarStatus({
  problema,
  className,
}: {
  problema: Problema;
  className?: string | undefined;
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<ProblemaStatus>(problema.status);
  const [observacao, setObservacao] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      atualizarStatus({
        problemaId: problema.id,
        statusAnterior: problema.status,
        status,
        observacao,
        autorId: user!.id,
      }),
    onSuccess: async () => {
      toast.success("Status atualizado e morador notificado.");
      setObservacao("");
      await queryClient.invalidateQueries({ queryKey: ["problema", problema.id] });
      await queryClient.invalidateQueries({ queryKey: ["historico", problema.id] });
      await queryClient.invalidateQueries({ queryKey: ["problemas"] });
    },
    onError: (erro) =>
      toast.error(erro instanceof Error ? erro.message : "Não foi possível atualizar o status."),
  });

  return (
    <div className={cn("rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8", className)}>
      <h2 className="text-lg font-bold text-foreground">Atualizar atendimento</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        A mudança de status gera uma notificação automática para quem registrou.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="status">Novo status</Label>
          <Select value={status} onValueChange={(valor) => setStatus(valor as ProblemaStatus)}>
            <SelectTrigger id="status" className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_ORDEM.map((item) => (
                <SelectItem key={item} value={item}>
                  {STATUS_CONFIG[item].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4">
        <Label htmlFor="observacao">Observação (opcional)</Label>
        <Textarea
          id="observacao"
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          placeholder="Ex.: equipe de manutenção agendada para quinta-feira."
          rows={3}
          className="mt-1.5"
        />
      </div>

      <Button
        className="mt-4"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending || (status === problema.status && !observacao.trim())}
      >
        {mutation.isPending ? "Salvando…" : "Salvar atualização"}
      </Button>
    </div>
  );
}
