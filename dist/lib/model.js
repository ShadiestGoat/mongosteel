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
function waitForConnection() {
    let tries = 0;
    function inc() {
        if (connection_1.mongoSteelConnection.on) {
            clearInterval(this);
            return;
        }
        tries++;
        if (tries > 11)
            throw "There is no connection!";
    }
    setInterval(inc);
}
exports.waitForConnection = waitForConnection;
function getCollection(name) {
    waitForConnection();
    if (!connection_1.mongoSteelConnection.on)
        throw "Please don't manually set this variable!";
    return connection_1.mongoSteelConnection.db.collection(name);
}
class trueModel {
    constructor(collection, schema, doc) {
        waitForConnection();
        if (!connection_1.mongoSteelConnection.on)
            throw "Please don't manually set this variable!";
        const validate = schema.validate(doc);
        if (!validate.valid)
            throw { name: "Error", message: "Invalid document!", err: validate };
        this.doc = validate.res;
        this.schema = schema;
        this.colName = collection;
        this.saved = false;
        this.oldId = "";
    }
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            const col = getCollection(this.colName);
            if (this.saved && (this.oldId == this.doc._id)) {
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
            const col = getCollection(this.colName);
            const res = yield col.findOneAndReplace(filter, replacement);
            if (!res.ok)
                throw new Error('findOneAndReplace returned not OK');
            return res.value;
        });
    }
    static findOneAndUpdate(filter, update) {
        return __awaiter(this, void 0, void 0, function* () {
            const col = getCollection(this.colName);
            const res = yield col.findOneAndUpdate(filter, update);
            if (!res.ok)
                throw new Error('findOneAndUpdate returned not OK');
            return res.value;
        });
    }
    static deleteOne(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const col = getCollection(this.colName);
            yield col.deleteOne(filter);
        });
    }
    static deleteMany(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const col = getCollection(this.colName);
            yield col.deleteMany(filter);
        });
    }
}
function model(collection, schema) {
    class MModel extends trueModel {
        constructor(doc = {}) {
            super(collection, schema, doc);
        }
    }
    MModel.colName = collection;
    return MModel;
}
exports.model = model;
