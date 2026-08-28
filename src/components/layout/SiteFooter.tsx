import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
              CV
            </span>
            <span className="font-bold uppercase tracking-tight text-foreground">
              Cuida Vicenciano
            </span>
          </div>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Canal de comunicação entre os moradores de São Vicente de Minas e a prefeitura para
            cuidar dos espaços públicos da cidade.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">
            Início
          </Link>
          <Link to="/problemas-cidade" className="hover:text-primary">
            Problemas da cidade
          </Link>
          <Link to="/sobre" className="hover:text-primary">
            Sobre o projeto
          </Link>
        </nav>
      </div>
      <div className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground sm:px-6">
        © {new Date().getFullYear()} Cuida Vicenciano · São Vicente de Minas, MG
      </div>
    </footer>
  );
}
