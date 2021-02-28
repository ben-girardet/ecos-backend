export declare class RegisterEmailInput {
    firstname?: string;
    lastname?: string;
    email?: string;
    mobile?: string;
}
export declare class ValidateRegistrationEmailInput {
    token: string;
    code: string;
    type: 'email' | 'mobile';
    password: string;
}
