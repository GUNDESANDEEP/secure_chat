import { useEffect, useMemo, useState } from "react";
import { Bot, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

type AuthorizationDetails = {
  client?: { name?: string; client_name?: string };
  redirect_url?: string;
  redirect_to?: string;
};

type AuthorizationResult = {
  redirect_url?: string;
  redirect_to?: string;
};

type OAuthMethods = {
  getAuthorizationDetails: (authorizationId: string) => Promise<{ data: AuthorizationDetails | null; error: Error | null }>;
  approveAuthorization: (authorizationId: string) => Promise<{ data: AuthorizationResult | null; error: Error | null }>;
  denyAuthorization: (authorizationId: string) => Promise<{ data: AuthorizationResult | null; error: Error | null }>;
};

function oauthClient() {
  return (supabase.auth as unknown as { oauth: OAuthMethods }).oauth;
}

function clientName(details: AuthorizationDetails | null) {
  return details?.client?.name ?? details?.client?.client_name ?? "an agent";
}

export default function OAuthConsent() {
  const authorizationId = useMemo(() => new URLSearchParams(window.location.search).get("authorization_id") ?? "", []);
  const [details, setDetails] = useState<AuthorizationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadAuthorization() {
      if (!authorizationId) {
        setError("Missing authorization request.");
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = `/login?next=${encodeURIComponent(next)}`;
        return;
      }

      const { data, error: authError } = await oauthClient().getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (authError) {
        setError(authError.message);
        return;
      }

      const immediateRedirect = data?.redirect_url ?? data?.redirect_to;
      if (immediateRedirect && !data?.client) {
        window.location.href = immediateRedirect;
        return;
      }

      setDetails(data);
    }

    loadAuthorization();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const { data, error: authError } = approve
      ? await oauthClient().approveAuthorization(authorizationId)
      : await oauthClient().denyAuthorization(authorizationId);

    if (authError) {
      setError(authError.message);
      setBusy(false);
      return;
    }

    const redirectTarget = data?.redirect_url ?? data?.redirect_to;
    if (!redirectTarget) {
      setError("No redirect was returned for this authorization request.");
      setBusy(false);
      return;
    }

    window.location.href = redirectTarget;
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="glass-effect border-2 max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/15">
            {details ? <Bot className="h-7 w-7 text-primary" /> : <ShieldCheck className="h-7 w-7 text-primary" />}
          </div>
          <CardTitle>{details ? `Connect ${clientName(details)}?` : "Loading connection request"}</CardTitle>
          <CardDescription>
            {details
              ? `${clientName(details)} will be able to create encrypted links and consume one-time access tokens through SecureLink.`
              : "Checking your secure authorization request."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? <p className="text-sm text-destructive">Could not load this request: {error}</p> : null}
        </CardContent>
        {details ? (
          <CardFooter className="grid grid-cols-2 gap-3">
            <Button variant="outline" disabled={busy} onClick={() => decide(false)}>
              Deny
            </Button>
            <Button disabled={busy} onClick={() => decide(true)}>
              Approve
            </Button>
          </CardFooter>
        ) : null}
      </Card>
    </main>
  );
}