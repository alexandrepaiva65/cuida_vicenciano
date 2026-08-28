import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";

const buscaSchema = z.object({
  modo: z.enum(["entrar", "cadastrar", "recuperar"]).catch("entrar"),
});

export const Route = createFileRoute("/auth")({
  validateSearch: buscaSchema,
  head: () => ({
    meta: [
      { title: "Entrar ou criar conta — Cuida Vicenciano" },
      {
        name: "description",
        content:
          "Acesse sua conta do Cuida Vicenciano para registrar problemas urbanos e acompanhar o atendimento da prefeitura.",
      },
      { property: "og:title", content: "Entrar ou criar conta — Cuida Vicenciano" },
      {
        property: "og:description",
        content: "Crie sua conta de morador e registre problemas urbanos da cidade.",
      },
    ],
  }),
  component: Auth,
});

function Auth() {
  const { modo } = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/dashboard", replace: true });
  }, [user, navigate]);

  function trocarModo(novo: "entrar" | "cadastrar" | "recuperar") {
    navigate({ to: "/auth", search: { modo: novo } });
  }

  async function entrarComGoogle() {
    const resultado = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (resultado.error) {
      toast.error("Não foi possível entrar com o Google.");
      return;
    }
    if (resultado.redirected) return;
    navigate({ to: "/dashboard", replace: true });
  }

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setEnviando(true);
    try {
      if (modo === "cadastrar") {
        if (nome.trim().length < 3) {
          toast.error("Informe seu nome completo.");
          return;
        }
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password: senha,
          options: {
            data: { nome: nome.trim() },
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });
        if (error) throw error;
        toast.success("Conta criada! Verifique seu e-mail para confirmar o acesso.");
        trocarModo("entrar");
        return;
      }

      if (modo === "recuperar") {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/redefinir-senha`,
        });
        if (error) throw error;
        toast.success("Enviamos um link de redefinição para o seu e-mail.");
        trocarModo("entrar");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha,
      });
      if (error) throw error;
      navigate({ to: "/dashboard", replace: true });
    } catch (erro) {
      const mensagem = erro instanceof Error ? erro.message : "Erro inesperado.";
      toast.error(
        mensagem.includes("Invalid login credentials")
          ? "E-mail ou senha incorretos."
          : mensagem.includes("already registered")
            ? "Este e-mail já possui uma conta."
            : mensagem,
      );
    } finally {
      setEnviando(false);
    }
  }

  const titulos = {
    entrar: { titulo: "Entrar na sua conta", acao: "Entrar" },
    cadastrar: { titulo: "Criar conta de morador", acao: "Criar conta" },
    recuperar: { titulo: "Recuperar senha", acao: "Enviar link" },
  } as const;

  return (
    <section className="mx-auto flex max-w-md flex-col px-4 py-14 sm:px-6">
      <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
        {titulos[modo].titulo}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {modo === "recuperar"
          ? "Informe o e-mail cadastrado e enviaremos um link para criar uma nova senha."
          : "Use sua conta para registrar problemas e acompanhar o atendimento."}
      </p>

      <form onSubmit={enviar} className="mt-8 space-y-4 rounded-2xl border border-border bg-card p-6 shadow-card">
        {modo === "cadastrar" ? (
          <div>
            <Label htmlFor="nome">Nome completo</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Maria da Silva"
              autoComplete="name"
              required
              className="mt-1.5"
            />
          </div>
        ) : null}

        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@email.com"
            autoComplete="email"
            required
            className="mt-1.5"
          />
        </div>

        {modo !== "recuperar" ? (
          <div>
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Mínimo de 6 caracteres"
              minLength={6}
              autoComplete={modo === "cadastrar" ? "new-password" : "current-password"}
              required
              className="mt-1.5"
            />
          </div>
        ) : null}

        <Button type="submit" className="w-full" disabled={enviando}>
          {enviando ? "Aguarde…" : titulos[modo].acao}
        </Button>

        {modo !== "recuperar" ? (
          <>
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-border" aria-hidden />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                ou
              </span>
              <span className="h-px flex-1 bg-border" aria-hidden />
            </div>
            <Button type="button" variant="outline" className="w-full" onClick={entrarComGoogle}>
              Continuar com o Google
            </Button>
          </>
        ) : null}
      </form>

      <div className="mt-6 space-y-2 text-center text-sm text-muted-foreground">
        {modo === "entrar" ? (
          <>
            <p>
              Não tem conta?{" "}
              <button
                onClick={() => trocarModo("cadastrar")}
                className="font-semibold text-primary hover:underline"
              >
                Cadastre-se
              </button>
            </p>
            <p>
              <button
                onClick={() => trocarModo("recuperar")}
                className="font-semibold text-primary hover:underline"
              >
                Esqueci minha senha
              </button>
            </p>
          </>
        ) : (
          <p>
            Já tem conta?{" "}
            <button
              onClick={() => trocarModo("entrar")}
              className="font-semibold text-primary hover:underline"
            >
              Entrar
            </button>
          </p>
        )}
        <p>
          <Link to="/" className="hover:underline">
            Voltar para o início
          </Link>
        </p>
      </div>
    </section>
  );
}
