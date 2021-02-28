import { RegisterEmailInput, ValidateRegistrationEmailInput } from './registration.inputs';
import 'gun/sea';
export declare class RegistrationPasswordResolver {
    static registrationMessage: (code: string) => string;
    exists(username: string): Promise<boolean>;
    register(data: RegisterEmailInput): Promise<any>;
    validateRegistration(data: ValidateRegistrationEmailInput): Promise<any>;
    forgotPassword(username: string): Promise<any>;
    resetPassword(tokenString: string, code: string, password: string): Promise<any>;
    private generatePair;
}
