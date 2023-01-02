import { Login } from '../auth/login.model';
import { RegisterSMSInput, ValidateRegistrationSMSInput } from './registration.inputs';
import { Context } from '../../core/context-interface';
import 'gun/sea';
export declare class RegistrationSMSResolver {
    static registrationMessage: (code: string) => string;
    static sendCodeBySMS: (code: string, mobile: string, isTestAccount: boolean) => Promise<void>;
    requestMobileCode(data: RegisterSMSInput): Promise<any>;
    validateCode(data: ValidateRegistrationSMSInput, context: Context): Promise<Login>;
    private generatePair;
}
