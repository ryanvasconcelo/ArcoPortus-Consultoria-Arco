// src/config/multer.ts

import multer, { FileFilterCallback } from 'multer'; // Importar FileFilterCallback
import { Request } from 'express'; // Importar Request do Express
import { resolve } from 'path';
import crypto from 'crypto';

const UPLOADS_FOLDER = resolve(__dirname, '..', '..', 'uploads');

export default {
    storage: multer.diskStorage({
        destination: UPLOADS_FOLDER,
        // Tipagem Correta para filename:
        filename: (req: Request, file: Express.Multer.File, callback: (error: Error | null, filename: string) => void) => {
            const fileHash = crypto.randomBytes(16).toString('hex');
            const fileName = `${fileHash}-${file.originalname}`;
            return callback(null, fileName);
        },
    }),
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
    // Tipagem Correta para fileFilter:
    fileFilter: (req: Request, file: Express.Multer.File, callback: FileFilterCallback) => {
        const allowedMimes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'image/jpeg',
            'image/png',
            'text/csv', // <-- ADICIONE ESTA LINHA
        ];

        if (allowedMimes.includes(file.mimetype)) {
            callback(null, true);
        } else {
            callback(new Error('Formato de arquivo não suportado.'));
        }
    }
};