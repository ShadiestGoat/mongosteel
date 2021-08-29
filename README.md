# MongoSteel

MongoSteel is a *solid* [MongoDB](https://www.mongodb.org/) object modeling tool, designed to work in a typescript asynchronous environment. MongoSteel does not support callbacks.

[![NPM version](https://badge.fury.io/js/mongosteel.svg)](http://badge.fury.io/js/mongosteel)

[![npm](https://nodei.co/npm/mongosteel.png)](https://www.npmjs.com/package/mongosteel)

## Why was this made?
Honestly, I just got frustrated with [mongoose](https://github.com/Automattic/mongoose) due to [this issue](https://github.com/Automattic/mongoose/issues/10349), along with how it mixed everything together. Other options such as [mongolass](https://github.com/mongolass/mongolass) had cool plugin APIs and nice systems, but they didn't work with me very well due to their absence of typescript support. 

So, I decided to throw my own hat into the ring, and made this. As of now, it doesn't have much plugin support, but it has a nice strict way of doing things, and is a very small module, with no dependencies, besides the mongoDB driver.

## Documentation

For official Documentation go to [here](https://mongosteel.shadygoat.eu/docs)

## Support

You can get support on [github's discussions](https://github.com/ShadiestGoat/mongosteel/discussions/categories/q-a)

## Limitations

 1. A schema cannot have a property named 'type' and 'required' as those are currently used to identify schema options
 2. No plugins (though the collection property is exposed, so you can do what you want with that one ;))
 3. Not all methods are implemented (due to some being superior, case and point: `findOneAndDelete` > `deleteOne`), but again the collection property is exposed, you can still call those methods from the mongodb driver

## Contributions

Pull requests are always welcome :)

If you want to add documentation, 

[Current contributors](https://github.com/ShadiestGoat/mongosteel/graphs/contributors)
