import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedLayout } from "./components/routes/ProtectedRoute";
import { PermissionRoute } from "./components/routes/PermissionRoute";

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
            {/* --- ROTAS PÚBLICAS --- */}
            <Route path="/login" element={<ArcoPortusLogin />} />
            <Route path="/primeiro-acesso" element={<FirstAccessChangePassword />} />
            <Route path="/redefinir-senha" element={<ResetPassword />} />

            {/* --- ROTAS PROTEGIDAS --- */}
            <Route element={<ProtectedLayout />}>
              <Route element={<FirstLoginGate />}>
                <Route path="/" element={<ArcoPortusHome />} />
                <Route path="/gestao-arquivos" element={<GestaoArquivos />} />

                {/* ✅ CORREÇÃO #8: Rotas protegidas por permissão */}
                <Route
                  path="/diagnostico-ear"
                  element={
                    <PermissionRoute permission="VIEW:DIAGNOSTIC">
                      <DiagnosticoEAR />
                    </PermissionRoute>
                  }
                />
                <Route
                  path="/normas-procedimentos"
                  element={
                    <PermissionRoute permission="VIEW:NORMS">
                      <NormasProcedimentos />
                    </PermissionRoute>
                  }
                />
                <Route
                  path="/documentos-registros"
                  element={
                    <PermissionRoute permission="VIEW:REGISTERS">
                      <DocumentosRegistros />
                    </PermissionRoute>
                  }
                />
                <Route
                  path="/legislacao"
                  element={
                    <PermissionRoute permission="VIEW:LEGISLATION">
                      <Legislacao />
                    </PermissionRoute>
                  }
                />
                <Route
                  path="/sistema-cftv"
                  element={
                    <PermissionRoute permission="VIEW:CFTV">
                      <SistemaCFTV />
                    </PermissionRoute>
                  }
                />
                <Route
                  path="/auditoria"
                  element={
                    <PermissionRoute permission="VIEW:AUDIT">
                      <Auditoria />
                    </PermissionRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <PermissionRoute permission="VIEW:DASHBOARDS">
                      <Dashboard />
                    </PermissionRoute>
                  }
                />

                {/* Rotas públicas dentro do layout protegido */}
                <Route path="/contato" element={<Contact />} />
                <Route path="/canal-denuncias" element={<WhistleblowerChannel />} />
                <Route path="/condicoes-uso" element={<CondicoesUso />} />
                <Route path="/politica-cookies" element={<PoliticaCookies />} />
                <Route path="/politica-privacidade" element={<PoliticaPrivacidade />} />
              </Route>
            </Route>

            {/* --- ROTA NOT FOUND --- */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;