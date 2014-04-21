/**
 *  Caminte Application
 *
 *  Created by create app script
 *  App based on CaminteJS
 *  CaminteJS homepage http://www.camintejs.com
 **/

var express = require('express');
var caminte = require('caminte');
var http = require('http');
var path = require('path');
var fs = require('fs');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multiparty = require('connect-multiparty');
var methodOverride = require('method-override');
var config = require('./config');
var inflection = require('./lib/inflection');
var Tools = require('./lib/tools');
var XML = require('./lib/xml');

var modelsDir = path.join(__dirname, 'models');
var app = express();
app.models = {};

/* Load models */
try {
    fs.readdir(modelsDir, function(err, files) {
        if (err) {
            console.log(err);
        }
        if (!files || files.length === 0) {
            if(config.debug) console.log("models files does not found");
            app.emit('models_loaded');
        } else {
            var count = files.length;
            if (count > 0) {
                var Schema = caminte.Schema;
                var schema = new Schema(config.db.driver, config.db);
                files.forEach(function(file) {
                    bootModel(app, schema, file);
                    if (--count === 0) {
                        if ('function' === typeof schema.autoupdate && config.autoupdate) {
                                schema.autoupdate(function(err) {
                                    if (config.debug) console.log('caminte autoupdate database!');
                                    if (err) {
                                        console.log(err);
                                    }
                                });
                        }
                        app.emit('models_loaded');
                        if (config.debug) console.log('caminte models loaded');
                    }
                });
            }
        }
    });
} catch (err) {
    console.log("Error: Models dir does not found");
    process.exit(1);
}

/* Load routes */
var routes = require('./routes');
var rest = require('./routes/rest.js');

app.on('models_loaded', function() {
    // view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', '{views}');

    app.use(favicon());
    app.use(logger('dev'));
    app.use(XMLResponse);
    app.use(bodyParser.json({reviver:true}));
    app.use(bodyParser.urlencoded());
    app.use(methodOverride()); 
    app.use(multiparty({
        uploadDir: config.parser.uploadDir,
        keepExtensions: config.parser.keepExtensions,
        encoding: config.parser.encoding
    }));
    app.use(cookieParser());{css}
    app.use(express.static(path.join(__dirname, 'public')));
    
    // routes
    app.get('/', routes.index);
    app.get('/:table.:format?', checkReqType, checkParams, rest.index);
    app.get('/:table/:id.:format?', checkReqType, checkParams, rest.show);
    app.post('/:table.:format?', checkReqType, checkParams, rest.create);
    app.put('/:table/:id.:format?', checkReqType, checkParams, rest.update);
    app.del('/:table/:id.:format?', checkReqType, checkParams, rest.destroy);
    app.del('/:table.:format?', checkReqType, checkParams, rest.destroyall);

    // catch 404 and forwarding to error handler
    app.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    // error handlers
    // development error handler
    // will print stacktrace
    if (app.get('env') === 'development') {
        app.use(function(err, req, res, next) {
            res[req.format || 'json'](err.code || 400, { error : err });
        });
    }

    // production error handler
    // no stacktraces leaked to user
    app.use(function(err, req, res, next) {
        res[req.format || 'json'](err.code || 400, { error : err.message });
    });
    app.emit('configured');
    if (config.debug) console.log('caminte application configured');
});

/**
 * Simplistic model support.
 *
 * @param {Object} app
 * @param {Object} schema
 * @param {String} file
 */
function bootModel(app, schema, file) {
    if (/\.js$/i.test(file)) {
        var name = file.replace(/\.js$/i, '');
        var modelDir = path.resolve(__dirname, 'models');
        app.models[name] = require(modelDir + '/' + name)(schema);// Include the mongoose file
    }
}

/**
 * Extend response to send xml.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
function XMLResponse(req, res, next) {    
    res.setHeader("X-Powered-By", "CaminteJS RestFul");
    res.xml = function(code, data, params) {
        if (typeof code === 'object') {
            params = data;
            data = code;
            code = 200;
        }
        var header = (params || {}).header ? params.header : "application/xml";
        res.setHeader("Content-Type", header);
        res.send(code, XML(data, {xmlHeader: {standalone: true}}));
    };
    next();
}

/**
 * checkResType.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
function checkReqType(req, res, next) {
    var format = req.params.format || 'json';
    req.format = Tools.reqType('xml', req.accepted)? 'xml' : format.toString();
    if(req.params.format) {
        req.format = format;
    }
    if (req.format === 'json' || req.format === 'xml') {
        next();
    } else {
        res.send(404, { error : 'unsupported format' });
    }
}

/**
 * checkParams.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
function checkParams(req, res, next) {
    var table = req.params.table;
    if (table) {
        table = table.toLowerCase().singularize().capitalize();
        if (req.app.models[table]) {
            req.table = table;
            req.model = req.app.models[table];
            next();
        } else {
            res[req.format](404, { error : 'collection ' + req.params.table + ' undefined' });
        }
    } else {
        res[req.format](404, { error : 'first specify the collection' });
    }
}

module.exports = app;
