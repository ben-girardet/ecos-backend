export declare const isValidToken: (token: any) => boolean;
export declare const retrieveToken: (headers: any) => any;
export declare const decodeToken: (token: string) => any;
export declare const decodeRefreshToken: (token: string) => any;
export declare const createToken: (payload: any) => null;
export declare const createRefreshToken: (payload: any) => null;
