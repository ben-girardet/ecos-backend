/// <reference types="node" />
import express from 'express';
import http from 'http';
import { BuildSchemaOptions } from 'type-graphql';
import { CorsOptions } from 'cors';
export interface AppOptions {
    publicPath?: string;
}
export declare class Start {
    static lastClientMajor: number;
    static lastClientMinor: number;
    static lastClientPatch: number;
    static whitelist: string[];
    static app: express.Express;
    static server: http.Server;
    static io: any;
    static port: number;
    static corsOptions: CorsOptions;
    static requiredEnvVars: string[];
    static defaultEnvVars: {
        NODE_ENV: string;
        REDIS_HOST: string;
        REDIS_PORT: string;
        JWT_TOKEN_EXPIRATION: string;
        JWT_REFRESH_TOKEN_EXPIRATION: string;
        MONGO_HOST: string;
        MONGO_PORT: string;
        MONGO_USER: string;
        MONGO_PASSWORD: string;
        MONGO_DB: string;
        SERVER_PORT: string;
        SMSAPI_TOKEN: string;
        UPLOAD_PATH: string;
    };
    static checkEnv(): Promise<void>;
    static startDb(): Promise<void>;
    static startApp(options?: AppOptions): express.Express;
    static setCorsOptions(): void;
    static startGraphQl(schemaOptions: BuildSchemaOptions, app?: express.Express): Promise<void>;
    static registerControllers(controllers: any[], app?: express.Express): void;
    static handleError(app?: express.Express): void;
    static startIO(): void;
    static listen(): void;
    static default(schemaOptions: BuildSchemaOptions, controllers: any[]): Promise<void>;
}
