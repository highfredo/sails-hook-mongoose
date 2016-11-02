"use strict";

/**
 * A hook to enable Mongoose in Sails.
 * Can be configured alongside or as a replacement for Waterline.js
 *
 * `mongo` will be exposed as a global variable unless sails.config.globals.mongoose is false.
 * All models loaded from the `schemas` directory will be exposed as global variables unless sails.config.globals.thinkymodels is false.
 *
 */

var mongooseHook = require('./lib/sails-hook-mongoose'),
    mongoose = require('mongoose'),
    _ = require('lodash');

module.exports = function (sails) {
    var defaults =  {
        globals: {
            mongoose: true,
            ObjectId: true,
            Mixed: true
        },
        __configKey__: {
            plugins: { },
            connections: { },
            schemasLocation: "./api/schemas"
        }
    };

    var configure = function() {
        var config = sails.config[this.configKey];

        // Normalize configuration
        if(config.connection) {
            config.connections.default = config.connection;
        }

        if(config.connections.default && config.connections.default.wrap === undefined) {
            config.connections.default.wrap = false;
        }

        // config plugins array to object
        arrayPluginToObject(config.plugins);

        _.forIn(config.connections, function(connection, connectionName) {

            // connection plugin array to object
            arrayPluginToObject(connection.plugins);

            // extend config and connection plugin information
            connection.plugins = _.assign({}, config.plugins, connection.plugins);

            // schema location
            var folderName = '/' + connectionName;
            if(connectionName === 'default') folderName = "";

            connection.schemasLocation = connection.schemasLocation ? connection.schemasLocation : config.schemasLocation + folderName;

        });



        if(sails.config.globals.Mixed)
            global.Mixed = mongoose.Schema.Types.Mixed;
        if(sails.config.globals.ObjectId)
            global.ObjectId = mongoose.Schema.Types.ObjectId;
        if(sails.config.globals.mongoose)
            global.mongoose = mongoose;

    };

    function arrayPluginToObject(plugins) {
        if(_.isArray(plugins)) {
            var tmp_plugins =  {};
            _.forEach(plugins, function(val){tmp_plugins[val] = true});
            plugins = tmp_plugins;
        }

        return plugins;
    }


    var initialize = function(cb) {
        var config = sails.config[this.configKey];

        var connPromises = [];
        _.forIn(config.connections, function(opts, key) {
            var name = opts.wrap || key;
            var promise = mongooseHook.createConnection(name, opts).then(function(models) {
                if(opts.wrap === false) {
                    _.forIn(models, function(model, modelName) {
                        global[modelName] = model;
                    });
                } else {
                    global[name] = models;
                }
            }, function(err) {
                console.log(err);
            });
            connPromises.push(promise);
        });

        Promise.all(connPromises).then(function() {
            console.log("Connections established");
            cb();
        });
    };




    return {
        defaults: defaults,
        configure: configure,
        initialize: initialize
    }
};
