import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';

// --- Interfaces de Tipagem ---
interface User {
    name: string;
    email: string;
    role: string;
    passwordResetRequired: boolean;
}

interface AuthContextData {
    user: User | null;
    token: string;
    signIn(credentials: SignInCredentials): Promise<void>;
    signOut(): void;
}

interface AuthProviderProps {
    children: ReactNode;
}

interface SignInCredentials {
    email: string;
    password: string;
}

// --- Criação do Contexto ---
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// --- Criação do Provedor ---
export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string>('');

    // Efeito para carregar os dados do localStorage quando a aplicação inicia
    useEffect(() => {
        const storagedUser = localStorage.getItem('@ArcoPortus:user');
        const storagedToken = localStorage.getItem('@ArcoPortus:token');

        if (storagedToken && storagedUser) {
            setUser(JSON.parse(storagedUser));
            setToken(storagedToken);
            // Configura o token no header de todas as futuras requisições do Axios
            api.defaults.headers.common['Authorization'] = `Bearer ${storagedToken}`;
        }
    }, []);

    async function signIn({ email, password }: SignInCredentials) {
        const response = await api.post('/auth/login', { email, password });

        const { token: apiToken, user: apiUser } = response.data;

        // Salva os dados no localStorage para persistir a sessão
        localStorage.setItem('@ArcoPortus:user', JSON.stringify(apiUser));
        localStorage.setItem('@ArcoPortus:token', apiToken);

        // Configura o header do Axios para as próximas requisições
        api.defaults.headers.common['Authorization'] = `Bearer ${apiToken}`;

        // Atualiza o estado
        setUser(apiUser);
        setToken(apiToken);
    }

    function signOut() {
        // Limpa o localStorage
        localStorage.removeItem('@ArcoPortus:user');
        localStorage.removeItem('@ArcoPortus:token');

        // Limpa o estado
        setUser(null);
        setToken('');
    }

    return (
        <AuthContext.Provider value={{ user, token, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

// --- Criação do Hook Customizado ---
// Facilita o uso do contexto nos componentes
export function useAuth(): AuthContextData {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}