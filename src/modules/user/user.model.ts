import crypto from 'crypto';
// TODO: import the type from ecos-types
import { IUser } from '../../types/user';
import { ObjectType, Field, Authorized, Ctx, Root, Resolver } from "type-graphql";
import { prop, getModelForClass } from "@typegoose/typegoose";
import mongoose from 'mongoose';
import moment from 'moment';
import { Image } from '../image/image.model';
import { saveModelItem, getModelItem } from '../../core/redis';
import { PushPlayerModel, PushPlayer } from '../push/push-player.model';

export interface RefreshTokenData {
  refreshToken: string;
  hash: string;
  expiry: Date
}

export class RefreshToken {
  @prop()
  hash: string;

  @prop()
  expiry: Date;
}

@ObjectType()
@Resolver(of => User)
export class User implements IUser {

  // @prop()
  public _id: mongoose.Types.ObjectId;

  @Field(() => String)
  public get id(): string {
      return (this as any)._id ? (this as any)._id.toString() : '';
  };

  @Field(() => String)
  @prop()
  public firstname: string;

  @Field(() => String)
  @prop()
  public lastname: string;

  @Authorized(['me', 'admin'])
  @Field(() => String, {nullable: true})
  @prop({index: true})
  public email: string;

  @prop()
  public emailValidated?: boolean;

  @Authorized(['me', 'admin'])
  @Field(() => String)
  @prop({index: true})
  public mobile: string;

  @prop()
  public mobileValidated?: boolean;

  @Field(type => [Image], {nullable: true})
  @prop({type: () => [Image]})
  public picture?: Image[];

  @prop()
  public hash: string;

  @prop()
  public salt: string;

  @Field(() => String, {nullable: true})
  @prop()
  public publicKey: string;

  @Authorized(['me'])
  @prop()
  public privateKey: string;

  @prop()
  public lastLogin?: Date;

  @Field(() => [String], {nullable: false})
  @prop({type: () => [String]})
  public roles: string[];

  @prop({type: () => [RefreshToken], _id: false, select: false, index: true})
  public refreshTokens: RefreshToken[];

  // 0 = need to set identity
  // 1 = identity set and active
  // -1 inactive user
  @Authorized(['me', 'admin'])
  @Field(() => Number)
  @prop()
  public state = 0;

  @Field(() => Date)
  @prop()
  public createdAt: Date;

  @Field(() => Date)
  @prop()
  public updatedAt: Date;

  @Authorized(['me'])
  @Field(() => PushPlayer, {nullable: true})
    public async player(@Root() user: User) {
        const player = await PushPlayerModel.findOne({user: user._id});
        if (!player) {
            return null;
        }
        return player.toObject()
    }

  public hashPassword(password: string) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  }

  public isPasswordValid(password: string): boolean {
    const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    return this.hash === hash;
  }

  public generateRefreshToken(options?: {hashToRemove?: string}): RefreshTokenData {
    const refreshToken = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET_OR_KEY as string, 10000, 512, 'sha512').toString('hex');
    const expiry = moment().add(30, 'days').toDate();
    this.refreshTokens.push({
        hash,
        expiry
    });
    if (options?.hashToRemove) {
        this.refreshTokens = this.refreshTokens.filter(rt => rt.hash !== options.hashToRemove);
    }
    return { refreshToken, hash, expiry };
  }

  public static async findByIdWithCache(id: any): Promise<User | null> {
    if (!id) {
      return null;
    }
    const cacheValue = await getModelItem('user', id.toString());
    if (cacheValue) {
      return new UserModel(cacheValue).toObject();
    }
    const value = await UserModel.findById(id).select('firstname lastname picture')
    if (!value) {
      return value;
    }

    const objectValue = value.toObject();
    saveModelItem('user', objectValue);
    return objectValue;
  }

}

const UserModel = getModelForClass(User, {schemaOptions: {timestamps: true}});
export { UserModel };
