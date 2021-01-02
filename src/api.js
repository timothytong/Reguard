'use strict'

import express from 'express';
import session from 'express-session'
import redis from 'redis';
import redisStore from 'connect-redis';
import morgan from 'morgan';
import path from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';
import sessionRouter from './routers/session-router';

const isProduction = process.env.NODE_ENV === 'production';
const secret = isProduction ? process.env.APP_SECRET : 'reguard-test';

export default class Api {

    // create the express instance, attach app-level middleware, attach routers
    constructor() {
        this.express = express();
        this.middleware();
        this.routes();
    }

    // register middlewares
    middleware() {
        /*
        const store = redisStore(session);
        const redisStoreOptions = process.env.NODE_ENV === 'production' ?
            new store({ url: process.env.REDIS_URL })
            : new store({
                host: process.env.REDIS_HOST,
                port: process.env.REDIS_PORT,
            })
            this.express.use(session({
                secret: 'abc',
                resave: false,
                store: redisStoreOptions,
                saveUninitialized: false,
                cookie: {
                    maxAge: 7 * 24 * 60 * 60 * 1000, // 24h * 7 in milliseconds
                },
            }));
            */
        this.express.use(session({ secret, cookie: { maxAge: 60000 },
            resave: false, saveUninitialized: false }));
        this.express.use(morgan('dev'));
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false }));
        this.express.use(cors());
    }

    // connect resource routers
    routes() {
        // attach it to our express app
        this.express.use('/api/v1/sessions', sessionRouter);
        this.express.use(express.static('public'));
        this.express.set('view engine', 'ejs');
        this.express.get('/', (req, res) => res.send('Home'));
    }
}

function checkRedisConnect(req, res, next) {
    if (!req.session) {
        return next(new Error('Redis not connected.'));
    }
    return next();
}

