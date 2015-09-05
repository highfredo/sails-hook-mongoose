# Sails hook mongoose
Version 0.0.1

## Getting started
`npm install sails-hook-mongoose`

## Usage
### Configuration
```javascript
module.exports.globals = {
    mongoose: true,  // Expose mongoose as a global variable
    ObjectId: true,  // Expose ObjectId as a global variable
    Mixed: true      // Expose Mixed as a global variable
};

module.exports.mongoose = {
    plugins: { ... }, // plugins for all your schemas in all connections (optional)

    schemasLocation: "./api/schemas", // base schemas location path

    connection: { ... }, // alias for connections.default

    connections: {
        default: { ... },     // Default connection. Schemas will be exposed as a global variable by default.
        connection2: { ...  } // You can configure others connections
    }
};


connections.foo_connection = {
    uri: "localhost",
    options: {
        database: "dbname",
        port: 12345,
        user: 'user',
        pass: 'pass',
        ...
        [ other mongoose options ]
    },
    wrap: false, // Wrap schemas, optional.
                 // false for the default connection.
                 // Others connections use the connection name (in this example: 'foo_connection')
                 // Multiple connections could have this value to false, but be careful with name collisions
    schemasLocation: "./api/schemas/foo" // optional, defaults to mongoose.schemasLocation + connection_name
    plugins: { ... }
}

// Plugin parameter could be a string array or a object
// Scheme plugins override connection plugins, connection plugins override general plugins
plugins = ['mongoose_plugin_to_require', 'mongoose_plugin_to_require_2']; // load all plugins with no params

plugins = {
    'mongoose_plugin_to_require': true, // load 'mongoose_plugin_to_require' with no params

    'mongoose_plugin_to_require_2': {...}, // load the plugin with the given params

    'do_what_ever_you_want': function(schema) { // Do what ever you want with the schema
        ...
    }
};
```

### Schemas definitions
```
module.exports = {
    attributes: { // Mongoose schema
        ...
    },

    statics: {  // Scheme statics
        ...
    },

    methods: {  // Scheme methods
        ...
    },

    plugins: {
        ...
    }
}
```

### Examples
https://github.com/highfredo/sails-hook-mongoose/tree/master/examples



----------
#### TODO:
- add examples.
- add test.
- clean up the code.
- improve readme.
