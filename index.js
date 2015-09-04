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

            /*
            plugins: {
                pluginToRequire: true, // inyecta este plugin en todos los eschemes
                pluginToRequire2: {/*plugin options* /},   // inyecta este plugin en todos los eschemes con esas opciones
                doWhatEverYouWantWithTheSchema: function(schema){

                }   // inyeccion manual del plugin
            },

            schemasLocation: "/api/schemas/",

            /* Listado de conextiones a crear, si solo existe "default" se puede omitir
             connection: {
                 uri: "ds039351.mongolab.com",
                 options: {
                     database: "jhipster",
                     port: 39351,
                     user: 'jhipster',
                     pass: 'jhipster'
                 },
                 wrap: false, // hace los schemas globales
                 schemasLocation: "/api/schemas/" + connectionName
                 plugins: {
                    pluginToRequire: false // evita que 'pluginToRequire' se inyecte
                 } // hace un merge con la opcion "plugins" de arriba
             }
            * /
            connections: {
                default: {
                    ... es connection, ver arriba
                },
                certtwit: {
                    uri: "ds043158.mongolab.com",
                    wrap: "mongo", // hace los schemas disponibles bajo "mongo", por defecto el nombre de la conexion
                    options: {
                        ...
                    }
                }
            }
            */
        }
    };

    var configure = function() {
        var config = sails.config[this.configKey];

        // Normalize configuration
        if(config.connection) {
            config.connections.default = config.connection;
        }

        if(config.connections.default.wrap === undefined) {
            config.connections.default.wrap = false;
        }

        // plugin array to object
        if(_.isArray(config.plugins)) {
            var plugins =  {};
            _.forEach(config.plugins, function(val){plugins[val] = true});
            config.plugins = plugins;
        }

        _.forIn(config.connections, function(connection, connectionName) {

            // plugin array to object
            if(_.isArray(connection.plugins)) {
                var connectionPlugins =  {};
                _.forEach(connection.plugins, function(val){connectionPlugins[val] = true});
                connection.plugins = connectionPlugins;
            }

            // extend plugin information
            var plugins = {};
            _.assign(plugins, config.plugins, connection.plugins);
            connection.plugins = plugins;

            // schema location
            var folderName = '/' + connectionName;
            if(connectionName === 'default') folderName = "";

            connection.schemasLocation = connection.schemasLocation ? connection.schemasLocation : config.schemasLocation + folderName;

        });



        if(sails.config.Mixed)
            global.Mixed = mongoose.Schema.Types.Mixed;
        if(sails.config.ObjectId)
            global.ObjectId = mongoose.Schema.Types.ObjectId;
        if(sails.config.mongoose)
            global.mongoose = mongoose;
    };


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
