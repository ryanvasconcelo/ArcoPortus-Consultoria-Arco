
import { prisma } from '../lib/prisma';
import { LogSeverity } from '@prisma/client';

// Interface do usuário vinda de req.user
interface LogUserPayload {
    userId: string;
    name: string;
    company: {
        id: string;
        name: string; // <-- O nome da empresa está aqui
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
        // Validação crucial
        if (!user || !user.company || !user.company.id || !user.name) {
            console.error('--- [DEBUG AUDIT LOG] Falha ao registrar log: Payload do usuário inválido ou incompleto. ---');
            console.error('--- [DEBUG AUDIT LOG] Payload recebido:', JSON.stringify(user, null, 2));
            return;
        }

        await prisma.auditLog.create({
            data: {
                action,
                module,
                target,
                details,
                severity,
                userId: user.userId,
                userName: user.name,
                userRole: user.role,
                companyId: user.company.id,
                companyName: user.company.name, // <-- MUDANÇA 2: Salvando o nome da empresa
            },
        });

        console.log(`--- [AUDIT LOG SUCCESS] Ação ${action} no módulo ${module} registrada para ${user.name}. ---`);

    } catch (error) {
        console.error('--- [AUDIT LOG ERROR] Falha ao registrar ação de auditoria no Prisma:', error);
    }
}
