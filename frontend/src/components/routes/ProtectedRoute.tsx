import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function ProtectedLayout() {
    const { user, loading } = useAuth(); // Pega o novo estado de 'loading'

    // Se ainda estamos tentando carregar a sessão do localStorage,
    // mostramos uma tela de carregamento em vez de decidir.
    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-900 text-white">
                <h1>Carregando...</h1>
            </div>
        );
    }

    // Só depois que o carregamento termina, verificamos se o usuário existe.
    // Se não existe, redireciona para o login.
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Se o usuário existe e o carregamento terminou, renderiza a página.
    return <Outlet />;
}