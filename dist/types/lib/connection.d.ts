import { Db, DbOptions, MongoClient, MongoClientOptions } from "mongodb";
import { Model } from "./model";
export declare type ConnectionOptions = {
    /**
     * The name of your database
     */
    dbName: string;
    /**
     * The username of the user
     */
    user: string;
    /**
     * The password of the user
     */
    password: string;
    /**
     * The location of the database (eg. `ip:port`)
     */
    location: string;
    /**
     * database options
     */
    dbOpts?: DbOptions;
};
/**
 * Create a connection url
 */
export declare function toUrl(opts: ConnectionOptions): string;
declare type Connection = ({
    on: true;
    db: Db;
    client: MongoClient;
    url: string;
} | {
    on: false;
    db?: undefined;
    client?: undefined;
    url?: undefined;
}) & {
    models: Record<string, Model<unknown>>;
    opts: mongoSteelOpts;
};
/**
 * A 'global-ish' connection state that mongoSteel uses. Do not manuall change this, check MongoSteel.connect() and MongoSteel.disconnect()
 */
export declare let mongoSteelConnection: Readonly<Connection>;
export declare type mongoSteelOpts = {
    /**
     * Do not detect double-saving documents with the same _id
     */
    noIdDetection?: boolean;
    /**
     * Do not verify documents, default false.
     */
    noVerification?: boolean;
    /**
     * Don't update the document whenever you save one. This is used to update types like Buffer & Binaries
     */
    noDocsUpdate?: boolean;
};
export declare class MongoSteel {
    /**
     * Connect to a database. This is a static method, so you can do MongoSteel.connect(), without having to create an instance of the class
     */
    static connect(connection?: string | ConnectionOptions, opts?: MongoClientOptions, mongoSteelSettings?: mongoSteelOpts): Promise<Db>;
    /**
     * Disconnect from a database. This is a static method, so you can do MongoSteel.disconnect(), without having to create an instance of the class
     */
    static disconnect(): Promise<void>;
}
export {};
