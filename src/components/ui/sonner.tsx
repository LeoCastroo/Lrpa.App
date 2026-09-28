import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { useTheme } from "@/hooks/use-theme"

const Toaster = ({ ...props }: ToasterProps) => {
  // "next-themes" (o default do shadcn) nunca foi conectado a um Provider — os toasts ficavam
  // presos no tema do SO mesmo quando o usuário escolhia claro/escuro explicitamente na tela de
  // Conta. Usa o hook próprio do app, que é a mesma fonte de verdade do resto da UI.
  const { theme } = useTheme()

  return (
    <Sonner
      theme={theme === "auto" ? "system" : theme === "gray" ? "dark" : theme}
      className="toaster group"
      duration={5000}
      position="top-right"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
