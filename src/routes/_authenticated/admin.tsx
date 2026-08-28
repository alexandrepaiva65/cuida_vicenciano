import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatCard } from "@/components/StatCard";
import {
  alternarAtivo,
  definirPapel,
  listarUsuarios,
  type UsuarioAdmin,
} from "@/services/perfil";
import {
  atualizarCategoria,
  criarCategoria,
  listarCategorias,
  type Categoria,
} from "@/services/categorias";
import { contarPorStatus, listarProblemas } from "@/services/problemas";
import { ROLE_LABEL, formatarData, type AppRole } from "@/lib/status";
import { usePapeis } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Administração — Cuida Vicenciano" },
      {
        name: "description",
        content:
          "Área administrativa para gerenciar usuários, permissões, categorias de problemas e indicadores gerais da cidade.",
      },
      { property: "og:title", content: "Administração — Cuida Vicenciano" },
      {
        property: "og:description",
        content: "Gerencie usuários, permissões e categorias do sistema.",
      },
    ],
  }),
  component: Admin,
});

const ABAS = ["indicadores", "usuarios", "categorias"] as const;
type Aba = (typeof ABAS)[number];
const ROTULOS: Record<Aba, string> = {
  indicadores: "Indicadores",
  usuarios: "Usuários",
  categorias: "Categorias",
};

function Admin() {
  const { ehAdmin, isLoading } = usePapeis();
  const [aba, setAba] = useState<Aba>("indicadores");

  if (isLoading) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Skeleton className="h-40 rounded-2xl" />
      </section>
    );
  }

  if (!ehAdmin) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-foreground">Acesso restrito</h1>
        <p className="mt-2 text-muted-foreground">
          Esta área é exclusiva para administradores do sistema.
        </p>
        <Link to="/dashboard" className="mt-6 inline-block font-semibold text-primary">
          Voltar ao meu painel
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Administração</h1>
      <p className="mt-2 text-muted-foreground">
        Gerencie usuários, permissões e as categorias de problemas da cidade.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {ABAS.map((item) => (
          <button
            key={item}
            onClick={() => setAba(item)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-semibold transition",
              aba === item
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary",
            )}
          >
            {ROTULOS[item]}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {aba === "indicadores" ? <Indicadores /> : null}
        {aba === "usuarios" ? <Usuarios /> : null}
        {aba === "categorias" ? <Categorias /> : null}
      </div>
    </section>
  );
}

function Indicadores() {
  const { data: problemas } = useQuery({
    queryKey: ["problemas", "admin", "total"],
    queryFn: () => listarProblemas({}),
  });
  const { data: usuarios } = useQuery({ queryKey: ["usuarios"], queryFn: listarUsuarios });
  const contagem = contarPorStatus(problemas ?? []);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Problemas" valor={contagem.total} />
      <StatCard label="Resolvidos" valor={contagem.resolvido} destaque="text-resolvido" />
      <StatCard label="Cancelados" valor={contagem.cancelado} destaque="text-cancelado" />
      <StatCard label="Usuários" valor={usuarios?.length ?? 0} />
    </div>
  );
}

function Usuarios() {
  const queryClient = useQueryClient();
  const { data: usuarios, isLoading } = useQuery({
    queryKey: ["usuarios"],
    queryFn: listarUsuarios,
  });

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ["usuarios"] });

  const mudarPapel = useMutation({
    mutationFn: ({ id, papel }: { id: string; papel: AppRole }) => definirPapel(id, papel),
    onSuccess: async () => {
      toast.success("Permissão atualizada.");
      await invalidar();
    },
    onError: () => toast.error("Não foi possível atualizar a permissão."),
  });

  const mudarAtivo = useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) => alternarAtivo(id, ativo),
    onSuccess: async () => {
      toast.success("Situação da conta atualizada.");
      await invalidar();
    },
    onError: () => toast.error("Não foi possível atualizar a conta."),
  });

  if (isLoading) return <Skeleton className="h-64 rounded-2xl" />;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-surface text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-semibold">Usuário</th>
            <th className="hidden px-4 py-3 font-semibold sm:table-cell">Desde</th>
            <th className="px-4 py-3 font-semibold">Permissão</th>
            <th className="px-4 py-3 font-semibold">Ativo</th>
          </tr>
        </thead>
        <tbody>
          {(usuarios ?? []).map((usuario: UsuarioAdmin) => (
            <tr key={usuario.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3">
                <p className="font-semibold text-foreground">{usuario.nome || "Sem nome"}</p>
                <p className="truncate text-xs text-muted-foreground">{usuario.email}</p>
              </td>
              <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                {formatarData(usuario.created_at)}
              </td>
              <td className="px-4 py-3">
                <Select
                  value={
                    usuario.papeis.includes("admin")
                      ? "admin"
                      : usuario.papeis.includes("prefeitura")
                        ? "prefeitura"
                        : "morador"
                  }
                  onValueChange={(valor) =>
                    mudarPapel.mutate({ id: usuario.id, papel: valor as AppRole })
                  }
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["morador", "prefeitura", "admin"] as AppRole[]).map((papel) => (
                      <SelectItem key={papel} value={papel}>
                        {ROLE_LABEL[papel]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </td>
              <td className="px-4 py-3">
                <Switch
                  checked={usuario.ativo}
                  onCheckedChange={(valor) =>
                    mudarAtivo.mutate({ id: usuario.id, ativo: valor })
                  }
                  aria-label="Conta ativa"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Categorias() {
  const queryClient = useQueryClient();
  const [nome, setNome] = useState("");

  const { data: categorias, isLoading } = useQuery({
    queryKey: ["categorias", "todas"],
    queryFn: () => listarCategorias(false),
  });

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ["categorias"] });

  const criar = useMutation({
    mutationFn: () => criarCategoria(nome),
    onSuccess: async () => {
      toast.success("Categoria criada.");
      setNome("");
      await invalidar();
    },
    onError: () => toast.error("Não foi possível criar a categoria."),
  });

  const alternar = useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) =>
      atualizarCategoria(id, { ativo }),
    onSuccess: invalidar,
    onError: () => toast.error("Não foi possível atualizar a categoria."),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-card sm:flex-row">
        <Input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome da nova categoria"
        />
        <Button onClick={() => criar.mutate()} disabled={nome.trim().length < 3 || criar.isPending}>
          Adicionar categoria
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-48 rounded-2xl" />
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          {(categorias ?? []).map((categoria: Categoria) => (
            <li key={categoria.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <span
                className={cn(
                  "font-medium",
                  categoria.ativo ? "text-foreground" : "text-muted-foreground line-through",
                )}
              >
                {categoria.nome}
              </span>
              <Switch
                checked={categoria.ativo}
                onCheckedChange={(valor) =>
                  alternar.mutate({ id: categoria.id, ativo: valor })
                }
                aria-label={`Categoria ${categoria.nome} ativa`}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
