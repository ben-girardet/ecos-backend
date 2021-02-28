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
var RegistrationSMSResolver_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrationSMSResolver = void 0;
const auth_resolver_1 = require("../auth/auth.resolver");
const user_model_1 = require("../user/user.model");
const token_model_1 = require("../auth/token.model");
const login_model_1 = require("../auth/login.model");
const type_graphql_1 = require("type-graphql");
const registration_inputs_1 = require("./registration.inputs");
const smsapicom_1 = __importDefault(require("smsapicom"));
const moment_1 = __importDefault(require("moment"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const gun_1 = __importDefault(require("gun"));
require("gun/sea");
let RegistrationSMSResolver = RegistrationSMSResolver_1 = class RegistrationSMSResolver {
    async requestMobileCode(data) {
        if (!data.mobile) {
            throw new Error('Registration requires a mobile');
        }
        if (data.mobile.substr(0, 1) !== '+') {
            throw new Error('Mobile must be sent in international format starting with a plus sign');
        }
        const smsapi = process.env.SMSAPI_TOKEN !== 'none'
            ? new smsapicom_1.default({ oauth: { accessToken: process.env.SMSAPI_TOKEN } })
            : undefined;
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
        if (!smsapi) {
            console.warn('Missing SMS API token');
        }
        if (smsapi && !isTestAccount) {
            const smsResult = await smsapi.message
                .sms()
                //.from(app.name)
                .from('Info')
                .to(data.mobile)
                .message(RegistrationSMSResolver_1.registrationMessage(token.code))
                .execute(); // return Promise
        }
        return response.toObject();
    }
    async validateCode(data, context) {
        const token = await token_model_1.TokenModel.findValid(data.token, data.code);
        if (!token.data.mobile) {
            throw new Error('Token mobile is empty');
        }
        let user;
        const existingUser = await user_model_1.UserModel.findOne({ mobile: token.data.mobile, mobileValidated: true }).select('refreshTokens salt hash roles privateKey state');
        if (existingUser) {
            user = existingUser;
        }
        else {
            const newUser = new user_model_1.UserModel();
            newUser.firstname = token.data.firstname || '';
            newUser.lastname = token.data.lastname || '';
            newUser.email = token.data.email;
            newUser.mobile = token.data.mobile;
            newUser.roles = ['user'];
            const pair = await this.generatePair();
            newUser.privateKey = pair.epriv;
            newUser.publicKey = pair.epub;
            newUser.state = 0;
            newUser.mobileValidated = true;
            newUser.refreshTokens = [];
            const createdUser = await newUser.save();
            user = new user_model_1.UserModel(createdUser);
        }
        // TODO: indicate somehow that the login has been
        // done with SMS
        // and only reset tokens related to SMS
        // by reseting the refreshTokens here, we ensure
        // that only one device can be logged in at a time
        user.refreshTokens = [];
        const refreshTokenData = user.generateRefreshToken();
        await user.save();
        auth_resolver_1.AuthResolver.sendRefreshToken(context, refreshTokenData);
        const jwtString = jsonwebtoken_1.default.sign({ userId: user.id, roles: user.roles }, process.env.JWT_SECRET_OR_KEY, { expiresIn: process.env.JWT_TOKEN_EXPIRATION, algorithm: 'HS256' });
        // this.setJWTCookie(context.res, jwtString);
        const login = new login_model_1.Login();
        login.token = jwtString;
        const ecosParamsHeader = context.req.header('ecos-params');
        if (ecosParamsHeader && ecosParamsHeader.includes('include-refresh-token')) {
            login.refreshToken = refreshTokenData.refreshToken;
            login.refreshTokenExpiry = moment_1.default(refreshTokenData.expiry).toISOString();
        }
        login.expires = moment_1.default().add(15, 'minutes').toDate(); // TODO: fix this by using the env variable
        login.userId = user._id.toString();
        login.privateKey = user.privateKey;
        login.state = user.state;
        return login;
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
RegistrationSMSResolver.registrationMessage = (code) => {
    return `Ecos registration code: ${code}`;
};
__decorate([
    type_graphql_1.Mutation(() => token_model_1.Token),
    __param(0, type_graphql_1.Arg('data')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [registration_inputs_1.RegisterSMSInput]),
    __metadata("design:returntype", Promise)
], RegistrationSMSResolver.prototype, "requestMobileCode", null);
__decorate([
    type_graphql_1.Mutation(() => login_model_1.Login),
    __param(0, type_graphql_1.Arg('data')), __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [registration_inputs_1.ValidateRegistrationSMSInput, Object]),
    __metadata("design:returntype", Promise)
], RegistrationSMSResolver.prototype, "validateCode", null);
RegistrationSMSResolver = RegistrationSMSResolver_1 = __decorate([
    type_graphql_1.Resolver()
], RegistrationSMSResolver);
exports.RegistrationSMSResolver = RegistrationSMSResolver;
