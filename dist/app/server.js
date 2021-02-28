"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const registration_resolver_1 = require("./../modules/registration-sms/registration.resolver");
const registration_resolver_2 = require("./../modules/registration-password/registration.resolver");
const start_1 = require("../core/start");
const resolvers_1 = require("../resolvers");
const controllers_1 = require("../controllers");
registration_resolver_1.RegistrationSMSResolver.registrationMessage = (code) => {
    return `Ecos test app code: ${code}`;
};
registration_resolver_2.RegistrationPasswordResolver.registrationMessage = (code) => {
    return `Ecos test app code: ${code}`;
};
start_1.Start.whitelist = ['http://localhost:3000', 'http://app:3000', 'http://localhost:9000'];
start_1.Start.default({ resolvers: resolvers_1.resolvers }, controllers_1.controllers);
