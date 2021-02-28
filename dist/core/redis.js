"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.getModelItems = exports.saveModelItems = exports.removeModelItem = exports.getModelItem = exports.saveModelItem = exports.client = exports.hdelAsync = exports.hsetAsync = exports.hgetAllAsync = exports.hgetAsync = exports.llenAsync = exports.lremAsync = exports.rpushAsync = exports.lpushAsync = exports.lrangeAsync = exports.delAsync = exports.setAsync = exports.getAsync = exports.existsAsync = void 0;
const redis_1 = __importDefault(require("redis"));
const util_1 = require("util");
const moment_1 = __importDefault(require("moment"));
const chalk_1 = __importDefault(require("chalk"));
const typegoose_1 = require("@typegoose/typegoose");
// TODO: ideas to improve redis cache
// in the list save, only persist ids
// when saving a list
// => send a list with complete objects to cache
// => only persists the ids (in order) in the list cache
// => save each item individually in their own cache (saveModelItem)
// when getting a list
// => get the ids order from the list cache
// => re-compute the full list with getModelItem on each element
// Check with a benchmark if this idea is beneficial or not
const enableCache = true;
const logCache = false;
const host = (_a = process.env.REDIS_HOST) !== null && _a !== void 0 ? _a : '127.0.0.1';
const port = (_b = parseInt(process.env.REDIS_PORT)) !== null && _b !== void 0 ? _b : 6379;
if (logCache) {
    console.log(chalk_1.default.dim('redis host:', host));
    console.log(chalk_1.default.dim('redis port:', port));
}
const client = redis_1.default.createClient({
    port,
    host,
    password: process.env.REDIS_PASSWORD || undefined
});
exports.client = client;
exports.existsAsync = util_1.promisify(client.exists).bind(client);
exports.getAsync = util_1.promisify(client.get).bind(client);
exports.setAsync = util_1.promisify(client.set).bind(client);
exports.delAsync = util_1.promisify(client.del).bind(client);
exports.lrangeAsync = util_1.promisify(client.lrange).bind(client);
exports.lpushAsync = util_1.promisify(client.lpush).bind(client);
exports.rpushAsync = util_1.promisify(client.rpush).bind(client);
exports.lremAsync = util_1.promisify(client.lrem).bind(client);
exports.llenAsync = util_1.promisify(client.llen).bind(client);
exports.hgetAsync = util_1.promisify(client.hget).bind(client);
exports.hgetAllAsync = util_1.promisify(client.hgetall).bind(client);
exports.hsetAsync = util_1.promisify(client.hset).bind(client);
exports.hdelAsync = util_1.promisify(client.hdel).bind(client);
const objectIdsProperties = ['_id', 'topicId', 'createdBy', 'updatedBy', 'user1', 'user2', 'requestedBy'];
const dateProperties = ['createdAt', 'updatedAt'];
const jsonProperties = ['image', 'picture', 'shares', 'viewedBy'];
function prepareForSave(object) {
    log(chalk_1.default.dim('prepareForSave', object.id, Object.keys(object)));
    object = Object.assign({}, object);
    for (const key in object) {
        if (objectIdsProperties.includes(key)) {
            object[key] = object[key].toString();
        }
        if (dateProperties.includes(key)) {
            object[key] = moment_1.default(object[key]).format();
            log(chalk_1.default.magenta(key, ':', object[key]));
        }
        if (jsonProperties.includes(key)) {
            object[key] = JSON.stringify(object[key]);
            log(chalk_1.default.magenta(key, ':', object[key]));
        }
    }
    return object;
}
function rehydrate(object) {
    log(chalk_1.default.dim('rehydrate', object.id, Object.keys(object)));
    //   for (const prop of objectIdsProperties) {
    //     if (object[prop]) {
    //       object[prop] = new mongoose.Types.ObjectId(object[prop]);
    //       log(chalk.magenta(prop, ':', object[prop]));
    //     }
    //   }
    //   for (const prop of dateProperties) {
    //     if (object[prop]) {
    //       object[prop] = moment(object[prop]).toDate();
    //       log(chalk.magenta(prop, ':', object[prop]));
    //     }
    //   }
    for (const prop of jsonProperties) {
        if (object[prop]) {
            try {
                object[prop] = JSON.parse(object[prop]);
            }
            catch (error) {
                log(chalk_1.default.red('Failed to rehydrate prop:'), chalk_1.default.magenta.bold(prop));
                log(chalk_1.default.red('Prop value'), object[prop]);
                log(chalk_1.default.red('Prop value type', typeof object[prop]));
                if (typeof object[prop] !== 'object') {
                    throw error;
                }
            }
            log(chalk_1.default.magenta(prop, ':', object[prop]));
        }
    }
    if (object.id) {
        object._id = new typegoose_1.mongoose.Types.ObjectId(object.id);
    }
    return object;
}
async function saveModelItem(collection, object, options) {
    if (!enableCache) {
        return;
    }
    if (!object._id) {
        throw new Error('Missing object._id property');
    }
    object = prepareForSave(object);
    for (const key in object) {
        await exports.hsetAsync(`${collection}:${object._id}`, key, object[key]);
        client.expire(`${collection}:${object._id}`, (options === null || options === void 0 ? void 0 : options.time) || 3600 * 12);
    }
}
exports.saveModelItem = saveModelItem;
async function getModelItem(collection, id) {
    if (!enableCache) {
        return null;
    }
    const object = await exports.hgetAllAsync(`${collection}:${id}`);
    if (object) {
        rehydrate(object);
    }
    return object;
}
exports.getModelItem = getModelItem;
async function removeModelItem(collection, id) {
    if (!enableCache) {
        return;
    }
    await exports.delAsync(`${collection}:${id}`);
}
exports.removeModelItem = removeModelItem;
async function saveModelItems(key, objects, options) {
    if (!enableCache) {
        return;
    }
    log(chalk_1.default.dim('saveModelItems', key, objects.length, 'items'));
    await exports.delAsync(key);
    for (const object of objects) {
        if (options === null || options === void 0 ? void 0 : options.primitive) {
            await exports.rpushAsync(key, object);
        }
        else {
            const preparedObject = prepareForSave(object);
            await exports.rpushAsync(key, JSON.stringify(preparedObject));
        }
    }
    client.expire(key, (options === null || options === void 0 ? void 0 : options.time) || 3600 * 12);
}
exports.saveModelItems = saveModelItems;
async function getModelItems(key, options) {
    if (!enableCache) {
        return null;
    }
    log(chalk_1.default.dim('getModelItems', key));
    const objects = await exports.lrangeAsync(key, 0, -1);
    if (options === null || options === void 0 ? void 0 : options.primitive) {
        return objects;
    }
    if (objects && objects.length) {
        log(chalk_1.default.magenta('found', objects.length, 'items'), chalk_1.default.dim('getModelItems', key));
        return objects.map((o) => {
            return rehydrate(JSON.parse(o));
        });
    }
}
exports.getModelItems = getModelItems;
function log(...args) {
    if (logCache) {
        console.log(...args);
    }
}
