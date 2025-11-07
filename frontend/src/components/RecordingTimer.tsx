// src/components/RecordingTimer.tsx
import { useState, useEffect } from "react";

interface RecordingTimerProps {
    createdAt: string;
    initialHours: number | null | undefined;
    deactivatedAt: string | null | undefined;
    isActive: boolean;
}

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
        // ✅ CORREÇÃO #3: Valida e usa initialHours
        const initialHoursValue = typeof initialHours === 'number' && !isNaN(initialHours) && initialHours >= 0 ? initialHours : 0;

        const registrationDate = new Date(createdAt);
        if (isNaN(registrationDate.getTime())) {
            setTimeElapsed("Data Inválida");
            return;
        }

        // ✅ Converte horas iniciais para milissegundos
        const initialDurationMs = initialHoursValue * 60 * 60 * 1000;

        const calculateTime = () => {
            let totalTimeMs = initialDurationMs;
            let shouldStopInterval = false;

            if (!isActive && deactivatedAt) {
                // Câmera inativa: tempo congelado = inicial + tempo até desativação
                const deactivationDate = new Date(deactivatedAt);

                if (!isNaN(deactivationDate.getTime()) && deactivationDate >= registrationDate) {
                    const timeSinceRegistrationUntilDeactivation = deactivationDate.getTime() - registrationDate.getTime();
                    totalTimeMs = initialDurationMs + timeSinceRegistrationUntilDeactivation;
                } else {
                    totalTimeMs = Math.max(initialDurationMs, 0);
                }
                shouldStopInterval = true;

            } else if (isActive) {
                // ✅ Câmera ativa: inicial + tempo desde criação
                const now = new Date();
                const timeSinceRegistration = now.getTime() - registrationDate.getTime();
                if (timeSinceRegistration > 0) {
                    totalTimeMs = initialDurationMs + timeSinceRegistration;
                }
            } else {
                totalTimeMs = Math.max(initialDurationMs, 0);
                shouldStopInterval = true;
            }

            setTimeElapsed(formatElapsedTime(totalTimeMs));
            return shouldStopInterval;
        };

        const stopInterval = calculateTime();

        let intervalId: NodeJS.Timeout | null = null;
        if (!stopInterval && isActive) {
            intervalId = setInterval(() => {
                if (calculateTime()) {
                    if (intervalId) clearInterval(intervalId);
                }
            }, 1000);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };

    }, [createdAt, initialHours, deactivatedAt, isActive]);

    return <span className="font-mono tabular-nums">{timeElapsed}</span>;
}