import { OptionalId, UpdateFilter } from "mongodb";
import { Schema } from "./schema";
/**
 * A function to wait for you to connect :D
 */
export declare function waitForConnection(): void;
export declare type genericFunctions<Lean, Methods extends genericFunctions<Lean, Methods>> = Record<string, ((this: Model<Lean, Methods>, ...args: unknown[]) => unknown)>;
declare class trueModel<Lean, MMethods extends genericFunctions<Lean, MMethods> = Record<string, never>, SH extends Schema<OptionalId<Lean>> = Schema<OptionalId<Lean>>> {
    static schema: Schema<unknown>;
    schema: SH;
    doc: OptionalId<Lean>;
    static colName: string;
    colName: string;
    saved: boolean;
    static methods: unknown;
    methods: MMethods;
    private oldId;
    constructor(collection: string, schema: SH, doc: Partial<OptionalId<Lean>>, methods: MMethods);
    /**
     * Saves the current document into the database
     * @returns
     */
    save(): Promise<OptionalId<Lean>>;
    static find(filter: Partial<unknown>): Promise<unknown[]>;
    static findOne(filter: Partial<unknown>): Promise<unknown | null>;
    static findOneAndDelete(filter: Partial<unknown>): Promise<unknown>;
    static findOneAndReplace(filter: Partial<unknown>, replacement: Record<string, never>): Promise<unknown>;
    static findOneAndUpdate(filter: Partial<unknown>, update: UpdateFilter<unknown>): Promise<unknown>;
    static deleteMany(filter: Partial<unknown>): Promise<void>;
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
    find(filter: Partial<MLean>): Promise<MLean[]>;
    /**
     * Find the first document that has all the properties in the filter argument
     */
    findOne(filter: Partial<MLean>): Promise<MLean | null>;
    /**
     * Find the first document that has all the properties in the filter argument and delete it.
     */
    findOneAndDelete(filter: Partial<MLean>): Promise<MLean>;
    /**
     * Find the first document that matches all the propeties in the filter argument, and replace it the a document in the replacement
     */
    findOneAndReplace(filter: Partial<MLean>, replacement: MLean): Promise<MLean>;
    /**
     * Find the first document that matches all the properties in the filter argument, and do what is essentially Object.assign() on it with the update argument
     */
    findOneAndUpdate(filter: Partial<MLean>, update: UpdateFilter<MLean>): Promise<MLean>;
    /**
     * Delete all matching documents to the filter argument
     */
    deleteMany(filter: Partial<MLean>): Promise<void>;
}
/**
 * A function to return a Model CLASS. Not instance.
 * @param collection the name of the collection
 * @param schema the shema for that collection
 * @returns the model class.
 */
export declare function model<Lean, Methods extends genericFunctions<Lean, Methods> = Record<string, never>>(collection: string, schema: Schema<OptionalId<Lean>>, methods: Methods): Model<Lean, Methods>;
export {};
//# sourceMappingURL=model.d.ts.map