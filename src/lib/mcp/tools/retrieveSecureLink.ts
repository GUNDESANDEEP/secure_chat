import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

type RuntimeGlobal = typeof globalThis & {
  Deno?: { env: { get: (name: string) => string | undefined } };
  process?: { env?: Record<string, string | undefined> };
};

function getEnv(name: string) {
  const runtime = globalThis as RuntimeGlobal;
  return runtime.Deno?.env.get(name) ?? runtime.process?.env?.[name];
}

function functionUrl(name: string) {
  const baseUrl = getEnv("SUPABASE_URL")?.replace(/\/+$/, "");
  if (!baseUrl) return { error: "Backend function URL is not configured." };
  return { url: `${baseUrl}/functions/v1/${name}` };
}

function functionHeaders() {
  const publishableKey = getEnv("SUPABASE_ANON_KEY") ?? getEnv("SUPABASE_PUBLISHABLE_KEY");
  return {
    "Content-Type": "application/json",
    ...(publishableKey ? { apikey: publishableKey, Authorization: `Bearer ${publishableKey}` } : {}),
  };
}

export default defineTool({
  name: "retrieve_secure_link",
  title: "Retrieve secure one-time link",
  description: "Consume a secure link access token and return the decrypted message exactly once.",
  inputSchema: {
    accessToken: z.string().describe("The one-time access token from a SecureLink URL."),
  },
  annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
  handler: async ({ accessToken }, ctx: ToolContext) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Sign in is required to retrieve secure links." }], isError: true };
    }

    const token = accessToken.trim();
    if (!token) {
      return { content: [{ type: "text", text: "Access token is required." }], isError: true };
    }

    const endpoint = functionUrl("retrieve-secure-link");
    if (endpoint.error) return { content: [{ type: "text", text: endpoint.error }], isError: true };

    const response = await fetch(`${endpoint.url}?token=${encodeURIComponent(token)}`, {
      method: "GET",
      headers: functionHeaders(),
    });

    const payload = await response.json().catch(() => null) as { error?: string; content?: string; createdAt?: string } | null;

    if (!response.ok || payload?.error || typeof payload?.content !== "string") {
      return {
        content: [{ type: "text", text: payload?.error ?? "Failed to retrieve the secure link." }],
        isError: true,
      };
    }

    return {
      content: [{ type: "text", text: payload.content }],
      structuredContent: {
        content: payload.content,
        createdAt: payload.createdAt,
      },
    };
  },
});