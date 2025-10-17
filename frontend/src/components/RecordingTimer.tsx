// src/components/RecordingTimer.tsx

import { useState, useEffect } from "react";

interface RecordingTimerProps {
    createdAt: string;      // Quando o registro foi criado no nosso sistema
    initialDays: number | null; // Os dias de gravação que vieram da planilha
    deactivatedAt: string | null;
    isActive: boolean;
}

const formatElapsedTime = (ms: number) => {
    if (ms < 0) return "0d 00:00";
    const totalMinutes = Math.floor(ms / (1000 * 60));
    const totalHours = Math.floor(totalMinutes / 60);
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;
    const minutes = totalMinutes % 60;
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${days}d ${pad(hours)}:${pad(minutes)}`;
};

export function RecordingTimer({ createdAt, initialDays, deactivatedAt, isActive }: RecordingTimerProps) {
    const [timeElapsed, setTimeElapsed] = useState("Calculando...");

    useEffect(() => {
        // Se não temos um ponto de partida, não há o que calcular.
        if (initialDays === null) {
            setTimeElapsed("-");
            return;
        }

        const registrationDate = new Date(createdAt);
        // O tempo inicial de gravação, convertido para milissegundos.
        const initialDurationMs = initialDays * 24 * 60 * 60 * 1000;

        const calculateTime = () => {
            // REGRA DE "CONGELAMENTO"
            if (!isActive && deactivatedAt) {
                const deactivationDate = new Date(deactivatedAt);
                const timeSinceRegistration = deactivationDate.getTime() - registrationDate.getTime();
                const totalTimeMs = initialDurationMs + timeSinceRegistration;
                setTimeElapsed(formatElapsedTime(totalTimeMs));
                return null; // Para o contador
            }

            // LÓGICA DO CONTADOR VIVO
            const now = new Date();
            // Calcula o tempo que passou DESDE que o registro foi criado no nosso sistema
            const timeSinceRegistration = now.getTime() - registrationDate.getTime();
            // O tempo total é o tempo inicial + o tempo que passou desde então
            const totalTimeMs = initialDurationMs + timeSinceRegistration;
            setTimeElapsed(formatElapsedTime(totalTimeMs));
            return true; // Continua o contador
        };

        if (calculateTime() === null) return;
        const intervalId = setInterval(() => {
            if (calculateTime() === null) {
                clearInterval(intervalId);
            }
        }, 60000); // Atualiza a cada minuto

        return () => clearInterval(intervalId);

    }, [createdAt, initialDays, deactivatedAt, isActive]);

    return <span className="font-mono">{timeElapsed}</span>;
}