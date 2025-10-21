import { prisma } from '../lib/prisma';

/**
 * Exclui logs de auditoria mais antigos que 30 dias.
 */
export async function deleteOldAuditLogs() {
    console.log('--- [CRON JOB] Executando exclusão de logs de auditoria antigos...');
    
    try {
        const date30DaysAgo = new Date();
        date30DaysAgo.setDate(date30DaysAgo.getDate() - 30);

        const deleteResult = await prisma.auditLog.deleteMany({
            where: {
                createdAt: {
                    lt: date30DaysAgo, // 'lt' = less than (menor que)
                },
            },
        });

        if (deleteResult.count > 0) {
            console.log(`--- [CRON JOB] Exclusão concluída. ${deleteResult.count} logs antigos removidos.`);
        } else {
            console.log('--- [CRON JOB] Nenhum log antigo para excluir.');
        }

    } catch (error) {
        console.error('--- [CRON JOB ERROR] Falha ao excluir logs de auditoria antigos:', error);
    }
}