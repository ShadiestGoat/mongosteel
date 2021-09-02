"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoSteel = exports.mongoSteelConnection = exports.toUrl = void 0;
const mongodb_1 = require("mongodb");
/**
 * Create a connection url
 */
function toUrl(opts) {
    [
        'dbName',
        'location',
        'password',
        'user'
    ].forEach((prop) => {
        if (!Object.keys(opts).includes(prop))
            throw Error(`${prop} is required in the options!`);
    });
    if (!opts.dbOpts)
        opts.dbOpts = {};
    return `mongodb://${encodeURI(opts.user)}:${encodeURI(opts.password)}@${encodeURI(opts.location)}/${opts.dbName}${Object.keys(opts.dbOpts).length == 0 ? '' : '?'}${Object.keys(opts.dbOpts).map((v, i) => { var _a; return `${i == 0 ? '' : "&"}${encodeURI(`${v}=${((_a = opts.dbOpts) !== null && _a !== void 0 ? _a : {})[v]}`)}`; })}`;
}
exports.toUrl = toUrl;
/**
 * A 'global-ish' connection state that mongoSteel uses. Do not manuall change this, check MongoSteel.connect() and MongoSteel.disconnect()
 */
exports.mongoSteelConnection = {
    on: false,
    models: {},
    opts: {}
};
class MongoSteel {
    /**
     * Connect to a database. This is a static method, so you can do MongoSteel.connect(), without having to create an instance of the class
     */
    static connect(connection, opts, mongoSteelSettings) {
        return __awaiter(this, void 0, void 0, function* () {
            if (exports.mongoSteelConnection.on) {
                if (connection) {
                    throw new Error(`I already have a connection to ${exports.mongoSteelConnection.url}!`);
                }
                return exports.mongoSteelConnection.db;
            }
            if (!connection)
                throw new Error(`I have nothing to connect to!`);
            const url = typeof connection == "string" ? encodeURI(connection) : toUrl(connection);
            const client = yield mongodb_1.MongoClient.connect(url, Object.assign({ useNewUrlParser: true, useUnifiedTopology: true }, opts));
            const db = client.db();
            const SteelOpts = Object.assign({}, mongoSteelSettings);
            exports.mongoSteelConnection = {
                on: true,
                db,
                client,
                url,
                opts: SteelOpts,
                models: exports.mongoSteelConnection.models
            };
            return db;
        });
    }
    /**
     * Disconnect from a database. This is a static method, so you can do MongoSteel.disconnect(), without having to create an instance of the class
     */
    static disconnect() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (exports.mongoSteelConnection) {
                yield ((_a = exports.mongoSteelConnection.client) === null || _a === void 0 ? void 0 : _a.close());
                exports.mongoSteelConnection = {
                    on: false,
                    client: undefined,
                    db: undefined,
                    url: undefined,
                    models: exports.mongoSteelConnection.models,
                    opts: exports.mongoSteelConnection.opts
                };
            }
        });
    }
}
exports.MongoSteel = MongoSteel;
