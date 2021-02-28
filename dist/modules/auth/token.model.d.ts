import { IToken } from "../../types/token";
import { DocumentType } from "@typegoose/typegoose";
import mongoose from 'mongoose';
export declare class Token implements IToken {
    get id(): string;
    _id: mongoose.Types.ObjectId;
    token: string;
    code?: string;
    data?: any;
    expires: Date;
    used?: boolean;
    setToken(): void;
    static findValid(tokenString: string, code: string): Promise<DocumentType<Token>>;
}
declare const TokenModel: import("@typegoose/typegoose").ReturnModelType<typeof Token, {}>;
export { TokenModel };
