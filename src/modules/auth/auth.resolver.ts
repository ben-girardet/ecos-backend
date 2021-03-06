import { RefreshTokenData, UserModel } from "../user/user.model";
import { Login } from "./login.model";
import { Resolver, Mutation, Ctx, Arg, AuthChecker } from "type-graphql";
import jwt from 'jsonwebtoken';
import { Context } from '../../core/context-interface';
import crypto from 'crypto';
import moment from 'moment';
const debug = require('debug')('auth');

@Resolver()
export class AuthResolver {

    public static isSameSite: (context: Context) => boolean = (context: Context) => {
        const origin = context.req.get('origin') || '';
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
    }

    @Mutation(() => Login)
    public async login(@Arg('username') username: string, @Arg('password') password: string, @Ctx() context: Context) {
        const user = await UserModel
            .findOne({$or: [
                {email: username, emailValidated: true},
                {mobile: username, mobileValidated: true}]})
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
        AuthResolver.sendRefreshToken(context, refreshTokenData);
        const jwtString = jwt.sign({userId: user.id, roles: user.roles}, process.env.JWT_SECRET_OR_KEY as string, { expiresIn: process.env.JWT_TOKEN_EXPIRATION, algorithm: 'HS256' });
        // this.setJWTCookie(context.res, jwtString);
        const login = new Login();
        login.token = jwtString;
        const ecosParamsHeader = context.req.header('ecos-params');
        if (ecosParamsHeader && ecosParamsHeader.includes('include-refresh-token')) {
            login.refreshToken = refreshTokenData.refreshToken;
            login.refreshTokenExpiry = moment(refreshTokenData.expiry).toISOString();
        }
        login.expires = moment().add(15, 'minutes').toDate(); // TODO: fix this by using the env variable
        login.userId = user._id.toString();
        login.privateKey = user.privateKey;
        login.state = user.state;
        return login;
    }

    @Mutation(() => Login)
    public async refreshToken(@Ctx() context: Context) {
        const { refreshToken } = context.req.cookies?.refreshToken
            ? context.req.cookies
            : {refreshToken: context.req.header('refresh-token')};
        if (!refreshToken) {
            throw new Error('No refresh token');
        }
        const hashRefreshToken = crypto.pbkdf2Sync(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET_OR_KEY as string, 10000, 512, 'sha512').toString('hex');

        const selectFields = 'refreshTokens salt hash roles privateKey state'

        const foundUser = await UserModel
            .findOne({
                refreshTokens: {
                    $elemMatch: {
                        hash: hashRefreshToken,
                        expiry: {$gt: moment().toDate()}
                    }
                }})
            .select(selectFields);
        if (!foundUser) throw new Error('Invalid refresh token');
        const refreshTokenData = foundUser.generateRefreshToken({hashToRemove: hashRefreshToken});
        await foundUser.save();
        // foundUser.update({$set: {refreshToken: foundUser.refreshTokens}});
        AuthResolver.sendRefreshToken(context, refreshTokenData);

        // TODO: remove this check
        const checkUser = await UserModel.findById(foundUser._id).select('refreshTokens');
        if (checkUser) {
            const refreshTokens = checkUser.refreshTokens.map(rt => rt.hash);
            console.log('User has now', refreshToken.length, 'refresh tokens', refreshTokens.map(rt => rt.substr(0, 10) + '...').join(', '));
        }

        const jwtString = jwt.sign({userId: foundUser.id, roles: foundUser.roles}, process.env.JWT_SECRET_OR_KEY as string, { expiresIn: process.env.JWT_TOKEN_EXPIRATION, algorithm: 'HS256'});
        // this.setJWTCookie(context.res, jwtString);
        const login = new Login();
        login.token = jwtString;
        const ecosParamsHeader = context.req.header('ecos-params');
        if (ecosParamsHeader && ecosParamsHeader.includes('include-refresh-token')) {
            login.refreshToken = refreshTokenData.refreshToken;
            login.refreshTokenExpiry = moment(refreshTokenData.expiry).toISOString();
        }
        login.expires = moment().add(15, 'minutes').toDate(); // TODO: fix this by using the env variable
        login.userId = foundUser._id.toString();
        login.privateKey = foundUser.privateKey;
        login.state = foundUser.state;
        return login;
    }

    public static sendRefreshToken(context: Context, refreshTokenData: RefreshTokenData,) {
        console.log('sendRefreshToken', refreshTokenData.refreshToken.substr(0, 10) + '...', refreshTokenData.hash.substr(0, 10) + '...');
        const sameSite: boolean = AuthResolver.isSameSite(context);
        // console.log('sameSite', sameSite);

        context.res.cookie('refreshToken', refreshTokenData.refreshToken, {
            path: '/graphql',
            httpOnly: true,
            expires: moment(refreshTokenData.expiry).add(1, 'hour').toDate(),
            domain: undefined,
            secure: !sameSite,
            sameSite: sameSite || 'none'
        });
    }

    @Mutation(() => Boolean)
    public async logout(@Ctx() context: Context) {
        const { refreshToken } = context.req.cookies;
        const selectFields = 'refreshTokens';

        // delete the refreshToken from db
        if (refreshToken) {
            const hashRefreshToken = crypto.pbkdf2Sync(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET_OR_KEY as string, 10000, 512, 'sha512').toString('hex');
            const foundUser = await UserModel
                .findOne({
                    refreshTokens: {
                        $elemMatch: {
                            hash: hashRefreshToken,
                            expiry: {$gt: moment().toDate()}
                        }
                    }})
                .select(selectFields);
            if (foundUser) {
                foundUser.refreshTokens = [];
                await foundUser.save();
            }
        }
        // clear the refreshToken coookie
        AuthResolver.sendRefreshToken(context, {refreshToken: '', hash: '', expiry: new Date()});
        return true;
    }
}

export const customAuthChecker: AuthChecker<Context> =
    ({ root, args, context, info }, roles) => {
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

    if (roles.some(r=> context.user.roles.includes(r))) {
        return true;
    }

    console.log('auth missing required role');
    return false; // or false if access is denied
};
