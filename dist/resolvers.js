"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const version_1 = require("./modules/version/version");
const user_resolver_1 = require("./modules/user/user.resolver");
const registration_resolver_1 = require("./modules/registration-sms/registration.resolver");
const hello_resolver_1 = require("./modules/hello/hello.resolver");
const auth_resolver_1 = require("./modules/auth/auth.resolver");
const resolvers = [
    version_1.VersionResolver,
    user_resolver_1.UserResolver,
    registration_resolver_1.RegistrationSMSResolver,
    hello_resolver_1.HelloResolver,
    auth_resolver_1.AuthResolver
];
exports.resolvers = resolvers;
