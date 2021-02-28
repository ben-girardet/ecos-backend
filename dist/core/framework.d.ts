import express from 'express';
export interface RouteDefinition {
    path: string;
    method: 'get' | 'post' | 'delete' | 'options' | 'patch' | 'put';
    name: string | symbol;
}
export declare type RouteMiddlewareTypes = 'facebook' | 'github' | 'google' | 'register' | 'jwt' | null | undefined;
export declare const registerControllers: (controllers: any[], app: express.Application) => void;
export declare const Controller: (prefix?: string) => ClassDecorator;
export declare const Verb: (path: string, verb: RouteDefinition['method']) => MethodDecorator;
export declare const Get: (path: string) => MethodDecorator;
export declare const Post: (path: string) => MethodDecorator;
export declare const Delete: (path: string) => MethodDecorator;
export declare const Options: (path: string) => MethodDecorator;
export declare const Patch: (path: string) => MethodDecorator;
export declare const Put: (path: string) => MethodDecorator;
