import dayjs from "dayjs";
import { ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";
import api from "@/api";
import { FailureKindBadge } from "@/components/panel/badges";
import { ServicePage } from "@/components/service-hub/service-page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IRpaDoc } from "@/service/types/Panel";
import { IServiceDefinition } from "@/service/types/Service";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm leading-relaxed flex flex-col gap-2">{children}</CardContent>
    </Card>
  );
}

function Docs({ service }: { service: IServiceDefinition }) {
  const [docs, setDocs] = useState<IRpaDoc | null>(null);

  useEffect(() => {
    api.panel
      .getDocs(service.key)
      .then((result) => setDocs(result.docs))
      .catch((error) =>
        toast.error(error?.response?.data?.message ?? "Erro ao carregar a documentação.")
      );
  }, [service.key]);

  if (!docs) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-4xl">
      <Section title="O que o robô faz">
        <p>{docs.objetivo}</p>
      </Section>

      <Section title="Quando roda">
        <p>{docs.quandoRoda}</p>
      </Section>

      <Section title="O que entra no processamento">
        <p>{docs.origem.intro}</p>
        <ul className="list-disc pl-5 flex flex-col gap-1">
          {docs.origem.itens.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>

      <Section title="Passo a passo">
        <ol className="list-decimal pl-5 flex flex-col gap-1.5">
          {docs.passos.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </Section>

      <Section title="O que é sucesso">
        <ul className="list-disc pl-5 flex flex-col gap-1">
          {docs.sucesso.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>

      <Section title="Falhas e o que fazer">
        <p>{docs.falhas.intro}</p>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Motivo</TableHead>
                <TableHead>O que significa</TableHead>
                <TableHead>O que fazer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {docs.falhas.motivos.map((reason) => (
                <TableRow key={reason.key}>
                  <TableCell className="align-top whitespace-normal min-w-[180px]">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{reason.title}</span>
                      <FailureKindBadge kind={reason.kind} />
                    </div>
                  </TableCell>
                  <TableCell className="align-top whitespace-normal">{reason.explanation}</TableCell>
                  <TableCell className="align-top whitespace-normal">{reason.action}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Section>

      <Section title="Glossário">
        <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-[180px_1fr]">
          {docs.glossario.map((entry) => (
            <div key={entry.termo} className="contents">
              <dt className="font-medium">{entry.termo}</dt>
              <dd className="text-muted-foreground">{entry.significado}</dd>
            </div>
          ))}
        </dl>
      </Section>

      {docs.observacoes && docs.observacoes.length > 0 && (
        <Section title="Observações">
          <ul className="list-disc pl-5 flex flex-col gap-1">
            {docs.observacoes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Section>
      )}

      <p className="text-xs text-muted-foreground">
        Regras revisadas em {dayjs(docs.updatedAt).format("DD/MM/YYYY")}.
      </p>
    </div>
  );
}

export default function Page() {
  return (
    <ServicePage require="docs">{({ service }) => <Docs service={service} />}</ServicePage>
  );
}
