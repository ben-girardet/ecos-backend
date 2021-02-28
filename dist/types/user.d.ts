export interface IUser {
    id: string;
    firstname?: string;
    lastname?: string;
    password?: string;
    picture?: {
        fileId: string;
        width: number;
        height: number;
    }[];
    email: string;
    emailValidated?: boolean;
    mobile: string;
    mobileValidated?: boolean;
    roles?: any[];
    state?: number;
    createdAt?: Date;
    createdBy?: string | any;
    updatedAt?: Date;
    updatedBy?: string | any;
}
export interface TokenUserPayload {
    userId?: number | string;
    sub?: number;
    iat?: number;
    exp?: number;
    expiry?: number;
    email: string;
    firstname: string;
    lastname: string;
    picture: string | null;
    claims: string[];
}
