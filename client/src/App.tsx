/**
 * App.tsx — Roteamento e providers do Dashboard de Performance
 * Design: Executive Analytics — Clean Slate com Acento Institucional
 * Rotas: / (OS), /sac, /matrix, /clientes
 */

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DataProvider } from "./contexts/DataContext";
import { DashboardLayout } from "./components/DashboardLayout";
import OrdensServico from "./pages/OrdensServico";
import SAC from "./pages/SAC";
import Matrix from "./pages/Matrix";
import Clientes from "./pages/Clientes";

function Router() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/" component={OrdensServico} />
        <Route path="/sac" component={SAC} />
        <Route path="/matrix" component={Matrix} />
        <Route path="/clientes" component={Clientes} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <DataProvider>
            <Toaster richColors position="top-right" />
            <Router />
          </DataProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
