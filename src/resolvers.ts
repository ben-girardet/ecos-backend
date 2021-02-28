import { NonEmptyArray } from 'type-graphql';
import { VersionResolver } from './modules/version/version';
import { UserResolver } from './modules/user/user.resolver';
import { RegistrationSMSResolver } from './modules/registration-sms/registration.resolver';
import { HelloResolver } from './modules/hello/hello.resolver';
import { AuthResolver } from './modules/auth/auth.resolver';

const resolvers: NonEmptyArray<Function> = [
    VersionResolver,
    UserResolver,
    RegistrationSMSResolver,
    HelloResolver,
    AuthResolver
];

export { resolvers };
