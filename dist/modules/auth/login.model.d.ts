import { ILogin } from '../../types/login';
export declare class Login implements ILogin {
    token: string;
    refreshToken?: string;
    refreshTokenExpiry?: string;
    expires: Date;
    userId: string;
    privateKey: string;
    state: number;
}
