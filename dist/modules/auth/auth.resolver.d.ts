import { RefreshTokenData } from "../user/user.model";
import { Login } from "./login.model";
import { AuthChecker } from "type-graphql";
import { Context } from '../../core/context-interface';
export declare class AuthResolver {
    static isSameSite: (context: Context) => boolean;
    login(username: string, password: string, context: Context): Promise<Login>;
    refreshToken(context: Context): Promise<Login>;
    static sendRefreshToken(context: Context, refreshTokenData: RefreshTokenData): void;
    logout(context: Context): Promise<boolean>;
}
export declare const customAuthChecker: AuthChecker<Context>;
