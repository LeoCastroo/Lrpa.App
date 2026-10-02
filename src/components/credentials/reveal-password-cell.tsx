import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import api from "@/api";
import { Button } from "@/components/ui/button";
import { apiErrorMessage } from "@/lib/password-policy";

const AUTO_HIDE_MS = 20_000;
const MASK = "••••••••••••";

export function RevealPasswordCell({ credentialId }: { credentialId: string }) {
  const [password, setPassword] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  function hide() {
    clearTimeout(timeoutRef.current);
    setPassword(null);
  }

  async function reveal() {
    setLoading(true);
    try {
      const { password: revealed } = await api.credentials.revealPassword(credentialId);
      setPassword(revealed);
      timeoutRef.current = setTimeout(hide, AUTO_HIDE_MS);
    } catch (error) {
      toast.error(apiErrorMessage(error, "Não foi possível revelar a senha."));
    } finally {
      setLoading(false);
    }
  }

  if (password !== null) {
    return (
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm">{password}</span>
        <Button variant="ghost" size="sm" onClick={hide} className="h-7 px-2">
          <EyeOff className="size-3.5" /> Ocultar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-sm text-muted-foreground">{MASK}</span>
      <Button variant="ghost" size="sm" onClick={reveal} disabled={loading} className="h-7 px-2">
        {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Eye className="size-3.5" />}
        Revelar
      </Button>
    </div>
  );
}
