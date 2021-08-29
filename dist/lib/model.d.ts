import { OptionalId, UpdateFilter } from "mongodb";
import { Schema } from "./schema";
export declare function waitForConnection(): void;
declare class trueModel<Lean, SH extends Schema<OptionalId<Lean>> = Schema<OptionalId<Lean>>> {
    schema: SH;
    doc: OptionalId<Lean>;
    static colName: string;
    colName: string;
    saved: boolean;
    private oldId;
    constructor(collection: string, schema: SH, doc: Partial<OptionalId<Lean>>);
    save(): Promise<OptionalId<Lean>>;
    static find(filter: Partial<unknown>): Promise<unknown[]>;
    static findOne(filter: Partial<unknown>): Promise<unknown | undefined>;
    static findOneAndDelete(filter: Partial<unknown>): Promise<unknown>;
    static findOneAndReplace(filter: Partial<unknown>, replacement: Record<string, never>): Promise<unknown>;
    static findOneAndUpdate(filter: Partial<unknown>, update: UpdateFilter<unknown>): Promise<unknown>;
    static deleteOne(filter: Partial<unknown>): Promise<void>;
    static deleteMany(filter: Partial<unknown>): Promise<void>;
}
export interface Model<MLean> extends trueModel<MLean> {
    new (doc: Partial<OptionalId<MLean>>): trueModel<MLean>;
    colName: string;
    find(filter: Partial<MLean>): Promise<MLean[]>;
    findOne(filter: Partial<MLean>): Promise<MLean | undefined>;
    findOneAndDelete(filter: Partial<MLean>): Promise<MLean>;
    findOneAndReplace(filter: Partial<MLean>, replacement: MLean): Promise<MLean>;
    findOneAndUpdate(filter: Partial<MLean>, update: UpdateFilter<MLean>): Promise<MLean>;
    deleteOne(filter: Partial<MLean>): Promise<void>;
    deleteMany(filter: Partial<MLean>): Promise<void>;
}
export declare function model<Lean = unknown>(collection: string, schema: Schema<OptionalId<Lean>>): Model<Lean>;
export {};
//# sourceMappingURL=model.d.ts.map