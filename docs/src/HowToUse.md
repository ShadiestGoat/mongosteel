# Quick Start

First, install mongosteel: `npm install mongosteel`

First off, lets grab the example from mongoose:
> say we like fuzzy kittens and want to record every kitten we ever meet in MongoDB

Now, lets define a type for our collection:

```ts
type kitten = {
    name: string,
    type: {
        furColor: string[],
        breed: string        
    }
}
```

We want this type in a collection, so first off, lets connect to a database!

```ts
import { MongoSteel } from "mongosteel"

async function main() {
    // either use the following:
    await MongoSteel.connect({ 
        dbName: "kittenDB", 
        user: "AdminUser", 
        password: "KittenPasswordHere", 
        location: "127.0.0.1:27017"
    }, { }, { })
    // or
    await MongoSteel.connect("mongodb://AdminUser:KittenPasswordHere@127.0.0.1:27017/kittenDB", 
    { }, { })
}

main().catch(err => console.error(err));
```

For everything else, lets assume you already have the type `kitten` defined, and all the further code is happening within the `main()` function.

In MongoSteel everything is basically based of the `Model`, which requires a `Schema`.

```ts
// inside main(), with Schema imported from mongosteel
const kittySH = new Schema<kitten>({ // using generics here will help with typings
    name:"string", // shorthand for { required:true, type: "string" }
    type: {
        required: true,
        type: {
            breed: {
				type: "string",
				required: false,
				default: "none"
			},
            furColor: ["string"]
        }
    }
})
```

Once we have a schema we can get a Model class:

```ts
// kittySH definition here

const kittyModel = model('collectionName', kittySH)

```

this makes it so that `kittyModel` is a class, that you can later use. I usually have a separate file for each model/schema definition, so I usually export it

```ts
// index.ts
import { MongoSteel } from "mongosteel"

async main() {
	await MongoSteel.connect("mongodb://AdminUser:KittenPasswordHere@127.0.0.1:27017/kittenDB")
	
	//...your code here
}
							 
// models/kitty.ts
import { Schema, model } from "mongosteel"
							 
export type kitten = {
    name: string,
    type: {
        furColor: string[],
        breed: string        
    }
}
export const kittySH = new Schema<kitten>({
    name:"string",
    type: {
        required: true,
        type: {
            breed: {
				type: "string",
				required: false,
				default: "none"
			},
            furColor: ["string"]
        }
    }
}) 

export const kittyModel = model('kittyCollection', kittySH)
```

With this, lets save the cutest kitten to our database, named Nora. 

```ts
import { kittyModel } from "./models/kitty"

async main() {
	//connect blah blah blah
	
	const noraCat = new kittyModel({
		name: "Nora",
		type: {
			furColor: ["brown", "grey", "dark brown"]
		}		
	})
	console.log(noraCat.doc.name) // "Nora"
	console.log(noraCat.doc.type.breed) // "none" (gotten from default)
	
	await noraCat.save() //this saves the document to the database
}

main.catch(err => console.errror(err))
```

Now lets check to make sure that we actually saved this cutty patuty to our database

```ts

//assume same setup as above, the following is within main() after connection definition

await kittyModel.find({name: "Nora"}) // [{name: "Nora", type: {breed: "none", furColor: ["brown", "grey", "dark brown"]}}]
```
Great ^^

Unfortunately, as of current patch (1.0.0), the actual query syntax from mongodb are not fully supported yet. 

You can also add methods to your model through schema:

```ts
// same type & schema setup

type kittenMethods = {
    whatHappensAt3AM: (this:Model<kitten, kittenMethods>) => string // as of current patch you need to define 'this' yourself, and there isn't type checking for this, though in the future this may be fixed
}

export const kittyModel = model<kitten, kittenMethods>('kittyCollection', kittySH, {
    whatHappensAt3AM: function () {
        return `MEOOOWWWWW MEOWWW * further agressive meowing * FEED MEEEE!!! I ${this.doc.name} DECLARE THAT THIS IS PURE TORTURE! I HAVE NEVER IN MY LIFE BEEN FED BEFORE!`
    }
})
```

Note the use `function () {}` rather than an arrow function. Arrow functions do not work right in regards to this system.
