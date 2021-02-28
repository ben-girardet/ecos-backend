import { Context } from '../../core/context-interface';
import { EditMeInput } from './user.inputs';
export declare class UserResolver {
    users(context: Context, search: string): Promise<any[]>;
    user(id: string): Promise<any>;
    me(context: Context): Promise<any>;
    editMe(context: Context, data: EditMeInput): Promise<any>;
}
