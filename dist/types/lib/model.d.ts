import { Collection, Condition, OptionalId } from "mongodb";
import { Schema } from "./schema";
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
    static collection: Collection;
    collection: Collection<Lean>;
    constructor(collection: string, schema: SH, doc: Partial<OptionalId<Lean>>, methods: MMethods);
    /**
     * Saves the current document into the database
     * @returns
     */
    save(): Promise<OptionalId<Lean>>;
    static find(filter: MongoSteelFilter<unknown>): Promise<unknown[]>;
    static findOne(filter: MongoSteelFilter<unknown>): Promise<unknown | null>;
    static findOneAndDelete(filter: MongoSteelFilter<unknown>): Promise<unknown>;
    static findOneAndReplace(filter: MongoSteelFilter<unknown>, replacement: Record<string, unknown>): Promise<unknown>;
    static findOneAndUpdate(filter: MongoSteelFilter<unknown>, update: Partial<unknown>): Promise<unknown>;
    static deleteMany(filter: MongoSteelFilter<unknown>): Promise<void>;
}
/**
 * The Model class. This should not be called directly, check model() for getting this class.  This should only be used for types
 */
export interface Model<MLean, MMethods extends genericFunctions<MLean, MMethods> = Record<string, never>> extends trueModel<MLean, MMethods> {
    new (doc: Partial<OptionalId<MLean>>): trueModel<MLean>;
    colName: string;
    methods: MMethods;
    /**
     * Find multiple documents in your collection using properties of your document
     */
    find(filter: MongoSteelFilter<MLean>): Promise<MLean[]>;
    /**
     * Find the first document that has all the properties in the filter argument
     */
    findOne(filter: MongoSteelFilter<MLean>): Promise<MLean | null>;
    /**
     * Find the first document that has all the properties in the filter argument and delete it.
     */
    findOneAndDelete(filter: MongoSteelFilter<MLean>): Promise<MLean>;
    /**
     * Find the first document that matches all the propeties in the filter argument, and replace it the a document in the replacement
     */
    findOneAndReplace(filter: MongoSteelFilter<MLean>, replacement: MLean): Promise<MLean>;
    /**
     * Find the first document that matches all the properties in the filter argument, and do what is essentially Object.assign() on it with the update argument
     */
    findOneAndUpdate(filter: MongoSteelFilter<MLean>, update: Partial<MLean>): Promise<MLean>;
    /**
     * Delete all matching documents to the filter argument
     */
    deleteMany(filter: MongoSteelFilter<MLean>): Promise<void>;
}
/**
 * A function to return a Model CLASS. Not instance.
 * @param collection the name of the collection
 * @param schema the shema for that collection
 * @returns the model class.
 */
export declare function model<Lean, Methods extends genericFunctions<Lean, Methods> = Record<string, never>>(collection: string, schema: Schema<OptionalId<Lean>>, methods: Methods): Model<Lean, Methods>;
export {};
