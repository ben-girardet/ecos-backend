import { GraphQLRequestContext } from 'apollo-server-core';
export declare const apolloPerfPlugin: {
    requestDidStart(requestContext: any): {
        willSendResponse(requestContext: GraphQLRequestContext): void;
    };
};
export declare class Perf {
    private hrstart;
    private previousstephrstart;
    private name;
    constructor(name: string);
    log(step: string): void;
}
