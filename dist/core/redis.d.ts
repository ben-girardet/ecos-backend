/// <reference types="mongoose" />
import { mongoose } from '@typegoose/typegoose';
declare const client: any;
export declare const existsAsync: any;
export declare const getAsync: any;
export declare const setAsync: any;
export declare const delAsync: any;
export declare const lrangeAsync: any;
export declare const lpushAsync: any;
export declare const rpushAsync: any;
export declare const lremAsync: any;
export declare const llenAsync: any;
export declare const hgetAsync: any;
export declare const hgetAllAsync: any;
export declare const hsetAsync: any;
export declare const hdelAsync: any;
export { client };
export declare function saveModelItem(collection: string, object: {
    [key: string]: any;
    _id?: mongoose.Types.ObjectId;
}, options?: {
    time?: number;
}): Promise<void>;
export declare function getModelItem(collection: string, id: string): Promise<any>;
export declare function removeModelItem(collection: string, id: string): Promise<any>;
export declare function saveModelItems(key: string, objects: {
    [key: string]: any;
}[], options?: {
    primitive?: boolean;
    time?: number;
}): Promise<void>;
export declare function getModelItems(key: string, options?: {
    primitive: boolean;
}): Promise<any>;
