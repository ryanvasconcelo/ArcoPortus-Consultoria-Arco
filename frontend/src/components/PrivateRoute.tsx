import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
    const isAuthenticated = !!localStorage.getItem('authToken');

    // Se o usuário estiver autenticado, renderiza o conteúdo da rota (Outlet).
    // Caso contrário, redireciona para a página de login.
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;