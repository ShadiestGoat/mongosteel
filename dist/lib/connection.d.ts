import { Db, DbOptions, MongoClient, MongoClientOptions } from "mongodb";
import { Model } from "./model";
export declare type ConnectionOptions = {
    dbName: string;
    user: string;
    password: string;
    location: string;
    dbOpts?: DbOptions;
};
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
export declare let mongoSteelConnection: Connection;
export declare type mongoSteelOpts = {
    noIdDetection?: boolean;
};
export declare class MongoSteel {
    static connect(connection?: string | ConnectionOptions, opts?: MongoClientOptions, mongoSteelSettings?: mongoSteelOpts): Promise<Db>;
    static disconnect(): Promise<void>;
}
export {};
//# sourceMappingURL=connection.d.ts.map