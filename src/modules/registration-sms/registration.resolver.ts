import { AuthResolver } from '../auth/auth.resolver';
import { DocumentType } from '@typegoose/typegoose';
import { User, UserModel } from '../user/user.model';
import { Token, TokenModel } from '../auth/token.model';
import { Login } from '../auth/login.model';
import { Resolver, Mutation, Query, Arg, Ctx } from 'type-graphql';
import { RegisterSMSInput, ValidateRegistrationSMSInput } from './registration.inputs';
import SMSAPI from 'smsapicom';
import moment from 'moment';
import jwt from 'jsonwebtoken';
import Gun from 'gun';
import { Context } from '../../core/context-interface';
import 'gun/sea';

interface SeaPair {
    priv: string;
    pub: string;
    epriv: string;
    epub: string;
}

@Resolver()
export class RegistrationSMSResolver {

    public static registrationMessage: (code: string) => string = (code: string) => {
        return `Ecos registration code: ${code}`;
    }

    @Mutation(() => Token)
    public async requestMobileCode(@Arg('data') data: RegisterSMSInput) {
        if (!data.mobile) {
            throw new Error('Registration requires a mobile');
        }
        if (data.mobile.substr(0, 1) !== '+') {
            throw new Error('Mobile must be sent in international format starting with a plus sign');
        }
        const smsapi = process.env.SMSAPI_TOKEN !== 'none'
            ? new SMSAPI({ oauth: { accessToken: process.env.SMSAPI_TOKEN }})
            : undefined;
        const token = new TokenModel();
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
                .message(RegistrationSMSResolver.registrationMessage(token.code as string))
                .execute(); // return Promise
        }
        return response.toObject();
    }

    @Mutation(() => Login)
    public async validateCode(@Arg('data') data: ValidateRegistrationSMSInput, @Ctx() context: Context) {
        const token = await TokenModel.findValid(data.token, data.code);
        if (!token.data.mobile) {
            throw new Error('Token mobile is empty');
        }

        let user: DocumentType<User>;
        const existingUser = await UserModel.findOne(
            {mobile: token.data.mobile, mobileValidated: true}
            ).select('refreshTokens salt hash roles privateKey state');
        if (existingUser) {
            user = existingUser;
        } else {
            const newUser = new UserModel();
            newUser.firstname = token.data.firstname || '';
            newUser.lastname = token.data.lastname || '';
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
            user = new UserModel(createdUser);
        }

        // TODO: indicate somehow that the login has been
        // done with SMS
        // and only reset tokens related to SMS
        // by reseting the refreshTokens here, we ensure
        // that only one device can be logged in at a time
        user.refreshTokens = [];
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

    private async generatePair(): Promise<SeaPair> {
        const SEA = Gun.SEA;
        return new Promise((resolve) => {
        SEA.pair((pair) => {
            resolve(pair as unknown as SeaPair);
        });
        });
    }

}
