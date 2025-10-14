import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function ProtectedLayout() {
    const { user } = useAuth();

    // A lógica central: se não tem usuário, manda para o login.
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Se o usuário existe, renderiza a rota filha que foi solicitada (graças ao <Outlet />).
    // Aqui você também poderia adicionar um layout visual, como uma Navbar e Sidebar, que apareceria em todas as telas protegidas.
    return <Outlet />;
}