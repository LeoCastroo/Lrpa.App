import { ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import api from "@/api";
import { ServicePage } from "@/components/service-hub/service-page";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/time";
import { apiErrorMessage } from "@/lib/password-policy";
import { ILakeProcessoDetail } from "@/service/types/Lake";
import { IServiceDefinition } from "@/service/types/Service";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm">{value ?? "—"}</span>
    </div>
  );
}

function fmtDate(value: unknown): string {
  if (!value) return "—";
  return new Date(String(value)).toLocaleDateString("pt-BR");
}

function ProcessoDetail({ service, office }: { service: IServiceDefinition; office?: string }) {
  const { id } = useParams();
  const [detail, setDetail] = useState<ILakeProcessoDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    api.lake
      .getProcesso(service.key, Number(id), { office })
      .then((data) => active && setDetail(data))
      .catch((error) => toast.error(apiErrorMessage(error, "Erro ao carregar o processo.")))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [service.key, office, id]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (!detail) {
    return <p className="text-sm text-muted-foreground">Processo não encontrado.</p>;
  }

  const p = detail.processo;
  const autores = detail.representantes.filter((r) => r.polo === "A");
  const reus = detail.representantes.filter((r) => r.polo !== "A");

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Capa</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Info label="Nº do Processo (CNJ)" value={String(p.numero_processo ?? "")} />
          <Info label="NPC" value={String(p.client_code ?? "")} />
          <Info label="Tribunal" value={String(p.tribunal ?? "")} />
          <Info label="UF" value={String(p.uf ?? "")} />
          <Info label="Classe" value={String(p.classe_label ?? "")} />
          <Info label="Assunto" value={String(p.assunto_label ?? "")} />
          <Info label="Órgão Julgador" value={String(p.orgao_julgador ?? "")} />
          <Info label="Juiz" value={String(p.juiz ?? "")} />
          <Info
            label="Valor da Causa"
            value={p.valor_causa != null ? currencyFormatter.format(Number(p.valor_causa)) : "—"}
          />
          <Info label="Distribuição" value={fmtDate(p.data_distribuicao)} />
          <Info label="Citação" value={String(p.citacao_label ?? "—")} />
          <Info label="Data da Citação" value={fmtDate(p.data_citacao)} />
          <Info label="Tutela/Liminar" value={String(p.tutela_liminar_label ?? "—")} />
          <Info label="Justiça Gratuita" value={p.justica_gratuita ? "Sim" : "Não"} />
          <Info label="Segredo de Justiça" value={p.segredo_justica ? "Sim" : "Não"} />
          <Info label="Competência" value={String(p.competencia ?? "—")} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Partes e Advogados</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6 grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">Autor(es)</h3>
            {autores.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem dados.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {autores.map((r) => (
                  <li key={r.id} className="text-sm">
                    <div>{r.parte_nome}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.advogado_nome}
                      {r.oab_numero && ` — OAB ${r.oab_numero}${r.oab_uf ? `/${r.oab_uf}` : ""}`}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">Réu (BMG) e demais polos</h3>
            {reus.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem dados.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {reus.map((r) => (
                  <li key={r.id} className="text-sm">
                    <div>{r.parte_nome}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.advogado_nome}
                      {r.oab_numero && ` — OAB ${r.oab_numero}${r.oab_uf ? `/${r.oab_uf}` : ""}`}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Robôs do PROJETO CITE-SE</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6 grid gap-4 sm:grid-cols-2">
          <Info
            label="Prazo de citação agendado"
            value={p.prazo_citacao_agendado_em ? formatDateTime(String(p.prazo_citacao_agendado_em)) : "Não agendado"}
          />
          <Info
            label="Prazo de liminar agendado"
            value={p.prazo_liminar_agendado_em ? formatDateTime(String(p.prazo_liminar_agendado_em)) : "Não agendado"}
          />
          <Info
            label="Cópia integral"
            value={
              p.copia_integral_link ? (
                <a
                  href={String(p.copia_integral_link)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  Abrir PDF <ExternalLink className="size-3" />
                </a>
              ) : (
                "Não enviada"
              )
            }
          />
          {Boolean(p.desfecho) && (
            <Info
              label="Desfecho (estimado)"
              value={
                <Badge variant="secondary" title={String(p.desfecho_evidencia ?? "")}>
                  {String(p.desfecho)}
                </Badge>
              }
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Linha do Tempo ({detail.movimentacoes.length})</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          {detail.movimentacoes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem movimentações.</p>
          ) : (
            <ul className="flex flex-col gap-3 max-h-[500px] overflow-y-auto">
              {detail.movimentacoes.map((m, i) => (
                <li key={i} className="border-l-2 border-border pl-3">
                  <div className="text-xs text-muted-foreground">{formatDateTime(m.data_movimentacao)}</div>
                  <div className="text-sm whitespace-pre-line">{m.descricao}</div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Page() {
  return (
    <ServicePage require="lake">
      {({ service, office }) => <ProcessoDetail service={service} office={office} />}
    </ServicePage>
  );
}
