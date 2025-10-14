import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import api from '@/services/api';
// Importe seus componentes de UI (Button, Input, Card, etc.)

export default function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [token, setToken] = useState<string | null>(null);

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Efeito para pegar o token da URL quando a página carrega
    useEffect(() => {
        const urlToken = searchParams.get('token');
        if (!urlToken) {
            toast.error("Token de redefinição inválido ou ausente.");
            navigate('/login');
        }
        setToken(urlToken);
    }, [searchParams, navigate]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('As senhas não coincidem.');
            return;
        }
        setIsSubmitting(true);
        try {
            await api.post('/auth/reset-password', { token, newPassword });
            toast.success('Senha redefinida com sucesso!', {
                description: 'Você já pode fazer login com sua nova senha.',
            });
            navigate('/login');
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Token inválido ou expirado.';
            toast.error('Falha ao redefinir senha', { description: errorMessage });
            setIsSubmitting(false);
        }
    };

    // Reutilize o mesmo JSX da sua página de primeiro acesso, mas com as devidas adaptações
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <form onSubmit={handleSubmit}>
                {/* ... Seu formulário com os campos de "Nova Senha" e "Confirmar Senha" ... */}
                {/* Lembre-se que aqui não precisa do campo de email */}
            </form>
        </div>
    );
}