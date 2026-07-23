import { useEffect, useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export default function Login() {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const next = useMemo(() => safeNext(new URLSearchParams(window.location.search).get("next")), []);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) window.location.href = next;
    });
    return () => {
      active = false;
    };
  }, [next]);

  async function signInWithGoogle() {
    setBusy(true);
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}${next}`,
    });

    if (result.error) {
      setError(result.error.message);
      setBusy(false);
      return;
    }

    if (!result.redirected) window.location.href = next;
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="glass-effect border-2 max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/15">
            <ShieldCheck className="h-7 w-7 text-primary" />
          </div>
          <CardTitle>Sign in to SecureLink</CardTitle>
          <CardDescription>Use your account to approve this agent connection.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button onClick={signInWithGoogle} disabled={busy} className="w-full h-12">
            {busy ? "Opening sign in..." : "Continue with Google"}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}