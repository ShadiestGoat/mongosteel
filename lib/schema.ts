/**
 * Convert a type to a string of that type. Nested shemas convert to SchemaDefinition
 */
export type TypeToString<T, R extends boolean = false> = (T extends string ? 'string' :
                                       T extends number ? 'number' :
                                       T extends boolean ? "boolean" :
                                       T extends Array<infer U> ? [TypeToString<U, false>] :
                                       Record<string,never> extends T ? ["string", TypeToString<T[keyof T], false>] : //in case of unknown keys like {[key:string]: whatever}
                                       T extends Record<string, unknown> ?  R extends true ? undefined : SchemaDefinition<T> :
                                       "mixed") | "mixed"

/**
 * Options for your type
 */
export type SchemaTypeOptions<T> = {
    type:TypeToString<T, false>
    /**
     * Weather or not the property is required
     */
    required: boolean,
    /**
     * The default value of the property. If required is present, this will be ignored
     */
    default?:T | (() => T),
    /**
     * If the option is of string type, this can be used to validate the string
     */
    pattern?:T extends string ? RegExp | undefined : undefined
}

/**
 * Used to create a definition for the Schema constructor
 */
export type SchemaDefinition<T> = {
    [K in keyof T]: SchemaTypeOptions<T[K]> | TypeToString<T[K], true>
}

/**
 * Same as SchemaDefinition except this one forces you to use SchemaTypeOptions
 */
export type SchemaFull<T> = {
    [K in keyof T]: SchemaTypeOptions<T[K]>
}

/**
 * a valid response to a validation schema
 */
export type valid<obj> = {
    valid: true,
    res:obj
}

/**
 * an invalid response to a validation schema
 */
export type invalid = {
    valid: false,
    /**
     * the key which has the issue. Undefined if the reason is majorBadType, since the whole document type is invalid
     */
    badKey: string,
    /**
     * badType - the key above has bad type,
     * required - the key above is required but missing
     * majorBadType - the whole document is not a correct type! It's not an object or is an array.
     */
    reason: "badType" | "required"
} | {
    valid: false,
    reason: "majorBadType"
}

export type validTot<obj> = valid<obj> | invalid

export type SchemaValidationOpts = {
    /**
     * Ignore weather something is required or not
     */
    ignoreRequired?:boolean,
    /**
     * Don't apply defaults
     */
    ignoreDefault?:boolean
}

/**
 * if a schema validation fails on a Model class level
 */
export class MongoSteelValidityError extends Error {
    obj:invalid
    constructor(validRes:invalid) {
        super(`This document is not valid!`)
        Object.setPrototypeOf(this, MongoSteelValidityError.prototype)
        this.obj = validRes
    }
}

export class Schema<SHLean = unknown> {
    schema:SchemaFull<SHLean>
    constructor(schema:SchemaDefinition<SHLean>) {
        function parser(val:unknown):unknown {
            if (typeof val == "string") {
                if (!val) val = "string" //use string as default!
                return {
                    type: val,
                    required: true
                }
            } else if (Array.isArray(val)) {
                if (val.length == 2) {
                    //this means its unkown keys
                    return {
                        type: ["string", parser(val[1])],
                        required: true
                    }
                } else {
                    return {
                        type: [parser(val[0])],
                        required: true
                    }
                }
            } else {
                if (typeof val != 'object') throw new Error('Unrecognised schema type!')
                if (Object.keys(val as Record<string, unknown>).includes('type') && Object.keys(val as Record<string, unknown>).includes('required')) {
                    // schema type options
                    if (typeof (val as SchemaTypeOptions<unknown>).type == "object") (val as Record<string, unknown>).type = parser((val as SchemaTypeOptions<unknown>).type)
                    return val as SchemaTypeOptions<unknown>
                } else {
                    // nested schema
                    return inc(val) as SchemaTypeOptions<unknown>
                }
            }
        }

        function inc(obj:unknown):SchemaFull<unknown> {
            const newSH:SchemaFull<Record<string, unknown>> = { }
            if (Array.isArray(obj)) throw new Error('Schema can\'t be an array!')
            if (typeof obj != 'object') throw new Error('Unrecognised schema type!')
            Object.keys(obj as Record<string, unknown>).forEach((v) => {
                newSH[v] = parser((obj as Record<string, unknown>)[v]) as SchemaTypeOptions<unknown>
            })
            return newSH
        }
        this.schema = inc(schema) as SchemaFull<SHLean>
    }
    /**
     * validate an object to make sure the document provided is a valid one. This also adds the default values
     *
     * Note: this does not throw MongoSteelValidityError!
     */
    validate(doc:unknown, opts:SchemaValidationOpts = {}):validTot<SHLean> {
        if (typeof doc != "object" || Array.isArray(doc)) return {
            valid: false,
            reason: "majorBadType"
        }
        function inc(s1:Record<string, unknown> | SchemaTypeOptions<unknown>, s2:Record<string, unknown>):validTot<SHLean> {
            for (const v in s1) {
                if (!Object.keys(s2).includes(v)) {
                    if (s1[v].required && !opts.ignoreRequired) return {
                        valid: false,
                        reason: 'required',
                        badKey: v
                    }
                    else if (s1[v].default && !opts.ignoreDefault) {
                        if (typeof s1[v].default == "function") (doc as Record<string, unknown>)[v] = s1[v].default()
                        else (doc as Record<string, unknown>)[v] = s1[v].default
                    }
                    continue
                }
                if (Array.isArray(s1[v].type)) {
                    if ((s1[v].type as unknown[]).length == 2) {
                        if (typeof s2[v] != "object" || Array.isArray(s2[v])) return {
                            valid: false,
                            reason: "badType",
                            badKey: v
                        }
                        for (const value in (s2[v] as Record<string, never>)) {
                            const res = inc(s1[v].type[1], (s2[v] as Record<string, never>)[value])
                            if (!res.valid) return res
                        }
                    }
                    if (!Array.isArray(s2[v])) return {
                        valid: false,
                        reason: "badType",
                        badKey: v
                    }
                    const res = inc((s1[v].type as [Record<string, unknown>])[0], (s2[v] as [Record<string, unknown>])[0])
                    if (!res.valid) return res
                }
                if (typeof s1[v].type == "object") {
                    const res = inc(s1[v].type as Record<string, unknown>, s2[v] as Record<string, unknown>)
                    if (!res.valid) return res
                } else {
                    switch(s1[v].type) {
                        case "boolean":
                            if (typeof s2[v] != "boolean") return {
                                valid: false,
                                reason: "badType",
                                badKey: v
                            }
                            continue
                        case "number":
                            if (typeof s2[v] != "number") return {
                                valid: false,
                                reason: "badType",
                                badKey: v
                            }
                            continue
                        case "string":
                            if (typeof s2[v] != "string") return {
                                valid: false,
                                reason: "badType",
                                badKey: v
                            }
                            if ((s1[v] as SchemaTypeOptions<string>).pattern) {
                                if (!(s1[v] as SchemaTypeOptions<string>).pattern?.test(s2[v] as string)) return {
                                    valid: false,
                                    reason: "badType",
                                    badKey: v
                                }
                            }
                            continue
                        case "mixed":
                            continue
                        default:
                            console.warn(`Unknown type for ${v}! The schema says ${s1[v].type}`)
                            continue
                    }
                }
            }
            return { valid: true, res: doc as SHLean }
        }
        return inc(this.schema, doc as Record<string, unknown>)
    }
}

export default Schema
