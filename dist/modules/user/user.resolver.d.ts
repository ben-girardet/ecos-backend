import { Context } from '../../core/context-interface';
import { EditMeInput, EditUserInput } from './user.inputs';
export declare class UserResolver {
    users(context: Context, search: string): Promise<any[]>;
    user(id: string): Promise<any>;
    me(context: Context): Promise<any>;
    editMe(context: Context, data: EditMeInput): Promise<any>;
    editUser(userId: string, data: EditUserInput): Promise<any>;
}
