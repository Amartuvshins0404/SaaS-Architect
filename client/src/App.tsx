import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Landing from "@/pages/Landing";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Voices from "@/pages/Voices";
import History from "@/pages/History";
import Settings from "@/pages/Settings";
import Community from "@/pages/Community";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/auth" component={Auth} />
      <Route path="/app/dashboard" component={Dashboard} />
      <Route path="/app/voices" component={Voices} />
      <Route path="/app/history" component={History} />
      <Route path="/app/settings" component={Settings} />
      <Route path="/app/community" component={Community} />
      <Route component={NotFound} />
    </Switch>
  );
}

import { HelmetProvider } from "react-helmet-async";

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
