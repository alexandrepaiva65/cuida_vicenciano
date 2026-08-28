import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, LogOut, Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth, usePapeis, usePerfil, sair } from "@/hooks/useAuth";
import { listarNotificacoes } from "@/services/notificacoes";
import { ROLE_LABEL } from "@/lib/status";
import { cn } from "@/lib/utils";

const linkBase =
  "text-sm font-medium text-muted-foreground transition-colors hover:text-primary data-[status=active]:text-primary";

export function SiteHeader() {
  const { user } = useAuth();
  const { ehGestor, ehAdmin, papelPrincipal } = usePapeis();
  const { data: perfil } = usePerfil();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [aberto, setAberto] = useState(false);

  const { data: notificacoes } = useQuery({
    queryKey: ["notificacoes", user?.id],
    queryFn: () => listarNotificacoes(user!.id),
    enabled: Boolean(user?.id),
  });
  const naoLidas = (notificacoes ?? []).filter((n) => !n.lida).length;

  async function handleSair() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await sair();
    setAberto(false);
    navigate({ to: "/", replace: true });
  }

  const links = user
    ? [
        { to: "/dashboard", label: "Painel" },
        { to: "/meus-problemas", label: "Meus problemas" },
        { to: "/problemas-cidade", label: "Problemas da cidade" },
        ...(ehGestor ? [{ to: "/prefeitura", label: "Prefeitura" }] : []),
        ...(ehAdmin ? [{ to: "/admin", label: "Administração" }] : []),
      ]
    : [
        { to: "/", label: "Início" },
        { to: "/problemas-cidade", label: "Problemas da cidade" },
        { to: "/sobre", label: "Sobre" },
      ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2" onClick={() => setAberto(false)}>
          <span className="grid size-9 place-items-center rounded-lg bg-primary font-bold tracking-tighter text-primary-foreground">
            CV
          </span>
          <span className="text-base font-bold uppercase tracking-tight text-foreground sm:text-lg">
            Cuida Vicenciano
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <Link key={link.to} to={link.to} className={linkBase}>
              {link.label}
            </Link>
          ))}
          <span className="h-4 w-px bg-border" aria-hidden />
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/notificacoes"
                className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:text-primary"
                aria-label="Notificações"
              >
                <Bell className="size-4" aria-hidden />
                {naoLidas > 0 ? (
                  <span className="absolute -top-0.5 -right-0.5 grid size-4 place-items-center rounded-full bg-accent text-[9px] font-bold text-accent-foreground">
                    {naoLidas}
                  </span>
                ) : null}
              </Link>
              <Link to="/perfil" className="text-right leading-tight">
                <span className="block text-sm font-semibold text-foreground">
                  {perfil?.nome || "Meu perfil"}
                </span>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {ROLE_LABEL[papelPrincipal]}
                </span>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleSair} aria-label="Sair">
                <LogOut className="size-4" aria-hidden />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/auth" search={{ modo: "entrar" }} className={linkBase}>
                Entrar
              </Link>
              <Button asChild className="rounded-full">
                <Link to="/auth" search={{ modo: "cadastrar" }}>
                  Cadastrar
                </Link>
              </Button>
            </div>
          )}
        </nav>

        <button
          className="rounded-lg p-2 text-foreground lg:hidden"
          onClick={() => setAberto((v) => !v)}
          aria-label={aberto ? "Fechar menu" : "Abrir menu"}
        >
          {aberto ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
        </button>
      </div>

      <div
        className={cn(
          "border-t border-border bg-card px-4 pb-4 lg:hidden",
          aberto ? "block" : "hidden",
        )}
      >
        <nav className="flex flex-col gap-1 pt-3">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setAberto(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground data-[status=active]:bg-primary-soft data-[status=active]:text-primary"
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link
                to="/notificacoes"
                onClick={() => setAberto(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground"
              >
                Notificações {naoLidas > 0 ? `(${naoLidas})` : ""}
              </Link>
              <Link
                to="/perfil"
                onClick={() => setAberto(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground"
              >
                Perfil
              </Link>
              <Button variant="outline" className="mt-2" onClick={handleSair}>
                Sair
              </Button>
            </>
          ) : (
            <div className="mt-3 flex flex-col gap-2">
              <Button asChild variant="outline">
                <Link to="/auth" search={{ modo: "entrar" }} onClick={() => setAberto(false)}>
                  Entrar
                </Link>
              </Button>
              <Button asChild>
                <Link to="/auth" search={{ modo: "cadastrar" }} onClick={() => setAberto(false)}>
                  Cadastrar
                </Link>
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
