import { Collection, Condition, OptionalId, UpdateFilter } from "mongodb";
import { mongoSteelConnection } from "./connection";
import { MongoSteelValidityError, Schema } from "./schema";

export type MongoSteelFilter<T> = {
    [K in keyof T]?: Condition<T[K]>
}

export type genericFunctions<Lean, Methods extends genericFunctions<Lean, Methods>> = Record<string, ((this:Model<Lean, Methods>, ...args: unknown[]) => unknown)>

function waitForAvailability<Doc = Record<string, unknown>>(name:string):Promise<Collection<Doc>> {
    const poll = (resolve:(Collection:Collection<Doc>) => void):void => {
      if(mongoSteelConnection.on) resolve(mongoSteelConnection.db.collection(name));
      else setTimeout(() => poll(resolve), 100);
    }
    return new Promise(poll);
}

class trueModel<Lean, MMethods extends genericFunctions<Lean, MMethods> = Record<string, never>, SH extends Schema<OptionalId<Lean>> = Schema<OptionalId<Lean>>> {
    static schema:Schema<unknown>
    schema:SH
    doc:OptionalId<Lean>
    saved:boolean
    static methods:unknown
    methods:MMethods
    private oldId:string
    static collection:Promise<Collection>
    collection:Promise<Collection<Lean>>

    constructor(collection:string, schema:SH, doc:Partial<OptionalId<Lean>>, methods:MMethods) {
        const validate = schema.validate(doc)
        if (!validate.valid && !mongoSteelConnection.opts.noVerification) throw new MongoSteelValidityError(validate)
        this.doc = validate.valid ? validate.res : doc as OptionalId<Lean>
        this.schema = schema
        this.saved = false
        this.oldId = ""
        this.methods = methods
        this.collection = waitForAvailability<Lean>(collection)
    }
    /** Saves the current document into the database
     * @returns */
    async save():Promise<OptionalId<Lean>> {
        if (!mongoSteelConnection.opts.noIdDetection && this.saved && (this.oldId == this.doc._id)) {
            const {_id, ...nDoc} = this.doc
            this.doc = nDoc as OptionalId<Lean>
            console.warn(`The _id ${_id} has already been saved once, overriding it with a new id!`)
        }
        const res = await (await this.collection).insertOne(this.doc)
        if (!res.insertedId) throw Error('Not inserted')
        if (!mongoSteelConnection.opts.noDocsUpdate) {
            const newDoc = await (await this.collection).findOne({_id: res.insertedId} as unknown as Lean)
            if (!newDoc) throw Error('Weird')
            this.doc = newDoc as OptionalId<Lean>
        }
        this.saved = true
        this.oldId = res.insertedId as string
        return this.doc
    }

    static async find(filter:MongoSteelFilter<unknown>):Promise<unknown[]> {
        return await (await this.collection).find(filter).toArray()
    }

    static async findOne(filter:MongoSteelFilter<unknown>):Promise<unknown | null> {
        return await (await this.collection).findOne(filter)
    }

    static async findOneAndDelete(filter:MongoSteelFilter<unknown>):Promise<unknown> {
        const res = await (await this.collection).findOneAndDelete(filter)
        if (!res.ok) throw new Error('findOneAndDelete returned not OK')
        return res.value
    }

    static async findOneAndReplace(filter:MongoSteelFilter<unknown>, replacement:Record<string, unknown>):Promise<unknown> {
        const valid = this.schema.validate(replacement)
        if (!valid.valid) throw new MongoSteelValidityError(valid)
        replacement = valid.res as Record<string, never>
        const res = await (await this.collection).findOneAndReplace(filter, replacement)
        if (!res.ok) throw new Error('findOneAndReplace returned not OK')
        return res.value
    }

    static async findOneAndUpdate(filter:MongoSteelFilter<unknown>, update:Partial<unknown>):Promise<unknown> {
        const valid = this.schema.validate(update, {ignoreDefault: true, ignoreRequired: true})
        if (!valid.valid) throw new MongoSteelValidityError(valid)
        // no need to update the update since there should be no mutations!
        const res = await (await this.collection).findOneAndUpdate(filter, {
            $set: update as UpdateFilter<unknown>
        })
        if (!res.ok) throw new Error('findOneAndUpdate returned not OK')
        return res.value
    }

    static async deleteMany(filter:MongoSteelFilter<unknown>):Promise<void> {
        await (await this.collection).deleteMany(filter)
    }
}

/** The Model class. This should not be called directly, check model() for getting this class.  This should only be used for types */
export interface Model<MLean, MMethods extends genericFunctions<MLean, MMethods> = Record<string, never>> extends trueModel<MLean, MMethods> {
    new(doc:Partial<OptionalId<MLean>>):trueModel<MLean>
    colName:string
    methods:MMethods
    /** Find multiple documents in your collection using properties of your document */
    find(filter:MongoSteelFilter<MLean>):Promise<MLean[]>
    /** Find the first document that has all the properties in the filter argument */
    findOne(filter:MongoSteelFilter<MLean>):Promise<MLean | null>
    /** Find the first document that has all the properties in the filter argument and delete it. */
    findOneAndDelete(filter:MongoSteelFilter<MLean>):Promise<MLean>
    /** Find the first document that matches all the propeties in the filter argument, and replace it the a document in the replacement */
    findOneAndReplace(filter:MongoSteelFilter<MLean>, replacement:MLean):Promise<MLean>
    /** Find the first document that matches all the properties in the filter argument, and do what is essentially Object.assign() on it with the update argument */
    findOneAndUpdate(filter:MongoSteelFilter<MLean>, update:Partial<MLean>):Promise<MLean>
    /** Delete all matching documents to the filter argument */
    deleteMany(filter:MongoSteelFilter<MLean>):Promise<void>
}

/** A function to return a Model CLASS. Not instance.
 * @param collection the name of the collection
 * @param schema the shema for that collection
 * @returns the model class. */
export function model<Lean, Methods extends genericFunctions<Lean, Methods> = Record<string, never>>(collection:string, schema:Schema<OptionalId<Lean>>, methods:Methods):Model<Lean, Methods> {
    class MModel extends trueModel<Lean, Methods> {
        constructor(doc:Partial<OptionalId<Lean>> = {}) {
            super(collection, schema, doc, methods)
        }
    }
    MModel.collection=waitForAvailability(collection)
    MModel.schema = schema as Schema
    MModel.methods = methods
    return (MModel as unknown) as Model<Lean, Methods>
}
