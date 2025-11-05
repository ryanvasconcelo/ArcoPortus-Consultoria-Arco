import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { api, setupInterceptors } from '../services/api';
import cgaApi from '../services/cgaApi';  // API para autenticação via CGA

interface User {
    name: string;
    email: string;
    role: string;
    passwordResetRequired: boolean;
    company: {
        id: string;
        name: string;
    };
    permissions: string[]; // Correção #8: Adicionar permissões
}

interface AuthContextData {
    user: User | null;
    token: string;
    loading: boolean;
    signIn(credentials: SignInCredentials): Promise<void>;
    signOut(): void;
    refreshToken: () => Promise<void>;
}

interface AuthProviderProps {
    children: ReactNode;
}

interface SignInCredentials {
    email: string;
    password: string;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);
    const navigate = useNavigate();

    const signOut = useCallback(() => {
        localStorage.removeItem('@ArcoPortus:user');
        localStorage.removeItem('@ArcoPortus:token');

        setUser(null);
        setToken('');

        navigate('/login');
    }, [navigate]);

    const handleTokenUpdate = useCallback((newToken: string) => {
        localStorage.setItem('@ArcoPortus:token', newToken);
        setToken(newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    }, []);

    const refreshToken = useCallback(async () => {
        try {
            // Endpoint de refresh de token (precisa ser criado no backend)
            const response = await api.post('/auth/refresh-token');
            const { token: newToken } = response.data;
            handleTokenUpdate(newToken);
            return newToken;
        } catch (error) {
            console.error('Erro ao renovar token:', error);
            signOut(); // Força logout em caso de falha na renovação
            throw error;
        }
    }, [handleTokenUpdate, signOut]);

    // Correção #15: Persistência de dados após reload
    useEffect(() => {
        const storagedUser = localStorage.getItem('@ArcoPortus:user');
        const storagedToken = localStorage.getItem('@ArcoPortus:token');

        if (storagedToken && storagedUser) {
            setUser(JSON.parse(storagedUser));
            handleTokenUpdate(storagedToken);
        }

        setLoading(false);
        setIsInitialized(true);
    }, [handleTokenUpdate]);

    // Correção #5 e #12: Renovação automática de token e interceptor
    useEffect(() => {
        if (isInitialized) {
            setupInterceptors(signOut, refreshToken);
        }
    }, [isInitialized, signOut, refreshToken]);

    // Correção #13: Logout automático após expiração (fallback)
    useEffect(() => {
        if (!token) return;

        const checkTokenExpiration = () => {
            try {
                const decodedToken: { exp: number } = jwtDecode(token);
                const expirationTime = decodedToken.exp * 1000;
                const now = Date.now();
                const timeUntilExpiration = expirationTime - now;
                const refreshThreshold = 5 * 60 * 1000; // 5 minutos antes de expirar

                if (timeUntilExpiration < refreshThreshold && timeUntilExpiration > 0) {
                    console.log('Token próximo de expirar. Renovando automaticamente...');
                    refreshToken();
                } else if (timeUntilExpiration <= 0) {
                    console.log('Token expirado. Fazendo logout automático...');
                    signOut();
                }
            } catch (error) {
                console.error('Erro ao decodificar token:', error);
                signOut();
            }
        };

        // Verifica a cada 1 minuto
        const interval = setInterval(checkTokenExpiration, 60 * 1000);

        return () => clearInterval(interval);
    }, [token, signOut, refreshToken]);

    async function signIn({ email, password }: SignInCredentials) {
        const response = await cgaApi.post('/api/internal/auth/portus-login', { email, password });
        const { token: apiToken, user: apiUser, permissions: apiPermissions } = response.data;

        // O objeto user retornado pelo backend precisa ser enriquecido com as permissões
        // que estão no token, mas não são retornadas no objeto user.
        // Vamos decodificar o token para obter as permissões e o userId.
        const decodedToken: { userId: string, permissions: string[] } = jwtDecode(apiToken);

        const fullUser = {
            ...apiUser,
            permissions: decodedToken.permissions || [],
            userId: decodedToken.userId, // Adicionar userId para uso futuro
        };

        localStorage.setItem('@ArcoPortus:user', JSON.stringify(fullUser));
        handleTokenUpdate(apiToken);

        setUser(fullUser);
    }

    return (
        <AuthContext.Provider value={{ user, token, loading, signIn, signOut, refreshToken }}>
            {isInitialized ? children : <div>Carregando...</div>}
        </AuthContext.Provider>
    );
}

export const useAuth = (): AuthContextData => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};