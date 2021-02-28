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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenModel = exports.Token = void 0;
const crypto_1 = __importDefault(require("crypto"));
const type_graphql_1 = require("type-graphql");
const typegoose_1 = require("@typegoose/typegoose");
const moment_1 = __importDefault(require("moment"));
let Token = class Token {
    get id() {
        return this._id ? this._id.toString() : '';
    }
    ;
    setToken() {
        this.token = crypto_1.default.randomBytes(16).toString('hex');
        this.code = Math.floor(100000 + Math.random() * 900000).toString();
        this.expires = moment_1.default().add(24, 'hours').toDate();
    }
    static async findValid(tokenString, code) {
        const token = await TokenModel.findOne({ token: tokenString, code });
        if (!token) {
            throw new Error('Token not found');
        }
        if (token.used) {
            throw new Error('Token was already used');
        }
        if (moment_1.default(token.expires).isBefore(moment_1.default())) {
            throw new Error('Token has expired');
        }
        return token;
    }
};
__decorate([
    type_graphql_1.Field(() => String),
    __metadata("design:type", String),
    __metadata("design:paramtypes", [])
], Token.prototype, "id", null);
__decorate([
    type_graphql_1.Field(() => String),
    typegoose_1.prop(),
    __metadata("design:type", String)
], Token.prototype, "token", void 0);
__decorate([
    typegoose_1.prop(),
    __metadata("design:type", String)
], Token.prototype, "code", void 0);
__decorate([
    typegoose_1.prop({ nullable: true, select: true }),
    __metadata("design:type", Object)
], Token.prototype, "data", void 0);
__decorate([
    type_graphql_1.Field(() => Date),
    typegoose_1.prop(),
    __metadata("design:type", Date)
], Token.prototype, "expires", void 0);
__decorate([
    typegoose_1.prop(),
    __metadata("design:type", Boolean)
], Token.prototype, "used", void 0);
Token = __decorate([
    type_graphql_1.ObjectType()
], Token);
exports.Token = Token;
const TokenModel = typegoose_1.getModelForClass(Token, { schemaOptions: { timestamps: true } });
exports.TokenModel = TokenModel;
