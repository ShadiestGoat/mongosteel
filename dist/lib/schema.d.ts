/**
 * Convert a type to a string of that type. Nested shemas convert to SchemaDefinition
 */
export declare type TypeToString<T extends unknown, R extends boolean> = T extends string ? 'string' : T extends number ? 'number' : T extends boolean ? "boolean" : T extends Array<infer U> ? [TypeToString<U, false>] : T extends Record<string, unknown> ? R extends true ? undefined : SchemaDefinition<T> : unknown;
/**
 * Options for your type
 */
export declare type SchemaTypeOptions<T> = {
    type: TypeToString<T, false>;
    /**
     * Weather or not the property is required
     */
    required: boolean;
    /**
     * The default value of the property. If required is present, this will be ignored
     */
    default?: T | (() => T);
    /**
     * If the option is of string type, this can be used to validate the string
     */
    pattern?: T extends string ? RegExp | undefined : undefined;
};
/**
 * Used to create a definition for the Schema constructor
 */
export declare type SchemaDefinition<T> = {
    [K in keyof T]: SchemaTypeOptions<T[K]> | TypeToString<T[K], true>;
};
/**
 * Same as SchemaDefinition except this one forces you to use SchemaTypeOptions
 */
export declare type SchemaFull<T> = {
    [K in keyof T]: SchemaTypeOptions<T[K]>;
};
/**
 * a valid response to a validation schema
 */
export declare type valid<obj> = {
    valid: true;
    res: obj;
};
/**
 * an invalid response to a validation schema
 */
export declare type invalid = {
    valid: false;
    /**
     * the key which has the issue. Undefined if the reason is majorBadType, since the whole document type is invalid
     */
    badKey: string;
    /**
     * badType - the key above has bad type,
     * required - the key above is required but missing
     * majorBadType - the whole document is not a correct type! It's not an object or is an array.
     */
    reason: "badType" | "required";
} | {
    valid: false;
    reason: "majorBadType";
};
export declare type validTot<obj> = valid<obj> | invalid;
export declare type SchemaValidationOpts = {
    /**
     * Ignore weather something is required or not
     */
    ignoreRequired?: boolean;
    /**
     * Don't apply defaults
     */
    ignoreDefault?: boolean;
};
/**
 * if a schema validation fails on a Model class level
 */
export declare class MongoSteelValidityError extends Error {
    obj: invalid;
    constructor(validRes: invalid);
}
export declare class Schema<SHLean = unknown> {
    schema: SchemaFull<SHLean>;
    constructor(schema: SchemaDefinition<SHLean>);
    /**
     * validate an object to make sure the document provided is a valid one. This also adds the default values
     *
     * Note: this does not throw MongoSteelValidityError!
     */
    validate(doc: unknown, opts?: SchemaValidationOpts): validTot<SHLean>;
}
export default Schema;
//# sourceMappingURL=schema.d.ts.map