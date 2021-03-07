"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResolver = void 0;
const user_model_1 = require("./user.model");
const type_graphql_1 = require("type-graphql");
const mongoose_1 = __importDefault(require("mongoose"));
const user_inputs_1 = require("./user.inputs");
const redis_1 = require("../../core/redis");
const awesome_phonenumber_1 = __importDefault(require("awesome-phonenumber"));
const push_player_model_1 = require("../push/push-player.model");
let UserResolver = class UserResolver {
    async users(context, search) {
        var _a;
        const query = {};
        const roles = ((_a = context.user) === null || _a === void 0 ? void 0 : _a.roles) || [];
        if (!roles.includes('admin')) {
            console.log('query users 2');
            if (!search || search.length < 3) {
                throw new Error('users query is only allowed for 3+ search word');
            }
        }
        if (search) {
            query.$or = [
                { email: search },
                { mobile: search },
                { firstname: { $regex: `${search}`, $options: 'i' } },
                { lastname: { $regex: `${search}`, $options: 'i' } }
            ];
            for (const countryCode of ['ch']) {
                const phoneNumber = new awesome_phonenumber_1.default(search, countryCode);
                if (phoneNumber.isValid()) {
                    query.$or.push({ mobile: phoneNumber.getNumber() });
                }
            }
            query._id = { $ne: new mongoose_1.default.Types.ObjectId(context.user.userId) };
        }
        const users = await user_model_1.UserModel.find(query);
        const objects = users.map(u => u.toObject());
        return objects;
    }
    async user(id) {
        const user = await user_model_1.UserModel.findById(id);
        if (!user) {
            throw new Error('User not found');
        }
        return user.toObject();
    }
    async me(context) {
        const userId = new mongoose_1.default.Types.ObjectId(context.user.userId);
        const user = await user_model_1.UserModel.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        return user.toObject();
    }
    async editMe(context, data) {
        const userId = new mongoose_1.default.Types.ObjectId(context.user.userId);
        const user = await user_model_1.UserModel.findById(userId);
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
        redis_1.removeModelItem('user', user._id.toString());
        const updatedUser = await user.save();
        const updatedUserInstance = new user_model_1.UserModel(updatedUser);
        if (typeof data.regId === 'string' && Array.isArray(data.pushTags)) {
            const existingPlayer = await push_player_model_1.PushPlayerModel.findOne({ user: new mongoose_1.default.Types.ObjectId(updatedUserInstance._id) });
            if (existingPlayer) {
                const regId = data.regId;
                const tags = data.pushTags;
                const active = data.pushActive !== undefined ? data.pushActive : existingPlayer.active;
                const type = data.pushType ? data.pushType : existingPlayer.type;
                //await existingPlayer.save();
                await push_player_model_1.PushPlayerModel.updateMany({ _id: existingPlayer._id }, { $set: { regId, tags, active, type } });
            }
            else {
                const newPlayer = new push_player_model_1.PushPlayerModel();
                newPlayer.user = updatedUserInstance._id;
                newPlayer.regId = data.regId;
                newPlayer.tags = data.pushTags;
                newPlayer.active = data.pushActive !== undefined ? data.pushActive : true;
                newPlayer.type = data.pushType || 'apn';
                await newPlayer.save();
            }
        }
        return updatedUserInstance.toObject();
    }
};
__decorate([
    type_graphql_1.Authorized(['user']),
    type_graphql_1.Query(() => [user_model_1.User]),
    __param(0, type_graphql_1.Ctx()), __param(1, type_graphql_1.Arg("search", { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "users", null);
__decorate([
    type_graphql_1.Authorized(['user']),
    type_graphql_1.Query(() => user_model_1.User),
    __param(0, type_graphql_1.Arg("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "user", null);
__decorate([
    type_graphql_1.Authorized(['user']),
    type_graphql_1.Query(() => user_model_1.User),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "me", null);
__decorate([
    type_graphql_1.Authorized(['user']),
    type_graphql_1.Mutation(() => user_model_1.User),
    __param(0, type_graphql_1.Ctx()), __param(1, type_graphql_1.Arg('data')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, user_inputs_1.EditMeInput]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "editMe", null);
UserResolver = __decorate([
    type_graphql_1.Resolver()
], UserResolver);
exports.UserResolver = UserResolver;
