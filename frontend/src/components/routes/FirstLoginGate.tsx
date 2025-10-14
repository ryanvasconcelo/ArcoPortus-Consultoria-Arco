import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function FirstLoginGate() {
    const { user } = useAuth();

    // Se o usuário é do tipo USER e precisa trocar a senha...
    if (user && user.role === 'USER' && user.passwordResetRequired) {
        // ...redireciona para a página de troca de senha.
        return <Navigate to="/primeiro-acesso" replace />;
    }

    // Se não for o caso, deixa o fluxo normal continuar (para o ProtectedLayout e as outras rotas).
    return <Outlet />;
}