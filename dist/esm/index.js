var u=class extends Error{constructor(e){super("This document is not valid!");Object.setPrototypeOf(this,u.prototype),this.obj=e}},f=class{constructor(e){function t(o){if(typeof o=="string")return o||="string",{type:o,required:!0};if(Array.isArray(o))return o.length==2?{type:["string",t(o[1])],required:!0}:{type:[t(o[0])],required:!0};if(typeof o!="object")throw new Error("Unrecognised schema type!");return Object.keys(o).includes("type")&&Object.keys(o).includes("required")?(typeof o.type=="object"&&(o.type=t(o.type)),o):r(o)}function r(o){let d={};if(Array.isArray(o))throw new Error("Schema can't be an array!");if(typeof o!="object")throw new Error("Unrecognised schema type!");return Object.keys(o).forEach(i=>{d[i]=t(o[i])}),d}this.schema=r(e)}validate(e,t={}){if(typeof e!="object"||Array.isArray(e))return{valid:!1,reason:"majorBadType"};function r(i,a,n){switch(i.type){case"boolean":return typeof a!="boolean"?{valid:!1,reason:"badType",badKey:n}:!1;case"number":return typeof a!="number"?{valid:!1,reason:"badType",badKey:n}:!1;case"string":return typeof a!="string"?{valid:!1,reason:"badType",badKey:n}:i.pattern&&!i.pattern?.test(a)?{valid:!1,reason:"badType",badKey:n}:!1;case"mixed":return!1;default:return!1}}let o="";function d(i,a){if(Object.keys(i).includes("type")&&Object.keys(i).includes("required")){if(!(typeof a=="undefined"&&!i.required)){let n=r(i,a,o);if(n)return n}}else for(let n in i)if(typeof a=="object"&&!Array.isArray(a)&&!Object.keys(a).includes(n)){if(i[n].required&&!t.ignoreRequired)return{valid:!1,reason:"required",badKey:n};i[n].default&&!t.ignoreDefault&&(typeof i[n].default=="function"?e[n]=i[n].default():e[n]=i[n].default)}else if(Array.isArray(i[n].type)){if(i[n].type.length==2){if(Array.isArray(a[n]))return{valid:!1,reason:"badType",badKey:n};for(let c in a[n]){let p=d(i[n].type[1],a[n][c]);if(!p.valid)return p}}if(!Array.isArray(a[n]))return{valid:!1,reason:"badType",badKey:n};o=n,a[n].forEach(c=>{let p=d(i[n].type[0],c);if(!p.valid)return p})}else if(typeof i[n].type=="object"){let c=d(i[n].type,a[n]);if(!c.valid)return c}else{if(typeof a[n]=="undefined"&&!i[n].required)continue;let c=r(i[n],a[n],n);if(c)return c}return{valid:!0,res:e}}return d(this.schema,e)}};import{MongoClient as m}from"mongodb";function y(s){return["dbName","location","password","user"].forEach(e=>{if(!Object.keys(s).includes(e))throw Error(`${e} is required in the options!`)}),s.dbOpts||={},encodeURI(`mongodb${/\d+\.\d+\.\d+\.\d+/.test(s.location)?"":"+srv"}://${s.user}:${s.password}@${s.location}/${s.dbName}${Object.keys(s.dbOpts).length==0?"":"?"}${Object.keys(s.dbOpts).map((e,t)=>`${t==0?"":"&"}${`${e}=${s.dbOpts[e]}`}`).join("")}`)}var l={on:!1,models:{},opts:{}},g=class{static async connect(e,t,r){if(l.on){if(e)throw new Error(`I already have a connection to ${l.url}!`);return l.db}if(!e)throw new Error("I have nothing to connect to!");let o=typeof e=="string"?encodeURI(e):y(e),d=await m.connect(o,Object.assign({useNewUrlParser:!0,useUnifiedTopology:!0},t)),i=d.db(),a=Object.assign({},r);return l={on:!0,db:i,client:d,url:o,opts:a,models:l.models},i}static async disconnect(){l&&(await l.client?.close(),l={on:!1,client:void 0,db:void 0,url:void 0,models:l.models,opts:l.opts})}};function w(s){let e=t=>{l.on?t(l.db.collection(s)):setTimeout(()=>e(t),100)};return new Promise(e)}var h=class{constructor(e,t,r,o){let d=t.validate(r);if(!d.valid&&!l.opts.noVerification)throw new u(d);this.doc=d.valid?d.res:r,this.schema=t,this.saved=!1,this.oldId="",this.methods=o,this.collection=w(e)}async save(){if(!l.opts.noIdDetection&&this.saved&&this.oldId==this.doc._id){let{_id:t,...r}=this.doc;this.doc=r,console.warn(`The _id ${t} has already been saved once, overriding it with a new id!`)}let e=await(await this.collection).insertOne(this.doc);if(!e.insertedId)throw Error("Not inserted");if(!l.opts.noDocsUpdate){let t=await(await this.collection).findOne({_id:e.insertedId});if(!t)throw Error("Weird");this.doc=t}return this.saved=!0,this.oldId=e.insertedId,this.doc}static async find(e){return await(await this.collection).find(e).toArray()}static async findOne(e){return await(await this.collection).findOne(e)}static async findOneAndDelete(e){let t=await(await this.collection).findOneAndDelete(e);if(!t.ok)throw new Error("findOneAndDelete returned not OK");return t.value}static async findOneAndReplace(e,t){let r=this.schema.validate(t);if(!r.valid)throw new u(r);t=r.res;let o=await(await this.collection).findOneAndReplace(e,t);if(!o.ok)throw new Error("findOneAndReplace returned not OK");return o.value}static async findOneAndUpdate(e,t){let r=this.schema.validate(t,{ignoreDefault:!0,ignoreRequired:!0});if(!r.valid)throw new u(r);let o=await(await this.collection).findOneAndUpdate(e,{$set:t});if(!o.ok)throw new Error("findOneAndUpdate returned not OK");return o.value}static async deleteMany(e){await(await this.collection).deleteMany(e)}};function O(s,e,t){class r extends h{constructor(d={}){super(s,e,d,t)}}return r.collection=w(s),r.schema=e,r.methods=t,r}export{g as MongoSteel,f as Schema,O as model,y as toUrl};
