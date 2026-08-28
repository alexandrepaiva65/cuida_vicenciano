import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import { obterPapeis, obterPerfil } from "@/services/perfil";
import type { AppRole } from "@/lib/status";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  carregando: boolean;
};

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  carregando: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      setSession(novaSessao);
      setCarregando(false);
    });

    void supabase.auth.getSession().then(({ data: resultado }) => {
      setSession(resultado.session);
      setCarregando(false);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const valor = useMemo(
    () => ({ session, user: session?.user ?? null, carregando }),
    [session, carregando],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export function usePerfil() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["perfil", user?.id],
    queryFn: () => obterPerfil(user!.id),
    enabled: Boolean(user?.id),
  });
}

export function usePapeis() {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: ["papeis", user?.id],
    queryFn: () => obterPapeis(user!.id),
    enabled: Boolean(user?.id),
  });

  const papeis: AppRole[] = query.data ?? [];
  return {
    ...query,
    papeis,
    ehMorador: papeis.includes("morador"),
    ehPrefeitura: papeis.includes("prefeitura"),
    ehAdmin: papeis.includes("admin"),
    ehGestor: papeis.includes("prefeitura") || papeis.includes("admin"),
    papelPrincipal: (papeis.includes("admin")
      ? "admin"
      : papeis.includes("prefeitura")
        ? "prefeitura"
        : "morador") as AppRole,
  };
}

export async function sair() {
  await supabase.auth.signOut();
}
