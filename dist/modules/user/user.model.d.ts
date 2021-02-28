import { IUser } from '../../types/user';
import mongoose from 'mongoose';
import { Image } from '../image/image.model';
export interface RefreshTokenData {
    refreshToken: string;
    hash: string;
    expiry: Date;
}
export declare class RefreshToken {
    hash: string;
    expiry: Date;
}
export declare class User implements IUser {
    _id: mongoose.Types.ObjectId;
    get id(): string;
    firstname: string;
    lastname: string;
    email: string;
    emailValidated?: boolean;
    mobile: string;
    mobileValidated?: boolean;
    picture?: Image[];
    hash: string;
    salt: string;
    publicKey: string;
    privateKey: string;
    lastLogin?: Date;
    roles: string[];
    refreshTokens: RefreshToken[];
    state: number;
    createdAt: Date;
    updatedAt: Date;
    player(user: User): Promise<any>;
    hashPassword(password: string): void;
    isPasswordValid(password: string): boolean;
    generateRefreshToken(options?: {
        hashToRemove?: string;
    }): RefreshTokenData;
    static findByIdWithCache(id: any): Promise<User | null>;
}
declare const UserModel: import("@typegoose/typegoose").ReturnModelType<typeof User, {}>;
export { UserModel };
