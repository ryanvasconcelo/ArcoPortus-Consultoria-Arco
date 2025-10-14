import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// --- NOSSOS NOVOS PADRÕES ---
import { useAuth } from '@/contexts/AuthContext'; // 1. Usamos o AuthContext como fonte da verdade
import api from '@/services/api'; // 2. Usamos nossa instância 'api' centralizada

// --- COMPONENTES DE UI (continuam os mesmos) ---
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Save, Loader2 } from 'lucide-react';

export default function FirstAccessChangePassword() {
    const navigate = useNavigate();
    const { user, signOut } = useAuth(); // 3. Pegamos o usuário e a função de logout do contexto

    // O estado fica mais simples, não precisamos de tempToken ou tempPassword
    const [formData, setFormData] = useState({
        email: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Efeito de segurança: se não houver um usuário logado, não deveria estar aqui.
    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // A lógica de validação continua a mesma e está ótima!
        if (formData.email.toLowerCase() !== user?.email.toLowerCase()) {
            toast.error('Email incorreto', {
                description: 'O email digitado não corresponde ao da sua conta.'
            });
            return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('Senhas não coincidem', {
                description: 'A nova senha e a confirmação devem ser iguais.'
            });
            return;
        }
        if (formData.newPassword.length < 6) {
            toast.error('Senha muito curta', {
                description: 'A senha deve ter no mínimo 6 caracteres.'
            });
            return;
        }

        setIsSubmitting(true);
        try {
            // --- CHAMADA DE API ADAPTADA ---
            // ANTES: apiWithToken.post('/users/me/change-password', { oldPassword, newPassword })
            // DEPOIS: Usamos nossa API central e o novo endpoint/payload.
            // O token JWT já está no header, graças ao AuthContext.
            await api.patch('/auth/force-change-password', {
                newPassword: formData.newPassword,
            });

            toast.success('Senha alterada com sucesso!', {
                description: 'Por favor, faça login novamente com sua nova credencial.',
                duration: 5000,
            });

            // 4. Deslogamos o usuário para limpar o token antigo
            signOut();

            // Redireciona para o login após 2 segundos
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err: any) {
            console.error('❌ Erro ao mudar senha:', err.response?.data || err.message);
            const errorMessage = err.response?.data?.message || 'Ocorreu um erro ao alterar a senha.';
            toast.error('Falha ao alterar senha', { description: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Seu JSX está perfeito e pode ser mantido exatamente como está.
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-primary/5 p-4">
            <Card className="w-full max-w-md glass-card border-white/10">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
                        Redefinição de Senha Obrigatória
                    </CardTitle>
                    <CardDescription>
                        Por segurança, você precisa criar uma nova senha para seu primeiro acesso.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email de Verificação</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Confirme seu email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Digite o email da sua conta ({user?.email}) para confirmar sua identidade.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">Nova Senha</Label>
                            <Input id="newPassword" name="newPassword" type="password" value={formData.newPassword} onChange={handleChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                            <Input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required />
                        </div>
                        <Button type="submit" className="w-full gradient-primary hover-lift" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Salvar Nova Senha
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}