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
var AuthResolver_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.customAuthChecker = exports.AuthResolver = void 0;
const user_model_1 = require("../user/user.model");
const login_model_1 = require("./login.model");
const type_graphql_1 = require("type-graphql");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const moment_1 = __importDefault(require("moment"));
const debug = require('debug')('auth');
let AuthResolver = AuthResolver_1 = class AuthResolver {
    async login(username, password, context) {
        const user = await user_model_1.UserModel
            .findOne({ $or: [
                { email: username, emailValidated: true },
                { mobile: username, mobileValidated: true }
            ] })
            .select('refreshTokens salt hash roles privateKey state');
        if (!user) {
            throw new Error('User not found');
        }
        const passwordValid = user.isPasswordValid(password);
        if (!passwordValid) {
            throw new Error('Invalid password');
        }
        const refreshTokenData = user.generateRefreshToken();
        await user.save();
        AuthResolver_1.sendRefreshToken(context, refreshTokenData);
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
    async refreshToken(context) {
        var _a;
        const { refreshToken } = ((_a = context.req.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken) ? context.req.cookies
            : { refreshToken: context.req.header('refresh-token') };
        if (!refreshToken) {
            throw new Error('No refresh token');
        }
        const hashRefreshToken = crypto_1.default.pbkdf2Sync(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET_OR_KEY, 10000, 512, 'sha512').toString('hex');
        const selectFields = 'refreshTokens salt hash roles privateKey state';
        const foundUser = await user_model_1.UserModel
            .findOne({
            refreshTokens: {
                $elemMatch: {
                    hash: hashRefreshToken,
                    expiry: { $gt: moment_1.default().toDate() }
                }
            }
        })
            .select(selectFields);
        if (!foundUser)
            throw new Error('Invalid refresh token');
        const refreshTokenData = foundUser.generateRefreshToken({ hashToRemove: hashRefreshToken });
        await foundUser.save();
        // foundUser.update({$set: {refreshToken: foundUser.refreshTokens}});
        AuthResolver_1.sendRefreshToken(context, refreshTokenData);
        // TODO: remove this check
        const checkUser = await user_model_1.UserModel.findById(foundUser._id).select('refreshTokens');
        if (checkUser) {
            const refreshTokens = checkUser.refreshTokens.map(rt => rt.hash);
            console.log('User has now', refreshToken.length, 'refresh tokens', refreshTokens.map(rt => rt.substr(0, 10) + '...').join(', '));
        }
        const jwtString = jsonwebtoken_1.default.sign({ userId: foundUser.id, roles: foundUser.roles }, process.env.JWT_SECRET_OR_KEY, { expiresIn: process.env.JWT_TOKEN_EXPIRATION, algorithm: 'HS256' });
        // this.setJWTCookie(context.res, jwtString);
        const login = new login_model_1.Login();
        login.token = jwtString;
        const ecosParamsHeader = context.req.header('ecos-params');
        if (ecosParamsHeader && ecosParamsHeader.includes('include-refresh-token')) {
            login.refreshToken = refreshTokenData.refreshToken;
            login.refreshTokenExpiry = moment_1.default(refreshTokenData.expiry).toISOString();
        }
        login.expires = moment_1.default().add(15, 'minutes').toDate(); // TODO: fix this by using the env variable
        login.userId = foundUser._id.toString();
        login.privateKey = foundUser.privateKey;
        login.state = foundUser.state;
        return login;
    }
    static sendRefreshToken(context, refreshTokenData) {
        console.log('sendRefreshToken', refreshTokenData.refreshToken.substr(0, 10) + '...', refreshTokenData.hash.substr(0, 10) + '...');
        const sameSite = AuthResolver_1.isSameSite(context);
        // console.log('sameSite', sameSite);
        context.res.cookie('refreshToken', refreshTokenData.refreshToken, {
            path: '/graphql',
            httpOnly: true,
            expires: moment_1.default(refreshTokenData.expiry).add(1, 'hour').toDate(),
            domain: undefined,
            secure: !sameSite,
            sameSite: sameSite || 'none'
        });
    }
    async logout(context) {
        const { refreshToken } = context.req.cookies;
        const selectFields = 'refreshTokens';
        // delete the refreshToken from db
        if (refreshToken) {
            const hashRefreshToken = crypto_1.default.pbkdf2Sync(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET_OR_KEY, 10000, 512, 'sha512').toString('hex');
            const foundUser = await user_model_1.UserModel
                .findOne({
                refreshTokens: {
                    $elemMatch: {
                        hash: hashRefreshToken,
                        expiry: { $gt: moment_1.default().toDate() }
                    }
                }
            })
                .select(selectFields);
            if (foundUser) {
                foundUser.refreshTokens = [];
                await foundUser.save();
            }
        }
        // clear the refreshToken coookie
        AuthResolver_1.sendRefreshToken(context, { refreshToken: '', hash: '', expiry: new Date() });
        return true;
    }
};
AuthResolver.isSameSite = (context) => {
    const origin = context.req.get('origin') || '';
    const hostname = context.req.hostname;
    if (origin.includes(hostname)) {
        // console.log('isSameSite', 'Origin includes hostname => true');
        return true;
    }
    if (!origin) {
        // console.log('isSameSite', 'No origin => true');
        return true;
    }
    // TODO: compare origin and hostname and detect if they are "same"
    console.log('isSameSite uncertain => false');
    console.log('isSameSite', 'origin', origin);
    console.log('isSameSite', 'hostname', hostname);
    return false;
};
__decorate([
    type_graphql_1.Mutation(() => login_model_1.Login),
    __param(0, type_graphql_1.Arg('username')), __param(1, type_graphql_1.Arg('password')), __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "login", null);
__decorate([
    type_graphql_1.Mutation(() => login_model_1.Login),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "refreshToken", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "logout", null);
AuthResolver = AuthResolver_1 = __decorate([
    type_graphql_1.Resolver()
], AuthResolver);
exports.AuthResolver = AuthResolver;
const customAuthChecker = ({ root, args, context, info }, roles) => {
    // here we can read the user from context
    // and check his permission in the db against the `roles` argument
    // that comes from the `@Authorized` decorator, eg. ["ADMIN", "MODERATOR"]
    if (!context.user) {
        console.log('auth missing user');
        return false;
    }
    if (root && root._id && root._id.toString() === context.user.userId) {
        context.user.roles.push('me');
    }
    if (roles.some(r => context.user.roles.includes(r))) {
        return true;
    }
    console.log('auth missing required role');
    return false; // or false if access is denied
};
exports.customAuthChecker = customAuthChecker;
