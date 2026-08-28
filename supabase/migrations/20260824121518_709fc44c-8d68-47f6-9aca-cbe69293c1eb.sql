CREATE TYPE public.app_role AS ENUM ('morador', 'prefeitura', 'admin');
CREATE TYPE public.problema_status AS ENUM ('recebido', 'em_analise', 'em_andamento', 'resolvido', 'cancelado');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_gestor(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('prefeitura', 'admin'));
$$;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_gestor(auth.uid()));
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "user_roles_select" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "user_roles_admin_insert" ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "user_roles_admin_update" ON public.user_roles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "user_roles_admin_delete" ON public.user_roles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categorias TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categorias TO authenticated;
GRANT ALL ON public.categorias TO service_role;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categorias_select_all" ON public.categorias FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "categorias_admin_insert" ON public.categorias FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "categorias_admin_update" ON public.categorias FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.categorias (nome) VALUES
  ('Buraco na via'), ('Iluminação pública'), ('Lixo/descarte irregular'),
  ('Terreno abandonado'), ('Calçada'), ('Sinalização'), ('Outros');

CREATE TABLE public.problemas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  status public.problema_status NOT NULL DEFAULT 'recebido',
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  categoria_id UUID REFERENCES public.categorias(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.problemas TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.problemas TO authenticated;
GRANT ALL ON public.problemas TO service_role;
ALTER TABLE public.problemas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "problemas_select_all" ON public.problemas FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "problemas_insert_own" ON public.problemas FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "problemas_update_gestor" ON public.problemas FOR UPDATE TO authenticated
  USING (public.is_gestor(auth.uid())) WITH CHECK (public.is_gestor(auth.uid()));
CREATE POLICY "problemas_delete" ON public.problemas FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.localizacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problema_id UUID NOT NULL UNIQUE REFERENCES public.problemas(id) ON DELETE CASCADE,
  endereco TEXT NOT NULL DEFAULT '',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.localizacoes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.localizacoes TO authenticated;
GRANT ALL ON public.localizacoes TO service_role;
ALTER TABLE public.localizacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "localizacoes_select_all" ON public.localizacoes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "localizacoes_insert_own" ON public.localizacoes FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.problemas p WHERE p.id = problema_id AND p.user_id = auth.uid()));

CREATE TABLE public.imagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problema_id UUID NOT NULL REFERENCES public.problemas(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.imagens TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.imagens TO authenticated;
GRANT ALL ON public.imagens TO service_role;
ALTER TABLE public.imagens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "imagens_select_all" ON public.imagens FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "imagens_insert_own" ON public.imagens FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.problemas p WHERE p.id = problema_id AND p.user_id = auth.uid()));
CREATE POLICY "imagens_delete_own" ON public.imagens FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.problemas p WHERE p.id = problema_id AND p.user_id = auth.uid()));

CREATE TABLE public.problema_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problema_id UUID NOT NULL REFERENCES public.problemas(id) ON DELETE CASCADE,
  status_anterior public.problema_status,
  status_novo public.problema_status NOT NULL,
  observacao TEXT,
  autor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.problema_historico TO anon;
GRANT SELECT, INSERT ON public.problema_historico TO authenticated;
GRANT ALL ON public.problema_historico TO service_role;
ALTER TABLE public.problema_historico ENABLE ROW LEVEL SECURITY;
CREATE POLICY "historico_select_all" ON public.problema_historico FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "historico_insert_gestor" ON public.problema_historico FOR INSERT TO authenticated
  WITH CHECK (public.is_gestor(auth.uid()));

CREATE TABLE public.notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problema_id UUID REFERENCES public.problemas(id) ON DELETE CASCADE,
  mensagem TEXT NOT NULL,
  lida BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.notificacoes TO authenticated;
GRANT ALL ON public.notificacoes TO service_role;
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notificacoes_select_own" ON public.notificacoes FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "notificacoes_update_own" ON public.notificacoes FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER problemas_updated_at BEFORE UPDATE ON public.problemas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'full_name', ''), COALESCE(NEW.email, ''))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'morador')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.notificar_status()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.notificacoes (user_id, problema_id, mensagem)
    VALUES (NEW.user_id, NEW.id, 'Seu problema "' || NEW.titulo || '" foi atualizado para "' ||
      CASE NEW.status
        WHEN 'recebido' THEN 'Recebido'
        WHEN 'em_analise' THEN 'Em análise'
        WHEN 'em_andamento' THEN 'Em andamento'
        WHEN 'resolvido' THEN 'Resolvido'
        ELSE 'Cancelado' END || '".');
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER problemas_notificar AFTER UPDATE ON public.problemas
  FOR EACH ROW EXECUTE FUNCTION public.notificar_status();