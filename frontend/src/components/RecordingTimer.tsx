// src/components/RecordingTimer.tsx

import { useState, useEffect } from "react";

interface RecordingTimerProps {
    createdAt: string;
    // --- ALTERAÇÃO 1: Recebe HORAS (Float) em vez de DIAS (Int) ---
    initialHours: number | null | undefined;
    deactivatedAt: string | null | undefined;
    isActive: boolean;
}

// Função de formatação permanece a mesma (com segundos)
const formatElapsedTime = (ms: number) => {
    if (ms < 0) return "0d 00h00m00s";
    const totalSeconds = Math.floor(ms / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;
    const minutes = totalMinutes % 60;
    const seconds = totalSeconds % 60;
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${days}d ${pad(hours)}h${pad(minutes)}m${pad(seconds)}s`;
};

export function RecordingTimer({ createdAt, initialHours, deactivatedAt, isActive }: RecordingTimerProps) {
    const [timeElapsed, setTimeElapsed] = useState("Calculando...");

    useEffect(() => {
        // --- ALTERAÇÃO 2: Validação usa initialHours ---
        if (typeof initialHours !== 'number' || isNaN(initialHours) || initialHours < 0) {
            setTimeElapsed("-"); // Mostra '-' se o valor inicial for inválido
            return;
        }
        const registrationDate = new Date(createdAt);
        if (isNaN(registrationDate.getTime())) {
            setTimeElapsed("Data Inválida");
            return;
        }

        // --- ALTERAÇÃO 3: Cálculo base usa initialHours ---
        // Converte as horas iniciais (que podem ter decimais) para milissegundos
        const initialDurationMs = initialHours * 60 * 60 * 1000;

        const calculateTime = () => {
            let totalTimeMs = initialDurationMs;
            let shouldStopInterval = false;

            if (!isActive && deactivatedAt) {
                // Lógica de congelamento (usa initialDurationMs calculado com horas)
                const deactivationDate = new Date(deactivatedAt);
                // Correção: O tempo gravado deve ser contado a partir da data de criação da câmera
                // até a data de desativação, somado ao tempo inicial.
                const deactivationDate = new Date(deactivatedAt);
                if (!isNaN(deactivationDate.getTime()) && deactivationDate >= registrationDate) {
                    const timeSinceRegistrationUntilDeactivation = deactivationDate.getTime() - registrationDate.getTime();
                    totalTimeMs = initialDurationMs + timeSinceRegistrationUntilDeactivation;
                } else {
                    totalTimeMs = Math.max(initialDurationMs, 0);
                }
                shouldStopInterval = true;

            } else if (isActive) {
                // Lógica do contador ativo (usa initialDurationMs calculado com horas)
                const now = new Date();
                const timeSinceRegistration = now.getTime() - registrationDate.getTime();
                if (timeSinceRegistration > 0) { totalTimeMs += timeSinceRegistration; }
            } else {
                totalTimeMs = Math.max(initialDurationMs, 0);
                shouldStopInterval = true;
            }

            setTimeElapsed(formatElapsedTime(totalTimeMs));
            return shouldStopInterval;
        };

        const stopInterval = calculateTime(); // Calcula o valor inicial

        let intervalId: NodeJS.Timeout | null = null;
        if (!stopInterval && isActive) {
            // Intervalo permanece de 1 segundo
            intervalId = setInterval(() => {
                if (calculateTime()) {
                    if (intervalId) clearInterval(intervalId);
                }
            }, 1000);
        }

        // Função de limpeza permanece a mesma
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };

        // --- ALTERAÇÃO 4: Dependência agora é initialHours ---
    }, [createdAt, initialHours, deactivatedAt, isActive]);

    return <span className="font-mono tabular-nums">{timeElapsed}</span>;
}