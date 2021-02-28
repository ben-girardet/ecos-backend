"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Start = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const helmet_1 = __importDefault(require("helmet"));
const http_1 = __importDefault(require("http"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const socket_io_1 = __importDefault(require("socket.io"));
const apollo_server_express_1 = require("apollo-server-express");
const type_graphql_1 = require("type-graphql");
const request_context_1 = __importDefault(require("request-context"));
const express_jwt_1 = __importDefault(require("express-jwt"));
const cors_1 = __importDefault(require("cors"));
const perf_1 = require("./perf");
const error_1 = require("../middleware/error");
const auth_1 = require("../modules/auth");
const framework_1 = require("./framework");
const version_1 = require("./version");
class Start {
    static async checkEnv() {
        const missingEnvs = [];
        for (const envName of Start.requiredEnvVars) {
            if (process.env[envName] === undefined) {
                missingEnvs.push(envName);
            }
            else {
                console.log('ENV', envName, process.env[envName]);
            }
        }
        if (missingEnvs.length > 0) {
            const error = new Error(`Missing required env vars: ${missingEnvs.join(', ')}`);
            console.error(error);
            process.exit(10);
        }
        for (const envName in Start.defaultEnvVars) {
            if (process.env[envName] === undefined) {
                process.env[envName] = Start.defaultEnvVars[envName];
            }
            console.log('ENV', envName, process.env[envName]);
        }
    }
    static async startDb() {
        var _a;
        const mongourl = `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/`;
        console.log('MONGO url', mongourl);
        console.log('MONGO db', process.env.MONGO_DB);
        console.log('MONGO user', process.env.MONGO_USER);
        console.log('MONGO pwd', '***' + ((_a = process.env.MONGO_PASSWORD) === null || _a === void 0 ? void 0 : _a.substr(-4)));
        return mongoose_1.default.connect(mongourl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: process.env.MONGO_DB,
            user: process.env.MONGO_USER,
            pass: process.env.MONGO_PASSWORD,
        }).then(async () => {
        });
    }
    static startApp(options) {
        var _a;
        const app = express_1.default();
        Start.server = http_1.default.createServer(app);
        Start.io = socket_io_1.default(Start.server);
        Start.port = (_a = parseInt(process.env.SERVER_PORT)) !== null && _a !== void 0 ? _a : 3000;
        app.use(helmet_1.default({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    baseUri: ["'self'"],
                    blockAllMixedContent: [],
                    fontSrc: ["'self'", "https:", "data:"],
                    frameAncestors: ["'self'"],
                    imgSrc: ["'self'", "data:", "https:", "http:"],
                    objectSrc: ["'none'"],
                    scriptSrc: ["'self'", "https:", "'unsafe-inline'"],
                    scriptSrcAttr: ["'none'"],
                    styleSrc: ["'self'", "https:", "'unsafe-inline'"],
                    upgradeInsecureRequests: [],
                }
            },
        }));
        app.use(cookie_parser_1.default());
        app.use(request_context_1.default.middleware('request'));
        app.get('/version', (req, res) => {
            res.setHeader('content-type', 'application/json');
            res.send(version_1.getVersion());
        });
        app.get('/', (req, res) => {
            res.send('It works!');
        });
        const publicPath = (options === null || options === void 0 ? void 0 : options.publicPath) !== undefined ? options.publicPath : path_1.default.join(__dirname, './public');
        if (publicPath) {
            app.use(express_1.default.static(publicPath));
        }
        // Configure Express to handle incoming JSON bodies
        app.use(express_1.default.json());
        Start.app = app;
        return app;
    }
    static setCorsOptions() {
        if (!Start.corsOptions) {
            Start.corsOptions = {
                origin: function (origin, callback) {
                    if (origin === undefined || origin === null || origin === 'null') {
                        // TODO: add a header that must be present here
                        // to confirm the request is coming from a mobile app
                        callback(null, true);
                    }
                    else if (Start.whitelist.indexOf(origin) !== -1) {
                        callback(null, true);
                    }
                    else {
                        // TODO: log this in Sentry
                        console.log('Origin not allowed by CORS', origin, typeof origin);
                        callback(new Error('Not allowed by CORS'));
                    }
                },
                credentials: true
            };
        }
    }
    static async startGraphQl(schemaOptions, app) {
        app = app || Start.app;
        Start.setCorsOptions();
        if (!schemaOptions.resolvers || schemaOptions.resolvers.length === 0) {
            console.error('You must provide resolvers to startGraphQl');
        }
        if (schemaOptions.authChecker === undefined) {
            schemaOptions.authChecker = auth_1.customAuthChecker;
        }
        // Register GraphQL Api
        const schema = await type_graphql_1.buildSchema(schemaOptions);
        const apolloServer = new apollo_server_express_1.ApolloServer({
            schema,
            context: ({ req, res }) => {
                const context = {
                    req,
                    res,
                    user: req.user,
                    locals: {}
                };
                return context;
            },
            plugins: [
                perf_1.apolloPerfPlugin,
            ]
        });
        app.use('/graphql', (req, res, next) => {
            const clientVersion = req.header('client-version');
            if (req.method !== 'OPTIONS' && clientVersion) {
                res.setHeader('Access-Control-Allow-Origin', '*');
                const digits = clientVersion.split('.').map(v => parseInt(v, 10));
                if (digits[0] > Start.lastClientMajor
                    || digits[0] === Start.lastClientMajor && digits[1] > Start.lastClientMinor
                    || digits[0] === Start.lastClientMajor && digits[1] === Start.lastClientMinor && digits[2] >= Start.lastClientPatch) {
                    // all good
                }
                else {
                    return cors_1.default(Start.corsOptions)(req, res, () => {
                        return next(new Error('Out of date client'));
                    });
                }
            }
            if (!req.header('Authorization')) {
                // if not Authorization header, check in cookie
                const { jwt } = req.cookies;
                if (jwt) {
                    req.headers.authorization = `Bearer ${jwt}`;
                }
            }
            next();
            // TODO: Add test for this authoritation via cookie
        });
        app.use('/graphql', express_jwt_1.default({
            secret: process.env.JWT_SECRET_OR_KEY,
            credentialsRequired: false,
            algorithms: ['HS256']
        }));
        apolloServer.applyMiddleware({ app, path: '/graphql', cors: Start.corsOptions });
    }
    static registerControllers(controllers, app) {
        app = app || Start.app;
        Start.setCorsOptions();
        app.use(cors_1.default(Start.corsOptions));
        framework_1.registerControllers(controllers, app);
    }
    static handleError(app) {
        app = app || Start.app;
        app.use(error_1.errorHandler);
    }
    static startIO() {
        Start.io.on('connection', (socket) => {
            console.log('a user connected');
            socket.on('disconnect', () => {
                console.log('user disconnected');
            });
        });
    }
    static listen() {
        Start.server.listen(Start.port, () => {
            console.log(`⚡️[server]: Server is running at http://localhost:${Start.port}`);
        });
    }
    static async default(schemaOptions, controllers) {
        Start.checkEnv();
        await Start.startDb();
        Start.startApp();
        Start.app.get('/test', (req, res, next) => {
            res.status(200);
            res.send({ test: 'ok' });
        });
        await Start.startGraphQl(schemaOptions);
        Start.registerControllers(controllers);
        Start.handleError();
        Start.startIO();
        Start.listen();
    }
}
exports.Start = Start;
Start.whitelist = [];
Start.requiredEnvVars = [
    'JWT_SECRET_OR_KEY',
    'JWT_REFRESH_TOKEN_SECRET_OR_KEY'
];
Start.defaultEnvVars = {
    NODE_ENV: 'development',
    REDIS_HOST: '127.0.0.1',
    REDIS_PORT: '6379',
    JWT_TOKEN_EXPIRATION: '15 minutes',
    JWT_REFRESH_TOKEN_EXPIRATION: '30',
    MONGO_HOST: 'localhost',
    MONGO_PORT: '27017',
    MONGO_USER: '',
    MONGO_PASSWORD: '',
    MONGO_DB: 'ecos',
    SERVER_PORT: '3000',
    SMSAPI_TOKEN: 'none',
    UPLOAD_PATH: 'uploads/'
};
