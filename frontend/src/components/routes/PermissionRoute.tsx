// src/components/routes/PermissionRoute.tsx
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface PermissionRouteProps {
    children: ReactNode;
    permission: string;
}

/**
 * ✅ CORREÇÃO #8: Componente para proteger rotas baseado em permissões
 * 
 * Uso:
 * <PermissionRoute permission="VIEW:CFTV">
 *   <SistemaCFTV />
 * </PermissionRoute>
 */
export function PermissionRoute({ children, permission }: PermissionRouteProps) {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Se não houver usuário, redireciona para login (fallback, ProtectedLayout já faz isso)
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Verifica se o usuário tem a permissão necessária
    const hasPermission = user.permissions?.includes(permission);

    if (!hasPermission) {
        // ✅ CORREÇÃO #7: Alerta de permissão com cor amarela (warning)
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
                <Card className="w-full max-w-md border-amber-500/50">
                    <CardHeader>
                        <div className="flex items-center justify-center mb-4">
                            <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
                                <ShieldAlert className="h-8 w-8 text-amber-600" />
                            </div>
                        </div>
                        <CardTitle className="text-center text-xl">Acesso Restrito</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* ✅ CORREÇÃO #7: Alerta em amarelo/warning */}
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <p className="text-sm text-amber-800 text-center">
                                Você não possui permissão para acessar esta área.
                            </p>
                            <p className="text-xs text-amber-600 text-center mt-2">
                                Entre em contato com o administrador do sistema se você acredita que deveria ter acesso.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => navigate(-1)}
                            >
                                Voltar
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={() => navigate('/')}
                            >
                                Ir para Início
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Se tem permissão, renderiza o componente filho
    return <>{children}</>;
}