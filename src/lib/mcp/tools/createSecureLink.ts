import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

type RuntimeGlobal = typeof globalThis & {
  Deno?: { env: { get: (name: string) => string | undefined } };
  process?: { env?: Record<string, string | undefined> };
};

const allowedExpirations = new Set([5, 30, 60, 1440, 10080]);

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
  name: "create_secure_link",
  title: "Create secure one-time link",
  description: "Encrypt a message and create a one-time access token for sharing it securely.",
  inputSchema: {
    content: z.string().describe("The secret message to encrypt."),
    expiresInMinutes: z.number().describe("Expiration in minutes. Use 5, 30, 60, 1440, or 10080."),
  },
  annotations: { readOnlyHint: false, idempotentHint: false, openWorldHint: true },
  handler: async ({ content, expiresInMinutes }, ctx: ToolContext) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Sign in is required to create secure links." }], isError: true };
    }

    const trimmedContent = content.trim();
    const minutes = Math.round(Number(expiresInMinutes));

    if (!trimmedContent) {
      return { content: [{ type: "text", text: "Content is required." }], isError: true };
    }

    if (!allowedExpirations.has(minutes)) {
      return {
        content: [{ type: "text", text: "Expiration must be one of: 5, 30, 60, 1440, or 10080 minutes." }],
        isError: true,
      };
    }

    const endpoint = functionUrl("create-secure-link");
    if (endpoint.error) return { content: [{ type: "text", text: endpoint.error }], isError: true };

    const response = await fetch(endpoint.url, {
      method: "POST",
      headers: functionHeaders(),
      body: JSON.stringify({ content: trimmedContent, expiresInMinutes: minutes }),
    });

    const payload = await response.json().catch(() => null) as { error?: string; accessToken?: string; expiresAt?: string } | null;

    if (!response.ok || payload?.error || !payload?.accessToken) {
      return {
        content: [{ type: "text", text: payload?.error ?? "Failed to create a secure link." }],
        isError: true,
      };
    }

    const viewPath = `#/view/${payload.accessToken}`;

    return {
      content: [
        {
          type: "text",
          text: `Secure link token created. Open this app at ${viewPath}. It expires at ${payload.expiresAt}.`,
        },
      ],
      structuredContent: {
        accessToken: payload.accessToken,
        expiresAt: payload.expiresAt,
        viewPath,
      },
    };
  },
});