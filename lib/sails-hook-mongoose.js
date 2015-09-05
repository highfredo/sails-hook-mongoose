/**
 * Created by highfredo on 04/09/2015.
 */

var mongoose = require('mongoose'),
    glob = require("glob"),
    path = require('path'),
    _ = require('lodash');



module.exports = {

    createConnection: function(name, params) {
        return new Promise(function(resolve, reject) {
            var conn;
            // console.log(name, params);

            if(name === "default") {
                mongoose.connect(params.uri, params.options.database, params.options.port, params.options);
                conn = mongoose.connection;
            } else {
                conn = mongoose.createConnection(params.uri, params.options.database, params.options.port, params.options);
            }

            conn.on('error', function () {
                console.log('ERROR conectandose a mongoDB !', err);
                reject('NOOOOO Mongoose connection error:')
            });

            conn.once('open', function () {
                console.log('Connected to MongoDB !');
                resolve(createModels(conn, params));
            });
        });
    }

};




/**
 * Let's make our Mongodb Schemas/Models
 */

function createModels(conn, params) {
    var models = {};

    return new Promise(function(resolve, reject){
        glob(params.schemasLocation + "/*.js", {}, function (err, files) {
            if(err) {
                reject(err);
                return;
            }

            _.forEach(files, function(file) {
                var schema_description = require(process.cwd() + '/' + file);
                var schema = createSchema(schema_description, params);
                var model_name = path.basename(file, '.js');
                models[model_name] = conn.model(model_name, schema);
            });

            // console.log("Model created: " + basename);
            resolve(models);
        });
    });
}

function createSchema(schema_description, params) {
    var schema = new mongoose.Schema(schema_description.attributes);

    if (schema_description.methods)
        schema.methods = schema_description.methods;

    if (schema_description.statics)
        schema.statics = schema_description.statics;


    // extend plugin information
    var plugins = _.assign({}, params.plugins, schema_description.plugins);

    _.forIn(plugins, function(conf, pluginName) {
        if(_.isFunction(conf)) {
            conf(schema);
            return;
        }

        if(conf === true) {
            conf = {};
        }
        schema.plugin(require(pluginName), conf);
    });

    return schema;
}

