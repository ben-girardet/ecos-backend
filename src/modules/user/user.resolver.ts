import { setAsync, client, getAsync } from '../../core/redis';
import { User, UserModel } from './user.model';
import { Resolver, Query, Arg, Ctx, Mutation, Authorized, ObjectType, Field } from 'type-graphql';
import { FilterQuery } from 'mongoose';
import { Context } from '../../core/context-interface';
import mongoose from 'mongoose';
import { EditMeInput, EditUserInput } from './user.inputs';
import { removeModelItem } from '../../core/redis';
import PhoneNumber from 'awesome-phonenumber';
import { PushPlayerModel } from '../push/push-player.model';

@Resolver()
export class UserResolver {

  @Authorized(['user'])
  @Query(() => [User])
  public async users(@Ctx() context: Context, @Arg("search", {nullable: true}) search: string) {
    const query: FilterQuery<typeof UserModel> = {};

    const roles = context.user?.roles || [];
    if (!roles.includes('admin')) {
        console.log('query users 2');
        if (!search || search.length < 3) {
            throw new Error('users query is only allowed for 3+ search word');
        }
    }

    if (search) {
        query.$or = [
            {email: search},
            {mobile: search},
            {firstname: {$regex: `${search}`, $options: 'i'}},
            {lastname: {$regex: `${search}`, $options: 'i'}}
        ];

        for (const countryCode of ['ch']) {
            const phoneNumber = new PhoneNumber( search, countryCode );
            if (phoneNumber.isValid()) {
                query.$or.push({mobile: phoneNumber.getNumber()});
            }
        }
        query._id = {$ne: new mongoose.Types.ObjectId(context.user.userId)};
    }
    const users = await UserModel.find(query);
    const objects = users.map(u => u.toObject());
    return objects;
  }

  @Authorized(['user'])
  @Query(() => User)
  public async user(@Arg("id") id: string) {
    const user = await UserModel.findById(id);
    if (!user) {
        throw new Error('User not found');
    }
    return user.toObject();
  }

  @Authorized(['user'])
  @Query(() => User)
  public async me(@Ctx() context: Context) {
    const userId = new mongoose.Types.ObjectId(context.user.userId);
    const user = await UserModel.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    return user.toObject();
  }

  @Authorized(['user'])
  @Mutation(() => User)
  public async editMe(@Ctx() context: Context, @Arg('data') data: EditMeInput) {
    const userId = new mongoose.Types.ObjectId(context.user.userId);
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (data.firstname !== undefined) {
      user.firstname = data.firstname;
    }
    if (data.lastname !== undefined) {
      user.lastname = data.lastname;
    }
    if (data.picture !== undefined) {
      user.picture = data.picture;
    }
    if (user.firstname && user.lastname && user.picture !== undefined) {
        user.state = 1;
    }

    removeModelItem('user', user._id.toString());
    const updatedUser = await user.save();
    const updatedUserInstance = new UserModel(updatedUser);

    if (typeof data.regId === 'string' && Array.isArray(data.pushTags)) {
        const existingPlayer = await PushPlayerModel.findOne({user: new mongoose.Types.ObjectId(updatedUserInstance._id)});
        if (existingPlayer) {
            const regId = data.regId;
            const tags = data.pushTags
            const active = data.pushActive !== undefined ? data.pushActive : existingPlayer.active;
            const type = data.pushType ? data.pushType : existingPlayer.type;
            //await existingPlayer.save();
            await PushPlayerModel.updateMany({_id: existingPlayer._id}, {$set: {regId, tags, active, type}});
        } else {
            const newPlayer = new PushPlayerModel();
            newPlayer.user = updatedUserInstance._id;
            newPlayer.regId = data.regId;
            newPlayer.tags = data.pushTags;
            newPlayer.active = data.pushActive !== undefined ? data.pushActive : true;
            newPlayer.type = data.pushType || 'apn';
            await newPlayer.save();
        }
    }

    return updatedUserInstance.toObject();
  }

  @Authorized(['admin'])
  @Mutation(() => User)
  public async editUser(@Arg('userId') userId: string, @Arg('data') data: EditUserInput) {

    const user = await UserModel.findById(new mongoose.Types.ObjectId(userId));
    if (!user) {
      throw new Error('User not found');
    }

    if (data.roles !== undefined) {
      user.roles = data.roles;
    }
    if (data.state !== undefined) {
      user.state = data.state;
    }

    removeModelItem('user', user._id.toString());
    const updatedUser = await user.save();
    const updatedUserInstance = new UserModel(updatedUser);
    return updatedUserInstance.toObject();
  }
}

