
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/menus" element={<Index />} />
          <Route path="/reservations" element={<Index />} />
          <Route path="/evenements" element={<Index />} />
          <Route path="/clients" element={<Index />} />
          <Route path="/site-web" element={<Index />} />
          <Route path="/qr-codes" element={<Index />} />
          <Route path="/marketing" element={<Index />} />
          <Route path="/statistiques" element={<Index />} />
          <Route path="/comptabilite" element={<Index />} />
          <Route path="/inventaire" element={<Index />} />
          <Route path="/parametres" element={<Index />} />
          <Route path="/admin" element={<Index />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
