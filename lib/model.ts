import { Collection, OptionalId, UpdateFilter } from "mongodb";
import { mongoSteelConnection } from "./connection";
import { MongoSteelValidityError, Schema } from "./schema";

/**
 * A function to wait for you to connect :D
 */
export function waitForConnection():void {
    const badTime = Date.now() + 30 * 1000
    while (!mongoSteelConnection.on) if (Date.now() > badTime) throw "There is no connection!"
}

function getCollection<L>(name:string):Collection<L> {
    waitForConnection()
    if (!mongoSteelConnection.on) throw "Please don't manually set this variable!"
    return mongoSteelConnection.db.collection(name)
}

export type genericFunctions<Lean, Methods extends genericFunctions<Lean, Methods>> = Record<string, ((this:Model<Lean, Methods>, ...args: unknown[]) => unknown)>

class trueModel<Lean, MMethods extends genericFunctions<Lean, MMethods> = Record<string, never>, SH extends Schema<OptionalId<Lean>> = Schema<OptionalId<Lean>>> {
    static schema:Schema<unknown>
    schema:SH
    doc:OptionalId<Lean>
    static colName:string
    colName:string
    saved:boolean
    static methods:unknown
    methods:MMethods
    /**
     * This is not used within the class, this is intended for any future plugin support, or current workaround methods
     */
    collection:Collection<Lean>
    /**
     * This is not used within the class, this is intended for any future plugin support, or current workaround methods
     */
    static collection:Collection
    private oldId:string
    constructor(collection:string, schema:SH, doc:Partial<OptionalId<Lean>>, methods:MMethods) {
        this.colName = collection
        this.collection = getCollection<Lean>(collection)
        const validate = schema.validate(doc)
        if (!validate.valid && !mongoSteelConnection.opts.noVerification) throw new MongoSteelValidityError(validate)
        this.doc = validate.valid ? validate.res : doc as OptionalId<Lean>
        this.schema = schema
        this.saved = false
        this.oldId = ""
        this.methods = methods
    }
    /**
     * Saves the current document into the database
     * @returns
     */
    async save():Promise<OptionalId<Lean>> {
        const col = getCollection<Lean>(this.colName)
        if (!mongoSteelConnection.opts.noIdDetection && this.saved && (this.oldId == this.doc._id)) {
            console.warn(`The _id ${this.doc._id} has already been saved once, overriding it with a new id...\nTo avoid this, use mongoSteel option { noIdDetection:true }`)
            delete this.doc._id
        }
        const res = await col.insertOne(this.doc)
        if (!res.insertedId) throw Error('Not inserted')
        this.saved = true
        this.oldId = res.insertedId as string
        return this.doc
    }

    static async find(filter:Partial<unknown>):Promise<unknown[]> {
        const col = getCollection<unknown>(this.colName)
        return await col.find(filter).toArray()
    }

    static async findOne(filter:Partial<unknown>):Promise<unknown | null> {
        const col = getCollection<unknown>(this.colName)
        return await col.findOne(filter)
    }

    static async findOneAndDelete(filter:Partial<unknown>):Promise<unknown> {
        const col = getCollection<unknown>(this.colName)
        const res = await col.findOneAndDelete(filter)
        if (!res.ok) throw new Error('findOneAndDelete returned not OK')
        return res.value
    }

    static async findOneAndReplace(filter:Partial<unknown>, replacement:Record<string, never>):Promise<unknown> {
        const valid = this.schema.validate(replacement)
        if (!valid.valid) throw new MongoSteelValidityError(valid)
        replacement = valid.res as Record<string, never>
        const col = getCollection<unknown>(this.colName)
        const res = await col.findOneAndReplace(filter, replacement)
        if (!res.ok) throw new Error('findOneAndReplace returned not OK')
        return res.value
    }

    static async findOneAndUpdate(filter:Partial<unknown>, update:UpdateFilter<unknown>):Promise<unknown> {
        const valid = this.schema.validate(update, {ignoreDefault: true, ignoreRequired: true})
        if (!valid.valid) throw new MongoSteelValidityError(valid)
        // no need to update the update since there should be no mutations!
        const col = getCollection<unknown>(this.colName)
        const res = await col.findOneAndUpdate(filter, update)
        if (!res.ok) throw new Error('findOneAndUpdate returned not OK')
        return res.value
    }

    static async deleteMany(filter:Partial<unknown>):Promise<void> {
        const col = getCollection<unknown>(this.colName)
        await col.deleteMany(filter)
    }
}


/**
 * The Model class. This should not be called directly, check model() for getting this class.  This should only be used for types
 */
export interface Model<MLean, MMethods extends genericFunctions<MLean, MMethods> = Record<string, never>> extends trueModel<MLean, MMethods> {
    new(doc:Partial<OptionalId<MLean>>):trueModel<MLean>
    colName:string
    collection:Collection<MLean>
    methods:MMethods
    /**
     * Find multiple documents in your collection using properties of your document
     */
    find(filter:Partial<MLean>):Promise<MLean[]>
    /**
     * Find the first document that has all the properties in the filter argument
     */
    findOne(filter:Partial<MLean>):Promise<MLean | null>
    /**
     * Find the first document that has all the properties in the filter argument and delete it.
     */
    findOneAndDelete(filter:Partial<MLean>):Promise<MLean>
    /**
     * Find the first document that matches all the propeties in the filter argument, and replace it the a document in the replacement
     */
    findOneAndReplace(filter:Partial<MLean>, replacement:MLean):Promise<MLean>
    /**
     * Find the first document that matches all the properties in the filter argument, and do what is essentially Object.assign() on it with the update argument
     */
    findOneAndUpdate(filter:Partial<MLean>, update:UpdateFilter<MLean>):Promise<MLean>
    /**
     * Delete all matching documents to the filter argument
     */
    deleteMany(filter:Partial<MLean>):Promise<void>
}

/**
 * A function to return a Model CLASS. Not instance.
 * @param collection the name of the collection
 * @param schema the shema for that collection
 * @returns the model class.
 */
export function model<Lean, Methods extends genericFunctions<Lean, Methods> = Record<string, never>>(collection:string, schema:Schema<OptionalId<Lean>>, methods:Methods):Model<Lean, Methods> {
    class MModel extends trueModel<Lean, Methods> {
        constructor(doc:Partial<OptionalId<Lean>> = {}) {
            super(collection, schema, doc, methods)
        }
    }
    MModel.colName = collection
    MModel.schema = schema as Schema
    MModel.collection = (getCollection<Lean>(collection) as unknown) as Collection
    MModel.methods = methods
    return (MModel as unknown) as Model<Lean, Methods>
}
