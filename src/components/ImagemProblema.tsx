import { useQuery } from "@tanstack/react-query";
import { ImageOff } from "lucide-react";

import { urlDaImagem } from "@/services/problemas";
import { cn } from "@/lib/utils";

/**
 * Exibe uma imagem guardada no armazenamento usando uma URL temporária.
 * O banco guarda apenas o caminho do arquivo.
 */
export function ImagemProblema({
  caminho,
  alt,
  className,
}: {
  caminho?: string | undefined;
  alt: string;
  className?: string | undefined;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["imagem", caminho],
    queryFn: () => urlDaImagem(caminho!),
    enabled: Boolean(caminho),
    staleTime: 1000 * 60 * 30,
  });

  if (!caminho || (!data && !isLoading)) {
    return (
      <div
        className={cn("grid place-items-center bg-muted text-muted-foreground", className)}
        aria-label="Sem foto"
      >
        <ImageOff className="size-5" aria-hidden />
      </div>
    );
  }

  if (isLoading || !data) {
    return <div className={cn("animate-pulse bg-muted", className)} />;
  }

  return <img src={data} alt={alt} loading="lazy" className={cn("object-cover", className)} />;
}
