import mongoose from 'mongoose';
export declare class PushNotification {
    get id(): string;
    _id: mongoose.Types.ObjectId;
    regIds: Array<string>;
    sentToRegIds: Array<string>;
    viewedByRegIds: Array<string>;
    openedByRegIds: Array<string>;
    title: string;
    message: string;
    collapseKey?: string;
    contentAvailable?: boolean;
    badge?: number;
    custom: string;
    sendToTags: Array<string>;
    sent: boolean;
    sentAt: Date;
}
declare const PushNotificationModel: import("@typegoose/typegoose").ReturnModelType<typeof PushNotification, {}>;
export { PushNotificationModel };
