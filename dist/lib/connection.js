"use strict";var __awaiter=this&&this.__awaiter||function(o,e,n,t){return new(n||(n=Promise))((function(r,i){function s(o){try{l(t.next(o))}catch(o){i(o)}}function c(o){try{l(t.throw(o))}catch(o){i(o)}}function l(o){var e;o.done?r(o.value):(e=o.value,e instanceof n?e:new n((function(o){o(e)}))).then(s,c)}l((t=t.apply(o,e||[])).next())}))};Object.defineProperty(exports,"__esModule",{value:!0}),exports.MongoSteel=exports.mongoSteelConnection=exports.toUrl=void 0;const mongodb_1=require("mongodb");function toUrl(o){return["dbName","location","password","user"].forEach((e=>{if(!Object.keys(o).includes(e))throw Error(`${e} is required in the options!`)})),o.dbOpts||(o.dbOpts={}),`mongodb://${encodeURI(o.user)}:${encodeURI(o.password)}@${encodeURI(o.location)}/${o.dbName}${0==Object.keys(o.dbOpts).length?"":"?"}${Object.keys(o.dbOpts).map(((e,n)=>{var t;return`${0==n?"":"&"}${encodeURI(`${e}=${(null!==(t=o.dbOpts)&&void 0!==t?t:{})[e]}`)}`})).join("")}`}exports.toUrl=toUrl,exports.mongoSteelConnection={on:!1,models:{},opts:{}};class MongoSteel{static connect(o,e,n){return __awaiter(this,void 0,void 0,(function*(){if(exports.mongoSteelConnection.on){if(o)throw new Error(`I already have a connection to ${exports.mongoSteelConnection.url}!`);return exports.mongoSteelConnection.db}if(!o)throw new Error("I have nothing to connect to!");const t="string"==typeof o?encodeURI(o):toUrl(o),r=yield mongodb_1.MongoClient.connect(t,Object.assign({useNewUrlParser:!0,useUnifiedTopology:!0},e)),i=r.db(),s=Object.assign({},n);return exports.mongoSteelConnection={on:!0,db:i,client:r,url:t,opts:s,models:exports.mongoSteelConnection.models},i}))}static disconnect(){var o;return __awaiter(this,void 0,void 0,(function*(){exports.mongoSteelConnection&&(yield null===(o=exports.mongoSteelConnection.client)||void 0===o?void 0:o.close(),exports.mongoSteelConnection={on:!1,client:void 0,db:void 0,url:void 0,models:exports.mongoSteelConnection.models,opts:exports.mongoSteelConnection.opts})}))}}exports.MongoSteel=MongoSteel;