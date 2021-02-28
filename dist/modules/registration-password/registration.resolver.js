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
var RegistrationPasswordResolver_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrationPasswordResolver = void 0;
const user_model_1 = require("../user/user.model");
const token_model_1 = require("../auth/token.model");
const type_graphql_1 = require("type-graphql");
const registration_inputs_1 = require("./registration.inputs");
const smsapicom_1 = __importDefault(require("smsapicom"));
const gun_1 = __importDefault(require("gun"));
require("gun/sea");
let RegistrationPasswordResolver = RegistrationPasswordResolver_1 = class RegistrationPasswordResolver {
    async exists(username) {
        const existingUser = await user_model_1.UserModel.findOne({ $or: [{ email: username, emailValidated: true }, { mobile: username, mobileValidated: true }] });
        return existingUser !== null;
    }
    async register(data) {
        if (!data.mobile) {
            throw new Error('Registration requires a mobile');
        }
        if (data.mobile.substr(0, 1) !== '+') {
            throw new Error('Mobile must be sent in internation format starting with a plus sign');
        }
        if (!data.mobile && !data.email) {
            throw new Error('Either email or mobile must be provided');
        }
        const smsapi = process.env.SMSAPI_TOKEN !== 'none'
            ? new smsapicom_1.default({ oauth: { accessToken: process.env.SMSAPI_TOKEN } })
            : undefined;
        const existingUser = await user_model_1.UserModel.findOne({ $or: [{ email: data.email, emailValidated: true }, { mobile: data.mobile, mobileValidated: true }] });
        if (existingUser) {
            if (existingUser.email === data.email) {
                throw new Error('This email is already taken');
            }
            if (existingUser.mobile === data.mobile) {
                throw new Error('This mobile is already taken');
            }
        }
        const token = new token_model_1.TokenModel();
        token.setToken();
        token.data = data;
        const TEST_NUMBERS = (process.env.TEST_NUMBERS || '').split(',');
        const TEST_CODES = (process.env.TEST_CODES || '').split(',');
        const TEST_INDEX = TEST_NUMBERS.indexOf(data.mobile);
        const isTestAccount = TEST_INDEX !== -1;
        if (isTestAccount) {
            token.code = TEST_CODES[TEST_INDEX];
        }
        const response = await token.save();
        if (smsapi && !isTestAccount) {
            await smsapi.message
                .sms()
                //.from(app.name)
                .from('Info')
                .to(data.mobile)
                .message(RegistrationPasswordResolver_1.registrationMessage(token.code))
                .execute(); // return Promise
        }
        return response.toObject();
    }
    async validateRegistration(data) {
        if (data.type !== 'email' && data.type !== 'mobile') {
            throw new Error('Type must be either "email" or "mobile"');
        }
        const token = await token_model_1.TokenModel.findValid(data.token, data.code);
        if (data.type === 'email' && !token.data.email) {
            throw new Error('Token email is empty');
        }
        if (data.type === 'mobile' && !token.data.mobile) {
            throw new Error('Token mobile is empty');
        }
        const existingUser = await user_model_1.UserModel.findOne({ $or: [{ email: token.data.email, emailValidated: true }, { mobile: token.data.mobile, mobileValidated: true }] });
        if (existingUser) {
            if (existingUser.email === token.data.email) {
                throw new Error('This email is already taken');
            }
            if (existingUser.mobile === token.data.mobile) {
                throw new Error('This mobile is already taken');
            }
        }
        const newUser = new user_model_1.UserModel();
        newUser.firstname = token.data.firstname || '';
        newUser.lastname = token.data.lastname || '';
        newUser.email = token.data.email;
        newUser.mobile = token.data.mobile;
        newUser.roles = ['user'];
        const isTestAccount = token.data.mobile.substr(0, 8) === '+4170000';
        if (isTestAccount) {
            data.password = process.env.TEST_PASSWORD || 'this-must-be-set-by-env-variable';
        }
        newUser.hashPassword(data.password);
        const pair = await this.generatePair();
        newUser.privateKey = pair.epriv;
        newUser.publicKey = pair.epub;
        newUser.state = 0;
        if (data.type === 'email') {
            newUser.emailValidated = true;
        }
        if (data.type === 'mobile') {
            newUser.mobileValidated = true;
        }
        const createdUser = await newUser.save();
        token.used = true;
        await token.save();
        return createdUser.toObject();
    }
    async forgotPassword(username) {
        const user = await user_model_1.UserModel.findOne({ $or: [
                { email: username },
                { mobile: username }
            ] });
        if (!user) {
            throw new Error('User not found');
        }
        const token = new token_model_1.TokenModel();
        token.setToken();
        token.data = username;
        const response = await token.save();
        return response.toObject();
    }
    async resetPassword(tokenString, code, password) {
        const token = await token_model_1.TokenModel.findValid(tokenString, code);
        if (!token.data.username) {
            throw new Error('Token is missing username');
        }
        const user = await user_model_1.UserModel.findOne({ $or: [
                { email: token.data.username },
                { mobile: token.data.username }
            ] });
        if (!user) {
            throw new Error('User not found');
        }
        user.hashPassword(password);
        const response = await user.save();
        return response.toObject();
    }
    async generatePair() {
        const SEA = gun_1.default.SEA;
        return new Promise((resolve) => {
            SEA.pair((pair) => {
                resolve(pair);
            });
        });
    }
};
RegistrationPasswordResolver.registrationMessage = (code) => {
    return `Ecos registration code: ${code}`;
};
__decorate([
    type_graphql_1.Query(() => Boolean),
    __param(0, type_graphql_1.Arg('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RegistrationPasswordResolver.prototype, "exists", null);
__decorate([
    type_graphql_1.Mutation(() => token_model_1.Token),
    __param(0, type_graphql_1.Arg('data')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [registration_inputs_1.RegisterEmailInput]),
    __metadata("design:returntype", Promise)
], RegistrationPasswordResolver.prototype, "register", null);
__decorate([
    type_graphql_1.Mutation(() => user_model_1.User),
    __param(0, type_graphql_1.Arg('data')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [registration_inputs_1.ValidateRegistrationEmailInput]),
    __metadata("design:returntype", Promise)
], RegistrationPasswordResolver.prototype, "validateRegistration", null);
__decorate([
    type_graphql_1.Mutation(() => token_model_1.Token),
    __param(0, type_graphql_1.Arg('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RegistrationPasswordResolver.prototype, "forgotPassword", null);
__decorate([
    type_graphql_1.Mutation(() => user_model_1.User),
    __param(0, type_graphql_1.Arg('token')), __param(1, type_graphql_1.Arg('code')), __param(2, type_graphql_1.Arg('password')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], RegistrationPasswordResolver.prototype, "resetPassword", null);
RegistrationPasswordResolver = RegistrationPasswordResolver_1 = __decorate([
    type_graphql_1.Resolver()
], RegistrationPasswordResolver);
exports.RegistrationPasswordResolver = RegistrationPasswordResolver;
