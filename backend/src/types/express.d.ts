// Isso permite que o TypeScript "mescle" nossa definição com a original do Express.
declare namespace Express {
    // Define a interface para o payload do nosso token JWT
    export interface ITokenPayload {
        userId: string;
        // CORREÇÃO: Adicionamos a propriedade 'name' ao nível do usuário.
        name: string;
        company: {
            id: string;
            name: string;
        };
        role: string;
        permissions: string[];
    }

    // Adiciona a propriedade 'user' à interface Request do Express
    export interface Request {
        user: ITokenPayload;
    }
}