import { auth, defineMcp } from "@lovable.dev/mcp-js";
import createSecureLinkTool from "./tools/createSecureLink";
import retrieveSecureLinkTool from "./tools/retrieveSecureLink";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "securelink-mcp",
  title: "SecureLink MCP",
  version: "0.1.0",
  instructions: "Create encrypted one-time secure links and consume access tokens through SecureLink.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [createSecureLinkTool, retrieveSecureLinkTool],
});