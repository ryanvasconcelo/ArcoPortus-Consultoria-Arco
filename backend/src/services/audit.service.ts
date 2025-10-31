import { prisma } from '../lib/prisma';
import { LogSeverity } from '@prisma/client';
import { randomUUID } from 'crypto'; // ✅ IMPORTAR

// Interface do usuário vinda de req.user
interface LogUserPayload {
    userId: string;
    name: string;
    company: {
        id: string;
        name: string;
    };
    role: string;
    permissions: string[];
}

interface LogActionData {
    action: string;
    module: string;
    target?: string;
    details: string;
    severity: LogSeverity;
    user: LogUserPayload;
}

/**
 * Registra uma ação de auditoria no banco de dados.
 */
export async function logAction({
    action,
    module,
    target,
    details,
    severity,
    user,
}: LogActionData): Promise<void> {
    try {
        // ✅ VALIDAÇÃO MAIS FLEXÍVEL: Aceita 'N/A' e 'System'
        if (!user) {
            console.error('[AUDIT LOG] Payload do usuário ausente, abortando log.');
            return;
        }

        // ✅ Para casos de 'N/A' ou 'System', use valores padrão
        const safeUserId = user.userId && user.userId !== 'N/A' && user.userId !== 'System'
            ? user.userId
            : randomUUID(); // Gera UUID temporário para System

        const safeCompanyId = user.company?.id && user.company.id !== 'N/A'
            ? user.company.id
            : randomUUID(); // Gera UUID temporário para System

        await prisma.auditLog.create({
            data: {
                id: randomUUID(), // ✅ CRÍTICO: Gerar UUID explícito
                action,
                module,
                target: target || 'N/A',
                details,
                severity,
                userId: safeUserId,
                userName: user.name || 'Sistema',
                userRole: user.role || 'System',
                companyId: safeCompanyId,
                companyName: user.company?.name || 'Sistema',
            },
        });

        console.log(`[AUDIT LOG] ✅ ${action} no módulo ${module} registrado para ${user.name}`);

    } catch (error) {
        console.error('[AUDIT LOG ERROR] Falha ao registrar auditoria:', error);
    }
}