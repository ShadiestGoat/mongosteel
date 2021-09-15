"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.Schema=exports.MongoSteelValidityError=void 0;class MongoSteelValidityError extends Error{constructor(e){super("This document is not valid!"),Object.setPrototypeOf(this,MongoSteelValidityError.prototype),this.obj=e}}exports.MongoSteelValidityError=MongoSteelValidityError;class Schema{constructor(e){function r(e){if("string"==typeof e)return e||(e="string"),{type:e,required:!0};if(Array.isArray(e))return 2==e.length?{type:["string",r(e[1])],required:!0}:{type:[r(e[0])],required:!0};if("object"!=typeof e)throw new Error("Unrecognised schema type!");return Object.keys(e).includes("type")&&Object.keys(e).includes("required")?("object"==typeof e.type&&(e.type=r(e.type)),e):t(e)}function t(e){const t={};if(Array.isArray(e))throw new Error("Schema can't be an array!");if("object"!=typeof e)throw new Error("Unrecognised schema type!");return Object.keys(e).forEach((o=>{t[o]=r(e[o])})),t}this.schema=t(e)}validate(e,r={}){if("object"!=typeof e||Array.isArray(e))return{valid:!1,reason:"majorBadType"};function t(e,r,t){var o;switch(e.type){case"boolean":return"boolean"!=typeof r&&{valid:!1,reason:"badType",badKey:t};case"number":return"number"!=typeof r&&{valid:!1,reason:"badType",badKey:t};case"string":return("string"!=typeof r||!(!e.pattern||(null===(o=e.pattern)||void 0===o?void 0:o.test(r))))&&{valid:!1,reason:"badType",badKey:t};case"mixed":return!1;default:return console.warn(`Unknown type for ${t}! The schema says ${e.type}`),!1}}let o="";return function n(a,i){if(Object.keys(a).includes("type")&&Object.keys(a).includes("required")){const e=t(a,i,o);if(e)return e}else for(const s in a)if("object"!=typeof i||Array.isArray(i)||Object.keys(i).includes(s))if(Array.isArray(a[s].type)){if(2==a[s].type.length){if("object"!=typeof i[s]||Array.isArray(i[s]))return{valid:!1,reason:"badType",badKey:s};for(const e in i[s]){const r=n(a[s].type[1],i[s][e]);if(!r.valid)return r}}if(!Array.isArray(i[s]))return{valid:!1,reason:"badType",badKey:s};o=s,i[s].forEach((e=>{const r=n(a[s].type[0],e);if(!r.valid)return r}))}else if("object"==typeof a[s].type){const e=n(a[s].type,i[s]);if(!e.valid)return e}else{const e=t(a[s],i[s],s);if(e)return e}else{if(a[s].required&&!r.ignoreRequired)return{valid:!1,reason:"required",badKey:s};a[s].default&&!r.ignoreDefault&&("function"==typeof a[s].default?e[s]=a[s].default():e[s]=a[s].default)}return{valid:!0,res:e}}(this.schema,e)}}exports.Schema=Schema,exports.default=Schema;