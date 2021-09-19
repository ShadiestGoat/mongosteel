import { Db, DbOptions, MongoClient, MongoClientOptions } from "mongodb"
import { Model } from "./model"

export type ConnectionOptions = {
    /** The name of your database */
    dbName: string,
    /** The username of the user */
    user: string,

    /** The password of the user */
    password: string,

    /*** The location of the database (eg. `ip:port`) */
    location:string,
    /** database options */
    dbOpts?:DbOptions
}

/** Create a connection url */
export function toUrl(opts:ConnectionOptions):string {
    ([
        'dbName',
        'location',
        'password',
        'user'
    ] as (keyof ConnectionOptions)[]).forEach((prop) => {
        if (!Object.keys(opts).includes(prop)) throw Error(`${prop} is required in the options!`)
    })
    if (!opts.dbOpts) opts.dbOpts = {}

    return `mongodb://${encodeURI(opts.user)}:${encodeURI(opts.password)}@${encodeURI(opts.location)}/${opts.dbName}${Object.keys(opts.dbOpts).length == 0 ? '' : '?'}${Object.keys(opts.dbOpts).map((v,i) => `${i == 0 ? '' : "&"}${encodeURI(`${v}=${(opts.dbOpts ?? {})[v]}`)}`).join('')}`
}

type Connection = ({
    on:true,
    db:Db
    client:MongoClient
    url:string,
} | {
    on:false,
    db?:undefined,
    client?:undefined,
    url?:undefined,
}) & {
    models:Record<string, Model<unknown>>
    opts:mongoSteelOpts
}

/** A 'global-ish' connection state that mongoSteel uses. Do not manuall change this, check MongoSteel.connect() and MongoSteel.disconnect() */
export let mongoSteelConnection:Readonly<Connection> = {
    on: false,
    models: {},
    opts: {}
}

export type mongoSteelOpts = {
    /** Do not detect double-saving documents with the same _id */
    noIdDetection?:boolean,
    /** Do not verify documents, default false. */
    noVerification?:boolean,
    /** Don't update the document whenever you save one. This is used to update types like Buffer & Binaries */
    noDocsUpdate?:boolean
}

export class MongoSteel {
    /** Connect to a database. This is a static method, so you can do MongoSteel.connect(), without having to create an instance of the class */
    static async connect(connection?:string | ConnectionOptions, opts?:MongoClientOptions, mongoSteelSettings?:mongoSteelOpts):Promise<Db> {
        if (mongoSteelConnection.on) {
            if (connection) {
                throw new Error(`I already have a connection to ${mongoSteelConnection.url}!`)
            }
            return mongoSteelConnection.db
        }
        if (!connection) throw new Error(`I have nothing to connect to!`)
        const url = typeof connection == "string" ? encodeURI(connection) : toUrl(connection)
        const client = await MongoClient.connect(url, (Object.assign({useNewUrlParser:true, useUnifiedTopology: true}, opts) as MongoClientOptions))
        const db = client.db()
        const SteelOpts:mongoSteelOpts = Object.assign({}, mongoSteelSettings)
        mongoSteelConnection = {
            on: true,
            db,
            client,
            url,
            opts:SteelOpts,
            models: mongoSteelConnection.models
        }
        return db
    }

    /** Disconnect from a database. This is a static method, so you can do MongoSteel.disconnect(), without having to create an instance of the class */
    static async disconnect():Promise<void> {
        if (mongoSteelConnection) {
            await mongoSteelConnection.client?.close()
            mongoSteelConnection = {
                on: false,
                client: undefined,
                db: undefined,
                url: undefined,
                models: mongoSteelConnection.models,
                opts: mongoSteelConnection.opts
            }
        }
    }
}
