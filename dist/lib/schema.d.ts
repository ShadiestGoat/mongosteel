export declare type TypeToString<T extends unknown, R extends boolean> = T extends string ? 'string' : T extends number ? 'number' : T extends boolean ? "boolean" : T extends Array<infer U> ? [TypeToString<U, false>] : T extends Record<string, unknown> ? R extends true ? undefined : SchemaDefinition<T> : unknown;
export declare type SchemaTypeOptions<T> = {
    type: TypeToString<T, false>;
    required: boolean;
    default?: T;
    pattern?: T extends string ? RegExp | undefined : undefined;
};
export declare type SchemaDefinition<T> = {
    [K in keyof T]: SchemaTypeOptions<T[K]> | TypeToString<T[K], true>;
};
export declare type SchemaFull<T> = {
    [K in keyof T]: SchemaTypeOptions<T[K]>;
};
export declare type valid<obj> = {
    valid: true;
    res: obj;
} | {
    valid: false;
    badKey: string;
    reason: "badType" | "required";
} | {
    valid: false;
    reason: "majorBadType";
};
export declare class Schema<SHLean = unknown> {
    schema: SchemaFull<SHLean>;
    hasObjId: boolean;
    constructor(schema: SchemaDefinition<SHLean>);
    validate(doc: unknown): valid<SHLean>;
}
export default Schema;
//# sourceMappingURL=schema.d.ts.map