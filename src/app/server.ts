import { RegistrationSMSResolver } from './../modules/registration-sms/registration.resolver';
import { RegistrationPasswordResolver } from './../modules/registration-password/registration.resolver';
import { Start } from '../core/start';
import { resolvers } from '../resolvers';
import { controllers } from '../controllers';
import { NonEmptyArray } from 'type-graphql';

RegistrationSMSResolver.registrationMessage = (code: string) => {
    return `Ecos test app code: ${code}`;
}
RegistrationPasswordResolver.registrationMessage = (code: string) => {
    return `Ecos test app code: ${code}`;
}

Start.whitelist = ['http://localhost:3000', 'http://app:3000', 'http://localhost:9000'];
Start.default({resolvers: resolvers as NonEmptyArray<Function>},  controllers);
