import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// ✅ 1. Importe o AuthProvider e o ProtectedRoute
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedLayout } from "./components/routes/ProtectedRoute";

// General Pages
import Contact from "./pages/Contact";
import WhistleblowerChannel from "./pages/WhistleblowerChannel";
import NotFound from "./pages/NotFound";
import CondicoesUso from "./pages/CondicoesUso";
import PoliticaCookies from "./pages/PoliticaCookies";
import PoliticaPrivacidade from "./pages/PoliticaPrivacidade";
import { FirstLoginGate } from "./components/routes/FirstLoginGate";
import FirstAccessChangePassword from "./pages/FirstAccessChangePassword";
import ResetPassword from "./pages/ResetPassword";

// App Pages
import ArcoPortusHome from "./pages/ArcoPortusHome";
import ArcoPortusLogin from "./pages/ArcoPortusLogin";
import GestaoArquivos from "./pages/GestaoArquivos";
import DiagnosticoEAR from "./pages/DiagnosticoEAR";
import NormasProcedimentos from "./pages/NormasProcedimentos";
import DocumentosRegistros from "./pages/DocumentosRegistros";
import Legislacao from "./pages/Legislacao";
import SistemaCFTV from "./pages/SistemaCFTV";
import Auditoria from "./pages/Auditoria";
import Dashboard from "./pages/Dashboard";

const queryClient = new QueryClient();

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>

          <Routes>
            {/* --- GRUPO DE ROTAS PÚBLICAS --- */}
            {/* Apenas a rota de login é verdadeiramente pública */}
            <Route path="/login" element={<ArcoPortusLogin />} />
            <Route path="/primeiro-acesso" element={<FirstAccessChangePassword />} />
            <Route path="/redefinir-senha" element={<ResetPassword />} />

            {/* --- GRUPO DE ROTAS PROTEGIDAS --- */}
            {/* O componente ProtectedLayout é o "porteiro" de todas as rotas aninhadas abaixo dele */}
            <Route element={<ProtectedLayout />}>
              <Route element={<FirstLoginGate />}>
                <Route path="/" element={<ArcoPortusHome />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/gestao-arquivos" element={<GestaoArquivos />} />
                <Route path="/diagnostico-ear" element={<DiagnosticoEAR />} />
                <Route path="/normas-procedimentos" element={<NormasProcedimentos />} />
                <Route path="/documentos-registros" element={<DocumentosRegistros />} />
                <Route path="/legislacao" element={<Legislacao />} />
                <Route path="/sistema-cftv" element={<SistemaCFTV />} />
                <Route path="/auditoria" element={<Auditoria />} />
                <Route path="/contato" element={<Contact />} />
                <Route path="/canal-denuncias" element={<WhistleblowerChannel />} />
                <Route path="/condicoes-uso" element={<CondicoesUso />} />
                <Route path="/politica-cookies" element={<PoliticaCookies />} />
                <Route path="/politica-privacidade" element={<PoliticaPrivacidade />} />
              </Route>
            </Route>

            {/* --- ROTA DE NOT FOUND --- */}
            {/* Esta rota pega qualquer URL que não corresponda às anteriores */}
            <Route path="*" element={<NotFound />} />
          </Routes>

        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider >
  </BrowserRouter>
);

export default App;