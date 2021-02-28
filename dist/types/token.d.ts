export interface IToken {
    id: string;
    token: string;
    code?: string;
    data?: any;
    expires: Date;
    used?: boolean;
}
