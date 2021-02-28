"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testPush = exports.pushService = exports.PushService = void 0;
const path_1 = __importDefault(require("path"));
const node_pushnotifications_1 = __importDefault(require("node-pushnotifications"));
const push_notification_model_1 = require("./push-notification.model");
const push_player_model_1 = require("./push-player.model");
let debug = require('debug')('app:push');
const privatePath = path_1.default.join(__dirname, `../../private/`);
class PushService {
    constructor() {
        this.connected = false;
    }
    isConnected() {
        return this.connected;
    }
    connect() {
        if (this.connected) {
            return;
        }
        debug('connect');
        if (process.env.APN_KEY && process.env.APN_KEYID && process.env.APN_TEAMID) {
            const settings = {
                apn: {
                    token: {
                        key: privatePath + process.env.APN_KEY,
                        keyId: process.env.APN_KEYID,
                        teamId: process.env.APN_TEAMID
                    },
                    production: true
                }
            };
            this.push = new node_pushnotifications_1.default(settings);
            // TODO: add GCM config
            this.connected = true;
        }
    }
    disconnect() {
        debug('disconnect');
        try {
            this.push.apn.shutdown();
        }
        catch (error) {
            console.error(error);
        }
        this.connected = false;
    }
    async send(notification) {
        let data = {
            title: notification.title,
            body: notification.message,
            topic: 'app.sunago',
        };
        if (notification.collapseKey !== undefined) {
            data.collapseKey = notification.collapseKey;
        }
        if (notification.contentAvailable !== undefined) {
            data.contentAvailable = notification.contentAvailable;
        }
        if (notification.badge !== undefined) {
            data.badge = notification.badge;
        }
        if (notification.custom) {
            try {
                let custom = JSON.parse(notification.custom);
                data.custom = custom;
            }
            catch (error) {
                data.custom = { data: notification.custom };
            }
        }
        else {
            data.custom = {};
        }
        data.custom.notId = notification._id.toString();
        const results = await this.push.send(notification.regIds, data);
        let successRegId = [];
        for (let result of results) {
            for (let message of result.message) {
                let tmp = message.regId;
                let regId;
                if (typeof tmp === 'string') {
                    regId = tmp;
                }
                else {
                    regId = tmp.device;
                }
                debug('regId', regId);
                if (message.error === null) {
                    debug('-> sent ok');
                    successRegId.push(regId);
                }
                else if (message.error instanceof Error) {
                    debug('-> sent error');
                    if (message.error.message === 'InvalidRegistration' || message.error.message === 'BadDeviceToken') {
                        debug('-> make player inactive', regId);
                        const player = await push_player_model_1.PushPlayerModel.findOne({ regId: regId });
                        if (player) {
                            player.active = false;
                            await player.save();
                        }
                    }
                    else {
                        debug('-> error message', message.error.message);
                        debug('message', message);
                    }
                }
            }
        }
        notification.sentToRegIds = successRegId;
        notification.sent = true;
        notification.sentAt = new Date();
        return await notification.save();
    }
}
exports.PushService = PushService;
const pushService = new PushService();
exports.pushService = pushService;
function testPush(req, res, next) {
    new Promise(async (resolve, reject) => {
        try {
            const players = await push_player_model_1.PushPlayerModel.find({ active: true, tags: { $in: ['test'] } });
            const regIds = players.map(p => p.regId);
            const notification = new push_notification_model_1.PushNotificationModel();
            notification.regIds = regIds;
            notification.title = 'Test notification title';
            notification.message = 'Test notification message';
            const notificationDocument = await notification.save();
            const createdNotification = new push_notification_model_1.PushNotificationModel(notificationDocument);
            const sentNotification = await pushService.send(createdNotification);
            res.send(new push_player_model_1.PushPlayerModel(sentNotification).toObject());
            resolve(null);
        }
        catch (error) {
            reject(error);
        }
    }).then(next).catch(next);
}
exports.testPush = testPush;
