import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// --- MUDANÇA ESTRATÉGICA ---
// Este é o nosso ID de desenvolvimento. Não há mais chamada ao prisma.company.
const DEV_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

const topicosMestres = [
    // 01. DOCUMENTAÇÃO PRELIMINAR
    { category: "01. DOCUMENTAÇÃO PRELIMINAR", subcategory: "1.1 INSTALAÇÃO PORTUÁRIA", item: "1.1.1 Razão Social e CNPJ" },
    { category: "01. DOCUMENTAÇÃO PRELIMINAR", subcategory: "1.2 SÓCIOS/PROPRIETÁRIOS/REPRESENTANTES", item: "1.2.1 Carteira de Identidade" },
    { category: "01. DOCUMENTAÇÃO PRELIMINAR", subcategory: "1.2 SÓCIOS/PROPRIETÁRIOS/REPRESENTANTES", item: "1.2.2 CPF" },
    { category: "01. DOCUMENTAÇÃO PRELIMINAR", subcategory: "1.2 SÓCIOS/PROPRIETÁRIOS/REPRESENTANTES", item: "1.2.3 Estatuto (Comprovação de quem são os representantes legais)" },
    { category: "01. DOCUMENTAÇÃO PRELIMINAR", subcategory: "1.3 SUPERVISORES DE SEGURANÇA PORTUÁRIA (SSP)", item: "1.3.1 Carteira de Identidade" },
    { category: "01. DOCUMENTAÇÃO PRELIMINAR", subcategory: "1.3 SUPERVISORES DE SEGURANÇA PORTUÁRIA (SSP)", item: "1.3.2 CPF" },
    { category: "01. DOCUMENTAÇÃO PRELIMINAR", subcategory: "1.3 SUPERVISORES DE SEGURANça PORTUÁRIA (SSP)", item: "1.3.3 Certidão Negativa de Antecedentes Criminais expedida pela Justiça Federal" },
    { category: "01. DOCUMENTAÇÃO PRELIMINAR", subcategory: "1.3 SUPERVISORES DE SEGURANÇA PORTUÁRIA (SSP)", item: "1.3.4 Certidão Negativa de Antecedentes Criminais Expedidas pela Justiça Estadual" },
    { category: "01. DOCUMENTAÇÃO PRELIMINAR", subcategory: "1.3 SUPERVISORES DE SEGURANÇA PORTUÁRIA (SSP)", item: "1.3.5 Certificados do CESSP e CASSP do SSP" },
    { category: "01. DOCUMENTAÇÃO PRELIMINAR", subcategory: "1.3 SUPERVISORES DE SEGURANÇA PORTUÁRIA (SSP)", item: "1.3.6 Informações contidas no Global Integrated Shipping Information System (GISIS)" },
    // 02. ESTUDO DE AVALIAÇÃO DE RISCOS (EAR)
    { category: "02. ESTUDO DE AVALIAÇÃO DE RISCOS (EAR)", subcategory: "", item: "2.1 Possui EAR aprovado e atualizado?" },
    // 03. PLANO DE SEGURANÇA PORTUÁRIA (PSP)
    { category: "03. PLANO DE SEGURANÇA PORTUÁRIA (PSP)", subcategory: "", item: "3.1 Possui PSP aprovado e atualizado?" },
    // 04. SEGURANÇA
    { category: "04. SEGURANÇA", subcategory: "", item: "4.16 Há procedimentos para os operadores do CFTV no caso de detecção de intrusão ou outra ocorrência anormal na instalação portuária?" },
    { category: "04. SEGURANÇA", subcategory: "", item: "4.38 A equipe de segurança realiza patrulhas rotineiras em todas as áreas (notadamente nas controladas e restritas)?" },
    // 05. COMUNICAÇÕES E TECNOLOGIA DA INFORMAÇÃO (TI)
    { category: "05. COMUNICAÇÕES E TECNOLOGIA DA INFORMAÇÃO (TI)", subcategory: "", item: "5.8 Os sistemas de controle de acesso e registro são auditáveis (registro por no mínimo 90 dias)?" },
    { category: "05. COMUNICAÇÕES E TECNOLOGIA DA INFORMAÇÃO (TI)", subcategory: "", item: "5.10 O controle dessas chaves e dos lacres está implementado? É adequado?" },
    { category: "05. COMUNICAÇÕES E TECNOLOGIA DA INFORMAÇÃO (TI)", subcategory: "", item: "5.13 Ocorre a exigência de termo de responsabilidade para a execução de serviços nos recursos críticos por pessoal externo, alertando para a vedação do acesso indevido às informações da instalação portuária?" },
    { category: "05. COMUNICAÇÕES E TECNOLOGIA DA INFORMAÇÃO (TI)", subcategory: "", item: "5.25 O uso de mídias e redes sociais é restrito às atividades de divulgação institucional?" },
    { category: "05. COMUNICAÇÕES E TECNOLOGIA DA INFORMAÇÃO (TI)", subcategory: "", item: "5.28 Há adestramento inicial (novos colaboradores) e contínuo (manutenção de uma cultura de segurança) no que tange à proteção na área de TI?" },
    { category: "05. COMUNICAÇÕES E TECNOLOGIA DA INFORMAÇÃO (TI)", subcategory: "", item: "5.29 Existe controle de presença nesses adestramentos?" },
    { category: "05. COMUNICAÇÕES E TECNOLOGIA DA INFORMAÇÃO (TI)", subcategory: "", item: "5.33 Existe plano de contingência para o Setor de TI?" },
];

async function main() {
    console.log(`Iniciando o seeding para a empresa de desenvolvimento: ${DEV_COMPANY_ID}`);

    for (const topico of topicosMestres) {
        await prisma.file.upsert({
            where: {
                companyId_category_subcategory_item: {
                    companyId: DEV_COMPANY_ID, // Usando nosso ID fixo
                    category: topico.category,
                    subcategory: topico.subcategory,
                    item: topico.item,
                }
            },
            update: {},
            create: {
                ...topico,
                name: topico.item,
                description: topico.item,
                path: '',
                size: 0,
                mimetype: '',
                companyId: DEV_COMPANY_ID, // Usando nosso ID fixo
                uploadedById: 'system-seed',
            },
        });
    }
    console.log(`Seeding de ${topicosMestres.length} tópicos concluído.`);
}

main()
    .catch((e) => {
        console.error("Ocorreu um erro durante o seeding:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });