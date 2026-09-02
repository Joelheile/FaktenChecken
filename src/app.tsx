import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  BrowserRouter,
  Route,
  Routes as RouterRoutes,
  useLocation,
} from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { posthog } from "@/lib/posthog";
import { HomePage } from "./pages/home";
import Impressum from "./pages/impressum";
import NotFound from "./pages/not-found";

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
      <Route element={<HomePage />} path="/" />
      <Route element={<Impressum />} path="/impressum" />
      <Route element={<NotFound />} path="*" />
    </RouterRoutes>
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner position="bottom-center" />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
