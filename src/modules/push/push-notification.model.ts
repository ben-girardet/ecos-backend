import { UserModel } from "../user/user.model";
import { ObjectType } from "type-graphql";
import { prop, getModelForClass } from "@typegoose/typegoose";
import mongoose from 'mongoose';
import { PushPlayerModel } from "./push-player.model";
import { pushService } from './push-service';

@ObjectType()
export class PushNotification {

    public get id(): string {
        return (this as any)._id ? (this as any)._id.toString() : '';
    };

    public _id: mongoose.Types.ObjectId;

    // @Field(() => [String], {nullable: false})
    @prop({type: () => [String]})
    public regIds: Array<string> = [];

    // @Field(() => [String], {nullable: false})
    @prop({type: () => [String]})
    public sentToRegIds: Array<string> = [];

    // @Field(() => [String], {nullable: false})
    @prop({type: () => [String]})
    public viewedByRegIds: Array<string> = [];

    //@Field(() => [String], {nullable: false})
    @prop({type: () => [String]})
    public openedByRegIds: Array<string> = [];

    @prop()
    public title: string;

    @prop()
    public message: string;

    @prop()
    public collapseKey?: string;

    @prop()
    public contentAvailable?: boolean = false;

    @prop()
    public badge?: number;

    @prop()
    public custom: string;

    //@Field(() => [String], {nullable: false})
    @prop({type: () => [String]})
    public sendToTags: Array<string> = [];

    @prop({index: true})
    public sent: boolean = false;

    @prop()
    public sentAt: Date;
}

const PushNotificationModel = getModelForClass(PushNotification, {schemaOptions: {timestamps: false}});
export { PushNotificationModel };
