import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ViewLink from "./pages/ViewLink";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import OAuthConsent from "./pages/OAuthConsent";

const queryClient = new QueryClient();

const App = () => {
  const path = window.location.pathname;
  const standalonePage = path === "/.lovable/oauth/consent" ? <OAuthConsent /> : path === "/login" ? <Login /> : null;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {standalonePage ?? (
          <HashRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/view/:token" element={<ViewLink />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </HashRouter>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
