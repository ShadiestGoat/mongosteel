"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Schema = exports.MongoSteelValidityError = void 0;
/**
 * if a schema validation fails on a Model class level
 */
class MongoSteelValidityError extends Error {
    constructor(validRes) {
        super(`This document is not valid!`);
        Object.setPrototypeOf(this, MongoSteelValidityError.prototype);
        this.obj = validRes;
    }
}
exports.MongoSteelValidityError = MongoSteelValidityError;
class Schema {
    constructor(schema) {
        function parser(val) {
            if (typeof val == "string") {
                if (!val)
                    val = "string"; //use string as default!
                return {
                    type: val,
                    required: true
                };
            }
            else if (Array.isArray(val)) {
                if (val.length == 2) {
                    //this means its unkown keys
                    return {
                        type: ["string", parser(val[1])],
                        required: true
                    };
                }
                else {
                    return {
                        type: [parser(val[0])],
                        required: true
                    };
                }
            }
            else {
                if (typeof val != 'object')
                    throw new Error('Unrecognised schema type!');
                if (Object.keys(val).includes('type') && Object.keys(val).includes('required')) {
                    // schema type options
                    if (typeof val.type == "object")
                        val.type = parser(val.type);
                    return val;
                }
                else {
                    // nested schema
                    return inc(val);
                }
            }
        }
        function inc(obj) {
            const newSH = {};
            if (Array.isArray(obj))
                throw new Error('Schema can\'t be an array!');
            if (typeof obj != 'object')
                throw new Error('Unrecognised schema type!');
            Object.keys(obj).forEach((v) => {
                newSH[v] = parser(obj[v]);
            });
            return newSH;
        }
        this.schema = inc(schema);
    }
    /**
     * validate an object to make sure the document provided is a valid one. This also adds the default values
     *
     * Note: this does not throw MongoSteelValidityError!
     */
    validate(doc, opts = {}) {
        if (typeof doc != "object" || Array.isArray(doc))
            return {
                valid: false,
                reason: "majorBadType"
            };
        function inc(s1, s2) {
            var _a;
            for (const v in s1) {
                if (!Object.keys(s2).includes(v)) {
                    if (s1[v].required && !opts.ignoreRequired)
                        return {
                            valid: false,
                            reason: 'required',
                            badKey: v
                        };
                    else if (s1[v].default && !opts.ignoreDefault) {
                        if (typeof s1[v].default == "function")
                            doc[v] = s1[v].default();
                        else
                            doc[v] = s1[v].default;
                    }
                    continue;
                }
                if (Array.isArray(s1[v].type)) {
                    if (s1[v].type.length == 2) {
                        if (typeof s2[v] != "object" || Array.isArray(s2[v]))
                            return {
                                valid: false,
                                reason: "badType",
                                badKey: v
                            };
                        for (const value in s2[v]) {
                            const res = inc(s1[v].type[1], s2[v][value]);
                            if (!res.valid)
                                return res;
                        }
                    }
                    if (!Array.isArray(s2[v]))
                        return {
                            valid: false,
                            reason: "badType",
                            badKey: v
                        };
                    const res = inc(s1[v].type[0], s2[v][0]);
                    if (!res.valid)
                        return res;
                }
                if (typeof s1[v].type == "object") {
                    const res = inc(s1[v].type, s2[v]);
                    if (!res.valid)
                        return res;
                }
                else {
                    switch (s1[v].type) {
                        case "boolean":
                            if (typeof s2[v] != "boolean")
                                return {
                                    valid: false,
                                    reason: "badType",
                                    badKey: v
                                };
                            continue;
                        case "number":
                            if (typeof s2[v] != "number")
                                return {
                                    valid: false,
                                    reason: "badType",
                                    badKey: v
                                };
                            continue;
                        case "string":
                            if (typeof s2[v] != "string")
                                return {
                                    valid: false,
                                    reason: "badType",
                                    badKey: v
                                };
                            if (s1[v].pattern) {
                                if (!((_a = s1[v].pattern) === null || _a === void 0 ? void 0 : _a.test(s2[v])))
                                    return {
                                        valid: false,
                                        reason: "badType",
                                        badKey: v
                                    };
                            }
                            continue;
                        case "mixed":
                            continue;
                        default:
                            console.warn(`Unknown type for ${v}! The schema says ${s1[v].type}`);
                            continue;
                    }
                }
            }
            return { valid: true, res: doc };
        }
        return inc(this.schema, doc);
    }
}
exports.Schema = Schema;
exports.default = Schema;
