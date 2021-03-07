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
var User_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = exports.User = exports.RefreshToken = void 0;
const crypto_1 = __importDefault(require("crypto"));
const type_graphql_1 = require("type-graphql");
const typegoose_1 = require("@typegoose/typegoose");
const moment_1 = __importDefault(require("moment"));
const image_model_1 = require("../image/image.model");
const redis_1 = require("../../core/redis");
const push_player_model_1 = require("../push/push-player.model");
class RefreshToken {
}
__decorate([
    typegoose_1.prop(),
    __metadata("design:type", String)
], RefreshToken.prototype, "hash", void 0);
__decorate([
    typegoose_1.prop(),
    __metadata("design:type", Date)
], RefreshToken.prototype, "expiry", void 0);
exports.RefreshToken = RefreshToken;
let User = User_1 = class User {
    constructor() {
        // 0 = need to set identity
        // 1 = identity set and active
        // -1 inactive user
        this.state = 0;
    }
    get id() {
        return this._id ? this._id.toString() : '';
    }
    ;
    async player(user) {
        const player = await push_player_model_1.PushPlayerModel.findOne({ user: user._id });
        if (!player) {
            return null;
        }
        return player.toObject();
    }
    hashPassword(password) {
        this.salt = crypto_1.default.randomBytes(16).toString('hex');
        this.hash = crypto_1.default.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    }
    isPasswordValid(password) {
        const hash = crypto_1.default.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
        return this.hash === hash;
    }
    generateRefreshToken(options) {
        const refreshToken = crypto_1.default.randomBytes(16).toString('hex');
        const hash = crypto_1.default.pbkdf2Sync(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET_OR_KEY, 10000, 512, 'sha512').toString('hex');
        const expiry = moment_1.default().add(30, 'days').toDate();
        this.refreshTokens.push({
            hash,
            expiry
        });
        if (options === null || options === void 0 ? void 0 : options.hashToRemove) {
            this.refreshTokens = this.refreshTokens.filter(rt => rt.hash !== options.hashToRemove);
        }
        return { refreshToken, hash, expiry };
    }
    static async findByIdWithCache(id) {
        if (!id) {
            return null;
        }
        const cacheValue = await redis_1.getModelItem('user', id.toString());
        if (cacheValue) {
            return new UserModel(cacheValue).toObject();
        }
        const value = await UserModel.findById(id).select('firstname lastname picture');
        if (!value) {
            return value;
        }
        const objectValue = value.toObject();
        redis_1.saveModelItem('user', objectValue);
        return objectValue;
    }
};
__decorate([
    type_graphql_1.Field(() => String),
    __metadata("design:type", String),
    __metadata("design:paramtypes", [])
], User.prototype, "id", null);
__decorate([
    type_graphql_1.Field(() => String),
    typegoose_1.prop(),
    __metadata("design:type", String)
], User.prototype, "firstname", void 0);
__decorate([
    type_graphql_1.Field(() => String),
    typegoose_1.prop(),
    __metadata("design:type", String)
], User.prototype, "lastname", void 0);
__decorate([
    type_graphql_1.Authorized(['me', 'admin']),
    type_graphql_1.Field(() => String, { nullable: true }),
    typegoose_1.prop({ index: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    typegoose_1.prop(),
    __metadata("design:type", Boolean)
], User.prototype, "emailValidated", void 0);
__decorate([
    type_graphql_1.Authorized(['me', 'admin']),
    type_graphql_1.Field(() => String),
    typegoose_1.prop({ index: true }),
    __metadata("design:type", String)
], User.prototype, "mobile", void 0);
__decorate([
    typegoose_1.prop(),
    __metadata("design:type", Boolean)
], User.prototype, "mobileValidated", void 0);
__decorate([
    type_graphql_1.Field(type => [image_model_1.Image], { nullable: true }),
    typegoose_1.prop({ type: () => [image_model_1.Image] }),
    __metadata("design:type", Array)
], User.prototype, "picture", void 0);
__decorate([
    typegoose_1.prop(),
    __metadata("design:type", String)
], User.prototype, "hash", void 0);
__decorate([
    typegoose_1.prop(),
    __metadata("design:type", String)
], User.prototype, "salt", void 0);
__decorate([
    type_graphql_1.Field(() => String, { nullable: true }),
    typegoose_1.prop(),
    __metadata("design:type", String)
], User.prototype, "publicKey", void 0);
__decorate([
    type_graphql_1.Authorized(['me']),
    typegoose_1.prop(),
    __metadata("design:type", String)
], User.prototype, "privateKey", void 0);
__decorate([
    typegoose_1.prop(),
    __metadata("design:type", Date)
], User.prototype, "lastLogin", void 0);
__decorate([
    type_graphql_1.Field(() => [String], { nullable: false }),
    typegoose_1.prop({ type: () => [String] }),
    __metadata("design:type", Array)
], User.prototype, "roles", void 0);
__decorate([
    typegoose_1.prop({ type: () => [RefreshToken], _id: false, select: false, index: true }),
    __metadata("design:type", Array)
], User.prototype, "refreshTokens", void 0);
__decorate([
    type_graphql_1.Authorized(['me', 'admin']),
    type_graphql_1.Field(() => Number),
    typegoose_1.prop(),
    __metadata("design:type", Object)
], User.prototype, "state", void 0);
__decorate([
    type_graphql_1.Field(() => Date),
    typegoose_1.prop(),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    type_graphql_1.Field(() => Date),
    typegoose_1.prop(),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
__decorate([
    type_graphql_1.Authorized(['me']),
    type_graphql_1.Field(() => push_player_model_1.PushPlayer, { nullable: true }),
    __param(0, type_graphql_1.Root()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User]),
    __metadata("design:returntype", Promise)
], User.prototype, "player", null);
User = User_1 = __decorate([
    type_graphql_1.ObjectType(),
    type_graphql_1.Resolver(of => User_1)
], User);
exports.User = User;
const UserModel = typegoose_1.getModelForClass(User, { schemaOptions: { timestamps: true } });
exports.UserModel = UserModel;
