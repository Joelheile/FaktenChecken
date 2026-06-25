import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { posthog } from "@/lib/posthog";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  BrowserRouter,
  Route,
  Routes as RouterRoutes,
  useLocation,
} from "react-router-dom";
import Impressum from "./pages/Impressum";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PreviewFC from "./pages/PreviewFC";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const PageViewTracker = () => {
  const location = useLocation();

  useEffect(() => {
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
    <PageViewTracker />
    <RouterRoutes>
      <Route path="/" element={<Index />} />
      <Route path="/impressum" element={<Impressum />} />
      <Route path="/preview-fc" element={<PreviewFC />} />
      <Route path="*" element={<NotFound />} />
    </RouterRoutes>
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
