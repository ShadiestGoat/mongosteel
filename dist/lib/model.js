"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.model = exports.waitForConnection = void 0;
const connection_1 = require("./connection");
const schema_1 = require("./schema");
/**
 * A function to wait for you to connect :D
 */
function waitForConnection() {
    const badTime = Date.now() + 30 * 1000;
    while (!connection_1.mongoSteelConnection.on)
        if (Date.now() > badTime)
            throw "There is no connection!";
}
exports.waitForConnection = waitForConnection;
function getCollection(name) {
    if (!connection_1.mongoSteelConnection.on)
        throw "Please don't manually set this variable!";
    return connection_1.mongoSteelConnection.db.collection(name);
}
class trueModel {
    constructor(collection, schema, doc, methods) {
        this.colName = collection;
        const validate = schema.validate(doc);
        if (!validate.valid && !connection_1.mongoSteelConnection.opts.noVerification)
            throw new schema_1.MongoSteelValidityError(validate);
        this.doc = validate.valid ? validate.res : doc;
        this.schema = schema;
        this.saved = false;
        this.oldId = "";
        this.methods = methods;
    }
    /**
     * Saves the current document into the database
     * @returns
     */
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            const col = getCollection(this.colName);
            if (!connection_1.mongoSteelConnection.opts.noIdDetection && this.saved && (this.oldId == this.doc._id)) {
                console.warn(`The _id ${this.doc._id} has already been saved once, overriding it with a new id...\nTo avoid this, use mongoSteel option { noIdDetection:true }`);
                delete this.doc._id;
            }
            const res = yield col.insertOne(this.doc);
            if (!res.insertedId)
                throw Error('Not inserted');
            this.saved = true;
            this.oldId = res.insertedId;
            return this.doc;
        });
    }
    static find(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const col = getCollection(this.colName);
            return yield col.find(filter).toArray();
        });
    }
    static findOne(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const col = getCollection(this.colName);
            return yield col.findOne(filter);
        });
    }
    static findOneAndDelete(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const col = getCollection(this.colName);
            const res = yield col.findOneAndDelete(filter);
            if (!res.ok)
                throw new Error('findOneAndDelete returned not OK');
            return res.value;
        });
    }
    static findOneAndReplace(filter, replacement) {
        return __awaiter(this, void 0, void 0, function* () {
            const valid = this.schema.validate(replacement);
            if (!valid.valid)
                throw new schema_1.MongoSteelValidityError(valid);
            replacement = valid.res;
            const col = getCollection(this.colName);
            const res = yield col.findOneAndReplace(filter, replacement);
            if (!res.ok)
                throw new Error('findOneAndReplace returned not OK');
            return res.value;
        });
    }
    static findOneAndUpdate(filter, update) {
        return __awaiter(this, void 0, void 0, function* () {
            const valid = this.schema.validate(update, { ignoreDefault: true, ignoreRequired: true });
            if (!valid.valid)
                throw new schema_1.MongoSteelValidityError(valid);
            // no need to update the update since there should be no mutations!
            const col = getCollection(this.colName);
            const res = yield col.findOneAndUpdate(filter, {
                $set: update
            });
            if (!res.ok)
                throw new Error('findOneAndUpdate returned not OK');
            return res.value;
        });
    }
    static deleteMany(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const col = getCollection(this.colName);
            yield col.deleteMany(filter);
        });
    }
}
/**
 * A function to return a Model CLASS. Not instance.
 * @param collection the name of the collection
 * @param schema the shema for that collection
 * @returns the model class.
 */
function model(collection, schema, methods) {
    class MModel extends trueModel {
        constructor(doc = {}) {
            super(collection, schema, doc, methods);
        }
    }
    MModel.colName = collection;
    MModel.schema = schema;
    MModel.methods = methods;
    return MModel;
}
exports.model = model;
