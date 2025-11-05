import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { api, setupInterceptors } from '../services/api';
import cgaApi from '../services/cgaApi';
import { toast } from 'sonner';

interface User {
    name: string;
    email: string;
    role: string;
    passwordResetRequired: boolean;
    company: {
        id: string;
        name: string;
    };
    permissions: string[];
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

    // ✅ CORREÇÃO #13: Logout com mensagem
    const signOut = useCallback((showMessage = false) => {
        localStorage.removeItem('@ArcoPortus:user');
        localStorage.removeItem('@ArcoPortus:token');

        setUser(null);
        setToken('');

        if (showMessage) {
            toast.error('Sua sessão expirou. Por favor, faça login novamente.');
        }

        navigate('/login');
    }, [navigate]);

    const handleTokenUpdate = useCallback((newToken: string) => {
        localStorage.setItem('@ArcoPortus:token', newToken);
        setToken(newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    }, []);

    // ✅ CORREÇÃO #5 e #12: Renovação de token
    const refreshToken = useCallback(async () => {
        try {
            const response = await api.post('/auth/refresh-token');
            const { token: newToken } = response.data;
            handleTokenUpdate(newToken);
            console.log('✅ Token renovado com sucesso');
            return newToken;
        } catch (error) {
            console.error('❌ Erro ao renovar token:', error);
            signOut(true);
            throw error;
        }
    }, [handleTokenUpdate, signOut]);

    // ✅ CORREÇÃO #15: Persistência de dados após reload
    useEffect(() => {
        const storagedUser = localStorage.getItem('@ArcoPortus:user');
        const storagedToken = localStorage.getItem('@ArcoPortus:token');

        if (storagedToken && storagedUser) {
            try {
                // Validar se o token ainda é válido
                const decoded: { exp: number } = jwtDecode(storagedToken);
                const now = Date.now() / 1000;

                if (decoded.exp > now) {
                    setUser(JSON.parse(storagedUser));
                    handleTokenUpdate(storagedToken);
                    console.log('✅ Sessão restaurada do localStorage');
                } else {
                    console.log('⚠️ Token expirado no localStorage. Limpando...');
                    localStorage.removeItem('@ArcoPortus:user');
                    localStorage.removeItem('@ArcoPortus:token');
                }
            } catch (error) {
                console.error('❌ Erro ao restaurar sessão:', error);
                localStorage.removeItem('@ArcoPortus:user');
                localStorage.removeItem('@ArcoPortus:token');
            }
        }

        setLoading(false);
        setIsInitialized(true);
    }, [handleTokenUpdate]);

    // ✅ CORREÇÃO #5, #12, #13: Setup dos interceptors após inicialização
    useEffect(() => {
        if (isInitialized) {
            setupInterceptors(signOut, refreshToken);
        }
    }, [isInitialized, signOut, refreshToken]);

    // ✅ CORREÇÃO #13: Verificação periódica de expiração (fallback)
    useEffect(() => {
        if (!token) return;

        const checkTokenExpiration = () => {
            try {
                const decodedToken: { exp: number } = jwtDecode(token);
                const expirationTime = decodedToken.exp * 1000;
                const now = Date.now();
                const timeUntilExpiration = expirationTime - now;
                const refreshThreshold = 5 * 60 * 1000; // 5 minutos

                if (timeUntilExpiration < refreshThreshold && timeUntilExpiration > 0) {
                    console.log('⚠️ Token próximo de expirar. Renovando...');
                    refreshToken().catch(() => {
                        console.error('❌ Falha ao renovar token automaticamente');
                    });
                } else if (timeUntilExpiration <= 0) {
                    console.log('❌ Token expirado. Fazendo logout...');
                    signOut(true);
                }
            } catch (error) {
                console.error('❌ Erro ao verificar expiração do token:', error);
                signOut(true);
            }
        };

        // Verifica imediatamente
        checkTokenExpiration();

        // Verifica a cada 1 minuto
        const interval = setInterval(checkTokenExpiration, 60 * 1000);

        return () => clearInterval(interval);
    }, [token, signOut, refreshToken]);

    async function signIn({ email, password }: SignInCredentials) {
        try {
            const response = await cgaApi.post('/api/internal/auth/portus-login', { email, password });
            const { token: apiToken, user: apiUser } = response.data;

            const decodedToken: { userId: string, permissions: string[], company: any } = jwtDecode(apiToken);

            const fullUser = {
                ...apiUser,
                permissions: decodedToken.permissions || [],
                company: decodedToken.company || apiUser.company,
                userId: decodedToken.userId,
            };

            localStorage.setItem('@ArcoPortus:user', JSON.stringify(fullUser));
            handleTokenUpdate(apiToken);

            setUser(fullUser);

            console.log('✅ Login realizado com sucesso');
        } catch (error: any) {
            console.error('❌ Erro no login:', error);
            if (error.response?.status === 403) {
                toast.error('Você não tem permissão para acessar este serviço.');
            }
            throw error;
        }
    }

    return (
        <AuthContext.Provider value={{ user, token, loading, signIn, signOut: () => signOut(false), refreshToken }}>
            {isInitialized ? children : <div className="flex items-center justify-center h-screen">Carregando...</div>}
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