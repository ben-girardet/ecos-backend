"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Perf = exports.apolloPerfPlugin = void 0;
const chalk_1 = __importDefault(require("chalk"));
const enablePerf = true;
const logPerf = false;
exports.apolloPerfPlugin = {
    // Fires whenever a GraphQL request is received from a client.
    requestDidStart(requestContext) {
        //   console.log('Request started! Query:\n' +
        //     requestContext.request.query);
        requestContext.apolloPerfPlugin__hrstart = process.hrtime();
        requestContext.p1 = true;
        return {
            // Fires whenever Apollo Server will parse a GraphQL
            // request to create its associated document AST.
            // parsingDidStart(requestContext) {
            // },
            // Fires whenever Apollo Server will validate a
            // request's document AST against your GraphQL schema.
            willSendResponse(requestContext) {
                const r = requestContext;
                if (r.apolloPerfPlugin__hrstart) {
                    const hrend = process.hrtime(r.apolloPerfPlugin__hrstart);
                    let color = 'green';
                    if (hrend[0] > 0) {
                        color = 'red';
                    }
                    else if (hrend[1] / 1000000 > 300) {
                        color = 'blue';
                    }
                    if (logPerf) {
                        console.info(chalk_1.default[color](hrend[0], Math.round(hrend[1] / 1000) / 1000), chalk_1.default.grey(requestContext.request.query));
                    }
                    // console.info('Execution time (hr): %ds %dms', hrend[0], hrend[1] / 1000000);
                }
            },
        };
    },
};
class Perf {
    constructor(name) {
        this.hrstart = process.hrtime();
        this.previousstephrstart = process.hrtime();
        this.name = name;
    }
    log(step) {
        const hrend = process.hrtime(this.hrstart);
        const hrenddiff = process.hrtime(this.previousstephrstart);
        this.previousstephrstart = process.hrtime();
        let color = 'green';
        if (hrenddiff[0] > 0) {
            color = 'red';
        }
        else if (hrenddiff[1] / 1000000 > 300) {
            color = 'blue';
        }
        if (logPerf) {
            console.info(chalk_1.default.grey(hrend[0], Math.round(hrend[1] / 1000) / 1000), chalk_1.default.grey(this.name), chalk_1.default.magenta(step), chalk_1.default[color]('+', hrenddiff[0], Math.round(hrenddiff[1] / 1000) / 1000));
        }
    }
}
exports.Perf = Perf;
