import mongoose from 'mongoose';
import express from 'express';
import path from 'path';
import helmet from 'helmet';
import http from 'http';
import cookieParser from 'cookie-parser';
import socket from 'socket.io';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema, BuildSchemaOptions } from 'type-graphql';
import contextService from 'request-context';
import jwt from 'express-jwt';
import cors, { CorsOptions } from 'cors';
import { apolloPerfPlugin } from './perf';
import { errorHandler } from '../middleware/error';
import { customAuthChecker } from '../modules/auth';
import { registerControllers } from './framework';
import { getVersion } from './version';

export interface AppOptions {
    publicPath?: string;
}

export class Start {

    public static lastClientMajor: number;
    public static lastClientMinor: number;
    public static lastClientPatch: number;
    public static whitelist: string[] = [];

    public static app: express.Express;
    public static server: http.Server;
    public static io: any;
    public static port: number;
    public static corsOptions: CorsOptions;

    public static requiredEnvVars = [
        'JWT_SECRET_OR_KEY',
        'JWT_REFRESH_TOKEN_SECRET_OR_KEY'
    ];

    public static defaultEnvVars = {
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

    public static async checkEnv() {
        const missingEnvs: string[] = [];
        for (const envName of Start.requiredEnvVars) {
            if (process.env[envName] === undefined) {
                missingEnvs.push(envName);
            } else {
                console.log('ENV', envName, process.env[envName]);
            }
        }
        if (missingEnvs.length > 0) {
            const error = new Error(`Missing required env vars: ${missingEnvs.join(', ')}`)
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

    public static async startDb() {
        const mongourl = `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/`;
        console.log('MONGO url', mongourl);
        console.log('MONGO db', process.env.MONGO_DB);
        console.log('MONGO user', process.env.MONGO_USER);
        console.log('MONGO pwd', '***' + process.env.MONGO_PASSWORD?.substr(-4));
        return mongoose.connect(
            mongourl,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                dbName: process.env.MONGO_DB,
                user: process.env.MONGO_USER,
                pass: process.env.MONGO_PASSWORD,
            }).then(async () => {

            });
    }

    public static startApp(options?: AppOptions): express.Express {
        const app: express.Express = express();
        Start.server = http.createServer(app);
        Start.io = socket(Start.server);
        Start.port = parseInt(process.env.SERVER_PORT as string) ?? 3000;
        app.use(helmet({
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
        app.use(cookieParser());
        app.use(contextService.middleware('request'));
        app.get('/version', (req, res) => {
            res.setHeader('content-type', 'application/json');
            res.send(getVersion());
        });

        app.get('/', (req, res) => {
            res.send('It works!');
        });

        const publicPath = options?.publicPath !== undefined ? options.publicPath : path.join(__dirname, './public');
        if (publicPath) {
            app.use(express.static(publicPath));
        }
        // Configure Express to handle incoming JSON bodies
        app.use(express.json());
        Start.app = app;
        return app;
    }

    public static setCorsOptions() {
        if (!Start.corsOptions) {
            Start.corsOptions = {
                origin: function (origin, callback) {
                    if (origin === undefined || origin === null || origin === 'null') {
                        // TODO: add a header that must be present here
                        // to confirm the request is coming from a mobile app
                    callback(null, true)
                    } else if (Start.whitelist.indexOf(origin) !== -1) {
                    callback(null, true)
                    } else {
                        // TODO: log this in Sentry
                    console.log('Origin not allowed by CORS', origin, typeof origin);
                    callback(new Error('Not allowed by CORS'))
                    }
                },
                credentials: true
            };
        }
    }

    public static async startGraphQl(schemaOptions: BuildSchemaOptions, app?: express.Express) {
        app = app || Start.app;
        Start.setCorsOptions();
        if (!schemaOptions.resolvers || schemaOptions.resolvers.length === 0) {
            console.error('You must provide resolvers to startGraphQl');
        }
        if (schemaOptions.authChecker === undefined) {
            schemaOptions.authChecker = customAuthChecker;
        }
        // Register GraphQL Api
        const schema = await buildSchema(schemaOptions);
        const apolloServer = new ApolloServer(
            {
                schema,
                context: ({ req, res }) => {
                    const context = {
                    req,
                    res,
                    user: (req as any).user,
                    locals: {}
                    };
                    return context;
                },
                plugins: [
                    apolloPerfPlugin,
                ]
            });

        app.use('/graphql', (req: express.Request, res: express.Response, next: express.NextFunction) => {
            const clientVersion = req.header('client-version');
            if (req.method !== 'OPTIONS' && clientVersion) {
                res.setHeader('Access-Control-Allow-Origin', '*');
                const digits = clientVersion.split('.').map(v => parseInt(v, 10));
                if (
                    digits[0] > Start.lastClientMajor
                    || digits[0] === Start.lastClientMajor && digits[1] > Start.lastClientMinor
                    || digits[0] === Start.lastClientMajor && digits[1] === Start.lastClientMinor && digits[2] >= Start.lastClientPatch
                ) {
                    // all good
                } else {
                    return cors(Start.corsOptions)(req, res, () => {
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
        app.use('/graphql', jwt({
            secret: process.env.JWT_SECRET_OR_KEY as string,
            credentialsRequired: false,
            algorithms: ['HS256']
        }))
        apolloServer.applyMiddleware({app, path: '/graphql', cors: Start.corsOptions});
    }

    public static registerControllers(controllers: any[], app?: express.Express) {
        app = app || Start.app;
        Start.setCorsOptions();
        app.use(cors(Start.corsOptions));
        registerControllers(controllers, app);
    }

    public static handleError(app?: express.Express) {
        app = app || Start.app;
        app.use(errorHandler);
    }

    public static startIO() {
        Start.io.on('connection', (socket) => {
            console.log('a user connected');
            socket.on('disconnect', () => {
                console.log('user disconnected');
            });
        });
    }

    public static listen() {
        Start.server.listen(Start.port, () => {
            console.log(`⚡️[server]: Server is running at http://localhost:${Start.port}`);
        });
    }

    public static async default(schemaOptions: BuildSchemaOptions, controllers: any[]) {
        Start.checkEnv();
        await Start.startDb()
        Start.startApp();
        Start.app.get('/test', (req, res, next) => {
            res.status(200);
            res.send({test: 'ok'});
        });
        await Start.startGraphQl(schemaOptions);
        Start.registerControllers(controllers);
        Start.handleError();
        Start.startIO();
        Start.listen();
    }
}
