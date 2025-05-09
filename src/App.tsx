import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { posthog } from "@/lib/posthog";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Impressum from "./pages/Impressum";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// PostHog tracking component
const PostHogPageview = () => {
  const location = useLocation();

  useEffect(() => {
    // Track pageview with current URL properties when location changes
    posthog.capture("$pageview", {
      $current_url: location.pathname,
      path: location.pathname,
      referrer: document.referrer,
      title: document.title,
    });
  }, [location]);

  return null;
};

const AppRoutes = () => (
  <>
    <PostHogPageview />
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/impressum" element={<Impressum />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
