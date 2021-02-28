export interface ILogin {
    token: string;
    refreshToken?: string;
    refreshTokenExpiry?: string;
    expires: Date | string;
    userId: string;
    privateKey: string;
    state: number;
}
