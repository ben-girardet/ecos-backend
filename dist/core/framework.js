"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Put = exports.Patch = exports.Options = exports.Delete = exports.Post = exports.Get = exports.Verb = exports.Controller = exports.registerControllers = void 0;
const use_1 = require("../middleware/use");
const registerControllers = (controllers, app) => {
    controllers.forEach(controller => {
        const instance = new controller();
        const prefix = Reflect.getMetadata('prefix', controller);
        const routes = Reflect.getMetadata('routes', controller) || [];
        routes.forEach(route => {
            app[route.method](`${prefix}${route.path}`, (req, res, next) => {
                use_1.use(instance[route.name](req, res, next));
            });
        });
    });
};
exports.registerControllers = registerControllers;
const Controller = (prefix = '') => {
    return (target) => {
        Reflect.defineMetadata('prefix', prefix, target);
    };
};
exports.Controller = Controller;
const Verb = (path, verb) => {
    return (target, propertyKey) => {
        if (!Reflect.hasMetadata('routes', target.constructor)) {
            Reflect.defineMetadata('routes', [], target.constructor);
        }
        const routes = Reflect.getMetadata('routes', target.constructor);
        routes.push({
            method: verb,
            path,
            name: propertyKey
        });
        Reflect.defineMetadata('routes', routes, target.constructor);
    };
};
exports.Verb = Verb;
const Get = (path) => {
    return exports.Verb(path, 'get');
};
exports.Get = Get;
const Post = (path) => {
    return exports.Verb(path, 'post');
};
exports.Post = Post;
const Delete = (path) => {
    return exports.Verb(path, 'delete');
};
exports.Delete = Delete;
const Options = (path) => {
    return exports.Verb(path, 'options');
};
exports.Options = Options;
const Patch = (path) => {
    return exports.Verb(path, 'patch');
};
exports.Patch = Patch;
const Put = (path) => {
    return exports.Verb(path, 'put');
};
exports.Put = Put;
