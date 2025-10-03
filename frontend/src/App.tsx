import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// General Pages
import Contact from "./pages/Contact";
import WhistleblowerChannel from "./pages/WhistleblowerChannel";
import NotFound from "./pages/NotFound";
import CondicoesUso from "./pages/CondicoesUso";
import PoliticaCookies from "./pages/PoliticaCookies";
import PoliticaPrivacidade from "./pages/PoliticaPrivacidade";

// App Pages
import ArcoPortusHome from "./pages/ArcoPortusHome";
import ArcoPortusLogin from "./pages/ArcoPortusLogin";
import GestaoArquivos from "./pages/GestaoArquivos";
import ARESP from "./pages/ARESP";
import DiagnosticoEAR from "./pages/DiagnosticoEAR";
import NormasProcedimentos from "./pages/NormasProcedimentos";
import DocumentosRegistros from "./pages/DocumentosRegistros";
import GestaoRotinas from "./pages/GestaoRotinas";
import Legislacao from "./pages/Legislacao";
import SistemaCFTV from "./pages/SistemaCFTV";
import Auditoria from "./pages/Auditoria";
import Dashboard from "./pages/Dashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* General Routes */}
          <Route path="/" element={<ArcoPortusHome />} />
          <Route path="/contato" element={<Contact />} />
          <Route path="/canal-denuncias" element={<WhistleblowerChannel />} />
          <Route path="/condicoes-uso" element={<CondicoesUso />} />
          <Route path="/politica-cookies" element={<PoliticaCookies />} />
          <Route path="/politica-privacidade" element={<PoliticaPrivacidade />} />

          {/* App Routes */}
          <Route path="/login" element={<ArcoPortusLogin />} />
          <Route path="/home" element={<ArcoPortusHome />} />
          <Route path="/gestao-arquivos" element={<GestaoArquivos />} />
          <Route path="/aresp" element={<ARESP />} />
          <Route path="/diagnostico-ear" element={<DiagnosticoEAR />} />
          <Route path="/normas-procedimentos" element={<NormasProcedimentos />} />
          <Route path="/documentos-registros" element={<DocumentosRegistros />} />
          <Route path="/gestao-rotinas" element={<GestaoRotinas />} />
          <Route path="/legislacao" element={<Legislacao />} />
          <Route path="/sistema-cftv" element={<SistemaCFTV />} />
          <Route path="/auditoria" element={<Auditoria />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
