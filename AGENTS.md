<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Cuida Vicenciano

## Visao geral

- Aplicacao web em portugues (`pt-BR`) para moradores registrarem problemas urbanos e acompanharem o atendimento da prefeitura.
- Stack principal: TanStack Start/Router, React 19, TypeScript, Tailwind CSS, Radix UI e Supabase.
- O shell global fica em [`src/routes/__root.tsx`](src/routes/__root.tsx); a documentacao de rotas fica em [`src/routes/README.md`](src/routes/README.md).

## Comandos

- Instalar dependencias: `npm install`
- Desenvolvimento: `npm run dev`
- Build de producao: `npm run build`
- Build de desenvolvimento: `npm run build:dev`
- Preview do build: `npm run preview`
- Lint: `npm run lint`
- Formatacao: `npm run format`

Nao ha script de testes configurado no [`package.json`](package.json). Depois de mudancas, rode pelo menos `npm run lint` e, quando a alteracao afetar o build, `npm run build`.

## Convencoes de implementacao

- Use aliases `@/` para imports de [`src`](src) e mantenha componentes compartilhados em [`src/components`](src/components), com primitives UI em [`src/components/ui`](src/components/ui).
- TanStack Router usa roteamento baseado em arquivos em [`src/routes`](src/routes). Crie ou altere o arquivo de rota correspondente; nunca edite [`src/routeTree.gen.ts`](src/routeTree.gen.ts), pois ele e gerado automaticamente.
- Rotas sob [`src/routes/_authenticated`](src/routes/_authenticated) exigem usuario autenticado via `beforeLoad`. Preserve esse limite ao adicionar paginas protegidas.
- Mantenha consultas e mutacoes de dados nos servicos em [`src/services`](src/services), em vez de espalhar chamadas Supabase pelos componentes. Reutilize os tipos e normalizadores existentes, especialmente em [`src/services/problemas.ts`](src/services/problemas.ts).
- Alteracoes de esquema, RLS, roles ou storage devem ser feitas como nova migration em [`supabase/migrations`](supabase/migrations). Nao dependa apenas de mudancas manuais no dashboard.
- O cliente Supabase usa `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` no browser, com fallback para variaveis de servidor. Nunca exponha chaves secretas nem contorne RLS no cliente.
- Preserve a linguagem e os nomes de dominio em portugues. Use os componentes Radix existentes e as classes Tailwind/conventions visuais ja presentes antes de criar novos primitives.

## Arquivos gerados e integracoes

- Nao edite manualmente [`src/routeTree.gen.ts`](src/routeTree.gen.ts) nem [`src/integrations/supabase/client.ts`](src/integrations/supabase/client.ts); ambos contem codigo gerado ou gerenciado pela integracao.
- O projeto sincroniza com Lovable. Mantenha a branch funcionando e evite reescrever historico publicado, conforme o bloco acima.
