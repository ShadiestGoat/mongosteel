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
        function testType(opts, val, key) {
            var _a;
            switch (opts.type) {
                case "boolean":
                    if (typeof val != "boolean")
                        return {
                            valid: false,
                            reason: "badType",
                            badKey: key
                        };
                    return false;
                case "number":
                    if (typeof val != "number")
                        return {
                            valid: false,
                            reason: "badType",
                            badKey: key
                        };
                    return false;
                case "string":
                    if (typeof val != "string")
                        return {
                            valid: false,
                            reason: "badType",
                            badKey: key
                        };
                    if (opts.pattern) {
                        if (!((_a = opts.pattern) === null || _a === void 0 ? void 0 : _a.test(val)))
                            return {
                                valid: false,
                                reason: "badType",
                                badKey: key
                            };
                    }
                    return false;
                case "mixed":
                    return false;
                default:
                    console.warn(`Unknown type for ${key}! The schema says ${opts.type}`);
                    return false;
            }
        }
        let arrKey = "";
        function inc(s1, s2) {
            if (Object.keys(s1).includes('type') && Object.keys(s1).includes('required')) {
                const val = testType(s1, s2, arrKey);
                if (val)
                    return val;
            }
            else {
                for (const v in s1) {
                    if ((typeof s2 == "object" && !Array.isArray(s2)) && !Object.keys(s2).includes(v)) {
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
                    else if (Array.isArray(s1[v].type)) {
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
                        arrKey = v;
                        s2[v].forEach(value => {
                            const res = inc(s1[v].type[0], value);
                            if (!res.valid)
                                return res;
                        });
                    }
                    else if (typeof s1[v].type == "object") {
                        const res = inc(s1[v].type, s2[v]);
                        if (!res.valid)
                            return res;
                    }
                    else {
                        const val = testType(s1[v], s2[v], v);
                        if (val)
                            return val;
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
