import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StateContextProvider } from "@/contexts/StateContext";
import { WalletContextProvider } from "@/contexts/WalletContext";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/ref/:address" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletContextProvider>
        <StateContextProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </StateContextProvider>
      </WalletContextProvider>
    </QueryClientProvider>
  );
}

export default App;
