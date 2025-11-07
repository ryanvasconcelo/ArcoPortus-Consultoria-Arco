import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { api, setupInterceptors } from '../services/api';
import cgaApi from '../services/cgaApi';
import { InactivityModal } from '@/components/InactivityModal';

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
    const [showInactivityModal, setShowInactivityModal] = useState(false);
    const navigate = useNavigate();

    // ✅ CONTROLE DE INATIVIDADE (30 minutos)
    const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
    const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutos em ms

    const signOut = useCallback((showMessage = false) => {
        localStorage.removeItem('@ArcoPortus:user');
        localStorage.removeItem('@ArcoPortus:token');

        setUser(null);
        setToken('');

        // Limpa timer de inatividade
        if (inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current);
            inactivityTimerRef.current = null;
        }

        if (showMessage) {
            setShowInactivityModal(true);
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const handleTokenUpdate = useCallback((newToken: string) => {
        localStorage.setItem('@ArcoPortus:token', newToken);
        setToken(newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    }, []);

    const refreshToken = useCallback(async () => {
        try {
            const response = await api.post('/auth/refresh-token');
            const { token: newToken } = response.data;
            handleTokenUpdate(newToken);
            console.log('✅ Token renovado com sucesso');
            return newToken;
        } catch (error: any) {
            console.error('❌ Erro ao renovar token:', error);

            // Se for 403, usuário perdeu acesso
            if (error.response?.status === 403) {
                setShowInactivityModal(true);
                setTimeout(() => {
                    signOut(false);
                }, 3000);
            } else {
                signOut(true);
            }
            throw error;
        }
    }, [handleTokenUpdate, signOut]);

    // ✅ RESET DO TIMER DE INATIVIDADE
    const resetInactivityTimer = useCallback(() => {
        if (inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current);
        }

        inactivityTimerRef.current = setTimeout(() => {
            console.log('⏱️ 30 minutos de inatividade. Fazendo logout...');
            signOut(true);
        }, INACTIVITY_TIMEOUT);
    }, [signOut, INACTIVITY_TIMEOUT]);

    // ✅ MONITORA ATIVIDADE DO USUÁRIO
    useEffect(() => {
        if (!token || !user) return;

        // Eventos que resetam o timer
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

        const handleActivity = () => {
            resetInactivityTimer();
        };

        // Adiciona listeners
        events.forEach(event => {
            window.addEventListener(event, handleActivity);
        });

        // Inicia o timer
        resetInactivityTimer();

        // Cleanup
        return () => {
            events.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
            if (inactivityTimerRef.current) {
                clearTimeout(inactivityTimerRef.current);
            }
        };
    }, [token, user, resetInactivityTimer]);

    // ✅ PERSISTÊNCIA APÓS RELOAD
    useEffect(() => {
        const storagedUser = localStorage.getItem('@ArcoPortus:user');
        const storagedToken = localStorage.getItem('@ArcoPortus:token');

        if (storagedToken && storagedUser) {
            try {
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

    // ✅ SETUP DOS INTERCEPTORS
    useEffect(() => {
        if (isInitialized) {
            setupInterceptors(signOut, refreshToken, resetInactivityTimer);
        }
    }, [isInitialized, signOut, refreshToken, resetInactivityTimer]);

    // ✅ VERIFICAÇÃO PERIÓDICA DE EXPIRAÇÃO
    useEffect(() => {
        if (!token) return;

        const checkTokenExpiration = () => {
            try {
                const decodedToken: { exp: number } = jwtDecode(token);
                const expirationTime = decodedToken.exp * 1000;
                const now = Date.now();
                const timeUntilExpiration = expirationTime - now;
                const refreshThreshold = 30 * 60 * 1000; // 30 minutos

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

        checkTokenExpiration();
        const interval = setInterval(checkTokenExpiration, 5 * 60 * 1000); // A cada 5 minutos

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
            throw error;
        }
    }

    const handleModalClose = () => {
        setShowInactivityModal(false);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, signIn, signOut: () => signOut(false), refreshToken }}>
            {isInitialized ? children : <div className="flex items-center justify-center h-screen">Carregando...</div>}
            {showInactivityModal && <InactivityModal onClose={handleModalClose} />}
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