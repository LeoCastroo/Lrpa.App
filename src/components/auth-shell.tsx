import { ReactNode } from "react";
import { BrandLogo } from "@/components/brand-logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/** Moldura das telas sem sessão (login, esqueci a senha, redefinir senha). */
export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="relative flex min-h-svh w-full items-center justify-center overflow-hidden p-6 md:p-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(600px 400px at 50% -10%, color-mix(in oklch, var(--primary) 16%, transparent), transparent 70%)",
        }}
      />
      <div className="w-full max-w-sm">
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <BrandLogo
              className="mb-2 justify-center"
              markClassName="size-11"
              textClassName="text-2xl"
            />
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </div>
    </div>
  );
}
