import {Db,DbOptions,MongoClient,MongoClientOptions, Collection, Condition, OptionalId } from "mongodb";

export declare type ConnectionOptions = {
/** The name of your database */
dbName: string;
/** The username of the user */
user: string;
/** The password of the user */
password: string;
/*** The location of the database (eg. `ip:port`) */
location: string;
/** database options */
dbOpts?: DbOptions;
};
/** Create a connection url */
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
/** A 'global-ish' connection state that mongoSteel uses. Do not manuall change this, check MongoSteel.connect() and MongoSteel.disconnect() */
export declare let mongoSteelConnection: Readonly<Connection>;
export declare type mongoSteelOpts = {
/** Do not detect double-saving documents with the same _id */
noIdDetection?: boolean;
/** Do not verify documents, default false. */
noVerification?: boolean;
/** Don't update the document whenever you save one. This is used to update types like Buffer & Binaries */
noDocsUpdate?: boolean;
};
export declare class MongoSteel {
/** Connect to a database. This is a static method, so you can do MongoSteel.connect(), without having to create an instance of the class */
static connect(connection?: string | ConnectionOptions, opts?: MongoClientOptions, mongoSteelSettings?: mongoSteelOpts): Promise<Db>;
/** Disconnect from a database. This is a static method, so you can do MongoSteel.disconnect(), without having to create an instance of the class */
static disconnect(): Promise<void>;
}
export declare type MongoSteelFilter<T> = {
[K in keyof T]?: Condition<T[K]>;
};
export declare type genericFunctions<Lean, Methods extends genericFunctions<Lean, Methods>> = Record<string, ((this: Model<Lean, Methods>, ...args: unknown[]) => unknown)>;
declare class trueModel<Lean, MMethods extends genericFunctions<Lean, MMethods> = Record<string, never>, SH extends Schema<OptionalId<Lean>> = Schema<OptionalId<Lean>>> {
static schema: Schema<unknown>;
schema: SH;
doc: OptionalId<Lean>;
saved: boolean;
static methods: unknown;
methods: MMethods;
private oldId;
static collection: Promise<Collection>;
collection: Promise<Collection<Lean>>;
constructor(collection: string, schema: SH, doc: Partial<OptionalId<Lean>>, methods: MMethods);
/** Saves the current document into the database
* @returns */
save(): Promise<OptionalId<Lean>>;
static find(filter: MongoSteelFilter<unknown>): Promise<unknown[]>;
static findOne(filter: MongoSteelFilter<unknown>): Promise<unknown | null>;
static findOneAndDelete(filter: MongoSteelFilter<unknown>): Promise<unknown>;
static findOneAndReplace(filter: MongoSteelFilter<unknown>, replacement: Record<string, unknown>): Promise<unknown>;
static findOneAndUpdate(filter: MongoSteelFilter<unknown>, update: Partial<unknown>): Promise<unknown>;
static deleteMany(filter: MongoSteelFilter<unknown>): Promise<void>;
}
/** The Model class. This should not be called directly, check model() for getting this class.  This should only be used for types */
export interface Model<MLean, MMethods extends genericFunctions<MLean, MMethods> = Record<string, never>> extends trueModel<MLean, MMethods> {
new (doc: Partial<OptionalId<MLean>>): trueModel<MLean>;
colName: string;
methods: MMethods;
/** Find multiple documents in your collection using properties of your document */
find(filter: MongoSteelFilter<MLean>): Promise<MLean[]>;
/** Find the first document that has all the properties in the filter argument */
findOne(filter: MongoSteelFilter<MLean>): Promise<MLean | null>;
/** Find the first document that has all the properties in the filter argument and delete it. */
findOneAndDelete(filter: MongoSteelFilter<MLean>): Promise<MLean>;
/** Find the first document that matches all the propeties in the filter argument, and replace it the a document in the replacement */
findOneAndReplace(filter: MongoSteelFilter<MLean>, replacement: MLean): Promise<MLean>;
/** Find the first document that matches all the properties in the filter argument, and do what is essentially Object.assign() on it with the update argument */
findOneAndUpdate(filter: MongoSteelFilter<MLean>, update: Partial<MLean>): Promise<MLean>;
/** Delete all matching documents to the filter argument */
deleteMany(filter: MongoSteelFilter<MLean>): Promise<void>;
}
/** A function to return a Model CLASS. Not instance.
* @param collection the name of the collection
* @param schema the shema for that collection
* @returns the model class. */
export declare function model<Lean, Methods extends genericFunctions<Lean, Methods> = Record<string, never>>(collection: string, schema: Schema<OptionalId<Lean>>, methods: Methods): Model<Lean, Methods>;
/** Convert a type to a string of that type. Nested shemas convert to SchemaDefinition */
export declare type TypeToString<T, R extends boolean = false> = (T extends string ? 'string' : T extends number ? 'number' : T extends boolean ? "boolean" : T extends Array<infer U> ? [TypeToString<U, false>] : Record<string, never> extends T ? ["string", TypeToString<T[keyof T], false>] : T extends Record<string, unknown> ? R extends true ? undefined : SchemaDefinition<T> : "mixed") | "mixed";
/** Options for your type */
export declare type SchemaTypeOptions<T> = {
type: TypeToString<T, false>;
/** Weather or not the property is required */
required: boolean;
/** The default value of the property. If required is present, this will be ignored */
default?: T | (() => T);
/** If the option is of string type, this can be used to validate the string */
pattern?: T extends string ? RegExp | undefined : undefined;
};
/** Used to create a definition for the Schema constructor */
export declare type SchemaDefinition<T> = {
[K in keyof T]: SchemaTypeOptions<T[K]> | TypeToString<T[K], true>;
};
/** Same as SchemaDefinition except this one forces you to use SchemaTypeOptions */
export declare type SchemaFull<T> = {
[K in keyof T]: SchemaTypeOptions<T[K]>;
};
/** a valid response to a validation schema */
export declare type valid<obj> = {
valid: true;
res: obj;
};
/** an invalid response to a validation schema */
export declare type invalid = {
valid: false;
/** the key which has the issue. Undefined if the reason is majorBadType, since the whole document type is invalid */
badKey: string;
/** badType - the key above has bad type,
* required - the key above is required but missing
* majorBadType - the whole document is not a correct type! It's not an object or is an array. */
reason: "badType" | "required";
} | {
valid: false;
reason: "majorBadType";
};
export declare type validTot<obj> = valid<obj> | invalid;
export declare type SchemaValidationOpts = {
/** Ignore weather something is required or not */
ignoreRequired?: boolean;
/** Don't apply defaults */
ignoreDefault?: boolean;
};
/** if a schema validation fails on a Model class level */
export declare class MongoSteelValidityError extends Error {
obj: invalid;
constructor(validRes: invalid);
}
export declare class Schema<SHLean = unknown> {
schema: SchemaFull<SHLean>;
constructor(schema: SchemaDefinition<SHLean>);
/** validate an object to make sure the document provided is a valid one. This also adds the default values
*
* Note: this does not throw MongoSteelValidityError! */
validate(doc: unknown, opts?: SchemaValidationOpts): validTot<SHLean>;
}
