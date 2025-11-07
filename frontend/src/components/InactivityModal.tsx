// src/components/InactivityModal.tsx
import { AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface InactivityModalProps {
    onClose: () => void;
}

export function InactivityModal({ onClose }: InactivityModalProps) {
    return (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <Card className="w-full max-w-md border-amber-500/50 shadow-2xl animate-scale-in">
                <CardHeader>
                    <div className="flex items-center justify-center mb-4">
                        <div className="h-20 w-20 rounded-full bg-amber-100 flex items-center justify-center">
                            <Clock className="h-10 w-10 text-amber-600" />
                        </div>
                    </div>
                    <CardTitle className="text-center text-2xl">Sessão Expirada</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-amber-900">
                                    Sua sessão foi encerrada por inatividade
                                </p>
                                <p className="text-xs text-amber-700">
                                    Por questões de segurança, você foi desconectado após 30 minutos sem atividade no sistema.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="text-center text-sm text-muted-foreground">
                        <p>Por favor, faça login novamente para continuar.</p>
                    </div>

                    <Button
                        onClick={onClose}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                        size="lg"
                    >
                        Voltar para Login
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}