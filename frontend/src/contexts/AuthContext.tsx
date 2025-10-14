import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface User {
    name: string;
    email: string;
    role: string;
    passwordResetRequired: boolean;
    company: {
        id: string;
        name: string;
    };
}

interface AuthContextData {
    user: User | null;
    token: string; // ✅ 1. ADICIONADO: O token faz parte dos dados do contexto
    loading: boolean;
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

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const storagedUser = localStorage.getItem('@ArcoPortus:user');
        const storagedToken = localStorage.getItem('@ArcoPortus:token');

        if (storagedToken && storagedUser) {
            setUser(JSON.parse(storagedUser));
            setToken(storagedToken); // ✅ 2. ADICIONADO: Atualiza o estado do token ao carregar
            api.defaults.headers.common['Authorization'] = `Bearer ${storagedToken}`;
        }

        setLoading(false);
    }, []);

    async function signIn({ email, password }: SignInCredentials) {
        const response = await api.post('/auth/login', { email, password });
        const { token: apiToken, user: apiUser } = response.data;

        localStorage.setItem('@ArcoPortus:user', JSON.stringify(apiUser));
        localStorage.setItem('@ArcoPortus:token', apiToken);

        api.defaults.headers.common['Authorization'] = `Bearer ${apiToken}`;

        setUser(apiUser);
        setToken(apiToken);
    }

    function signOut() {
        localStorage.removeItem('@ArcoPortus:user');
        localStorage.removeItem('@ArcoPortus:token');

        setUser(null);
        setToken('');

        navigate('/login');
    }

    return (
        // ✅ 3. ADICIONADO: O token agora é fornecido para os componentes filhos
        <AuthContext.Provider value={{ user, token, loading, signIn, signOut }}>
            {children}
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