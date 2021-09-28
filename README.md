# MongoSteel

<p align="center">
    <img src="./icon.svg" width="30%" align="center">
</p>

MongoSteel is a *solid* [MongoDB](https://www.mongodb.org/) object modeling tool, designed to work in a typescript asynchronous environment. MongoSteel does not support callbacks. MongoSteel now supports ESM imports!

[![npm](https://nodei.co/npm/mongosteel.png)](https://www.npmjs.com/package/mongosteel)

## Why was this made?
Honestly, I just got frustrated with [mongoose](https://github.com/Automattic/mongoose) due to [this issue](https://github.com/Automattic/mongoose/issues/10349) (though as of now it appears to be a lot better), along with how it mixed everything together. Other options such as [mongolass](https://github.com/mongolass/mongolass) had cool plugin APIs and nice systems, but they didn't work with me very well due to their absence of typescript support. 

So, I decided to throw my own hat into the ring, and made this. As of now, it doesn't have much plugin support, but it has a nice strict way of doing things, and is a very small module, with no dependencies, besides the mongoDB driver.

## Documentation

For official Documentation go to [here](https://mongosteel.shadygoat.eu/)

## Support

You can get support on [github's discussions](https://github.com/ShadiestGoat/mongosteel/discussions/categories/q-a)

## Limitations

1. A schema cannot have a property named 'type' and 'required' (both at once, ie. {type: "string"} is ok, but {type: "string", required: "boolean"} isn't) as those are currently used to identify schema options
2. No plugins (though there are methods, which aren't fully tested and be slightly broken)
3. Not all methods are implemented (due to some being superior, case and point: `findOneAndDelete` > `deleteOne`), and lack of a need)

## Contributions

Pull requests are always welcome :)

If you want to add documentation, 

[Current contributors](https://github.com/ShadiestGoat/mongosteel/graphs/contributors)

## Acknowledgments

Some of the code & explanations present in this repository has been moddeled after [mongoose](https://github.com/Automattic/mongoose)

