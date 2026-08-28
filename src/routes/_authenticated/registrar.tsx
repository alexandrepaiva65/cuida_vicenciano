import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Crosshair, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listarCategorias } from "@/services/categorias";
import { criarProblema } from "@/services/problemas";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/registrar")({
  head: () => ({
    meta: [
      { title: "Registrar problema urbano — Cuida Vicenciano" },
      {
        name: "description",
        content:
          "Descreva o problema urbano, escolha a categoria, informe o endereço e anexe uma foto para a prefeitura atender.",
      },
      { property: "og:title", content: "Registrar problema urbano — Cuida Vicenciano" },
      {
        property: "og:description",
        content: "Envie uma nova ocorrência com foto e localização em poucos minutos.",
      },
    ],
  }),
  component: Registrar,
});

const TAMANHO_MAXIMO = 5 * 1024 * 1024;

function Registrar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [endereco, setEndereco] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [imagem, setImagem] = useState<File | null>(null);
  const [previa, setPrevia] = useState<string | null>(null);

  const { data: categorias } = useQuery({
    queryKey: ["categorias", "ativas"],
    queryFn: () => listarCategorias(true),
  });

  const mutation = useMutation({
    mutationFn: () =>
      criarProblema(user!.id, {
        titulo,
        descricao,
        categoriaId,
        endereco,
        latitude,
        longitude,
        imagem,
      }),
    onSuccess: async (id) => {
      toast.success("Problema registrado! A prefeitura foi notificada.");
      await queryClient.invalidateQueries({ queryKey: ["meus-problemas"] });
      await queryClient.invalidateQueries({ queryKey: ["problemas"] });
      navigate({ to: "/problema/$id", params: { id } });
    },
    onError: (erro) =>
      toast.error(erro instanceof Error ? erro.message : "Não foi possível registrar o problema."),
  });

  function selecionarArquivo(arquivo: File | undefined) {
    if (!arquivo) return;
    if (!arquivo.type.startsWith("image/")) {
      toast.error("Envie um arquivo de imagem.");
      return;
    }
    if (arquivo.size > TAMANHO_MAXIMO) {
      toast.error("A imagem deve ter no máximo 5 MB.");
      return;
    }
    setImagem(arquivo);
    setPrevia(URL.createObjectURL(arquivo));
  }

  function usarMinhaLocalizacao() {
    if (!navigator.geolocation) {
      toast.error("Seu navegador não permite obter a localização.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (posicao) => {
        setLatitude(posicao.coords.latitude);
        setLongitude(posicao.coords.longitude);
        toast.success("Coordenadas capturadas.");
      },
      () => toast.error("Não foi possível obter sua localização."),
    );
  }

  function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    if (!categoriaId) {
      toast.error("Escolha uma categoria.");
      return;
    }
    if (titulo.trim().length < 5 || descricao.trim().length < 10 || !endereco.trim()) {
      toast.error("Preencha título, descrição e endereço.");
      return;
    }
    mutation.mutate();
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
        Registrar um problema
      </h1>
      <p className="mt-2 text-muted-foreground">
        Quanto mais detalhes, mais rápido a equipe consegue resolver.
      </p>

      <form
        onSubmit={enviar}
        className="mt-8 space-y-5 rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8"
      >
        <div>
          <Label htmlFor="titulo">Título</Label>
          <Input
            id="titulo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ex.: Buraco grande na Rua das Flores"
            maxLength={120}
            required
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="categoria">Categoria</Label>
          <Select value={categoriaId} onValueChange={setCategoriaId}>
            <SelectTrigger id="categoria" className="mt-1.5">
              <SelectValue placeholder="Escolha a categoria do problema" />
            </SelectTrigger>
            <SelectContent>
              {(categorias ?? []).map((categoria) => (
                <SelectItem key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="descricao">Descrição</Label>
          <Textarea
            id="descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descreva o que está acontecendo, desde quando e se há risco para as pessoas."
            rows={5}
            required
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="endereco">Endereço ou ponto de referência</Label>
          <Input
            id="endereco"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            placeholder="Ex.: Rua das Flores, 120 — em frente à escola"
            required
            className="mt-1.5"
          />
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Button type="button" variant="outline" size="sm" onClick={usarMinhaLocalizacao}>
              <Crosshair className="size-4" aria-hidden /> Usar minha localização
            </Button>
            {latitude != null && longitude != null ? (
              <span className="text-xs text-muted-foreground">
                {latitude.toFixed(5)}, {longitude.toFixed(5)}
              </span>
            ) : null}
          </div>
        </div>

        <div>
          <Label htmlFor="foto">Foto do local (opcional)</Label>
          <label
            htmlFor="foto"
            className="mt-1.5 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-surface p-6 text-center transition hover:border-primary/50"
          >
            {previa ? (
              <img
                src={previa}
                alt="Prévia da foto selecionada"
                className="max-h-48 rounded-xl object-cover"
              />
            ) : (
              <>
                <Upload className="size-5 text-muted-foreground" aria-hidden />
                <span className="text-sm text-muted-foreground">
                  Clique para escolher uma imagem (até 5 MB)
                </span>
              </>
            )}
          </label>
          <input
            id="foto"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => selecionarArquivo(e.target.files?.[0])}
          />
        </div>

        <Button type="submit" className="w-full shadow-brand" disabled={mutation.isPending}>
          {mutation.isPending ? "Enviando…" : "Enviar registro"}
        </Button>
      </form>
    </section>
  );
}
