import { User } from "../user/user.model";
import { Ref } from "@typegoose/typegoose";
import mongoose from 'mongoose';
export declare class PushPlayer {
    get id(): string;
    _id: mongoose.Types.ObjectId;
    user?: Ref<User>;
    get userId(): string;
    regId: string;
    uuid: string;
    type: 'fcm' | 'apn';
    tags: string[];
    active: boolean;
}
declare const PushPlayerModel: import("@typegoose/typegoose").ReturnModelType<typeof PushPlayer, {}>;
export { PushPlayerModel };
