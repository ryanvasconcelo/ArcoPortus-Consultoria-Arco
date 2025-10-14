// frontend/src/components/ForgotPasswordModal.tsx
import { useState } from "react";
import { X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ForgotPasswordModalProps {
    onClose: () => void;
    onSubmit: (email: string) => void;
}

export function ForgotPasswordModal({ onClose, onSubmit }: ForgotPasswordModalProps) {
    const [email, setEmail] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(email);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <Card className="w-full max-w-md glass-card border-white/10 animate-scale-in">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-xl font-semibold">Redefinir Senha</CardTitle>
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Digite seu email. Se estiver cadastrado, enviaremos um link seguro para redefinir sua senha.
                        </p>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                                className="glass-input"
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Por segurança, limitamos a 3 tentativas por hora
                            </p>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" className="gradient-primary hover-lift">
                                <Send className="mr-2 h-4 w-4" />
                                Enviar Link de Redefinição
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}