#!/usr/bin/env node

var program = require('commander');
var mkdirp = require('mkdirp');
var os = require('os');
var fs = require('fs');
var path = require('path');
var inflection = require('../templates/js/lib/inflection');

var pkg = require('../package.json');
var version = pkg.version;

function list(val) {
    return val.split(' ').map(String);
}

// CLI

program
        .version(version)
        .usage('[options] [dir]')
        .option('-i, --init <appname>', 'create caminte application')
        .option('-g, --generate <modelname]', 'generate data model')
        .option('-s, --server', 'runs caminte server')
        .option('-a, --adapter', 'database adapter (mysql|redis|etc...)')
        .option('-j, --jade', 'add jade engine support (defaults to ejs)')
        .option('-H, --hogan', 'add hogan.js engine support')
        .option('-c, --css <engine>', 'add css <engine> support (less|stylus|compass) (defaults to plain css)')
        .option('-f, --force', 'force on non-empty directory')
        .parse(process.argv);

// Path

var destination_path = './';

// end-of-line code

var eol = os.EOL;

// Template engine

program.template = 'ejs';

if (program.jade) {
    program.template = 'jade';
}
if (program.hogan) {
    program.template = 'hjs';
}

if(!program.adapter) {
    program.adapter = 'mysql';
}

if (!program.init && !program.generate && !program.server) {
    program.help();
} else if (program.init) {
    destination_path += program.init;
    createApplication(destination_path);
} else if (program.generate) {
    program.generate = program.generate.toLowerCase().singularize();
    destination_path += 'models';
    createModel(destination_path);
} else if (program.server) {
    destination_path += 'bin/www';
    if (fs.existsSync(destination_path)) {
        require(path.resolve(destination_path));
    } else {
        abort('caminte application ' + destination_path + ' file not found!');
    }
}

function load_template(name) {
    return fs.readFileSync(path.join(__dirname, '..', 'templates', name), 'utf-8');
}

var index = load_template('js/routes/index.js');
var rest = load_template('js/routes/rest.js');

// css
var css = fs.readFileSync(__dirname + '/../templates/css/style.css', 'utf-8');
var less = fs.readFileSync(__dirname + '/../templates/css/style.less', 'utf-8');
var stylus = fs.readFileSync(__dirname + '/../templates/css/style.styl', 'utf-8');
var compass = fs.readFileSync(__dirname + '/../templates/css/style.scss', 'utf-8');

var app = fs.readFileSync(__dirname + '/../templates/js/app.js', 'utf-8');
var www = fs.readFileSync(__dirname + '/../templates/js/www', 'utf-8');
var cfg = fs.readFileSync(__dirname + '/../templates/js/config.js', 'utf-8');

var inflect = fs.readFileSync(__dirname + '/../templates/js/lib/inflection.js', 'utf-8');
var tools = fs.readFileSync(__dirname + '/../templates/js/lib/tools.js', 'utf-8');
var xml = fs.readFileSync(__dirname + '/../templates/js/lib/xml.js', 'utf-8');

// Generate application
function createApplication(path) {
    emptyDirectory(path, function(empty) {
        if (empty || program.force) {
            createApplicationAt(path);
        } else {
            program.confirm('destination is not empty, continue? ', function(ok) {
                if (ok) {
                    process.stdin.destroy();
                    createApplicationAt(path);
                } else {
                    abort('aborting');
                }
            });
        }
    });
}

// Generate Model
function createModel(root) {
    var modelName = program.generate.toLowerCase().capitalize();
    var pathToModel = path.resolve(root + '/' + modelName + '.js');
    existsFile(pathToModel, function(empty) {
        if (!empty || program.force) {
            createModelAt(root, modelName);
        } else {
            program.confirm('model is exists, continue? ', function(ok) {
                if (ok) {
                    process.stdin.destroy();
                    createModelAt(root, modelName);
                } else {
                    abort('aborting');
                }
            });
        }
    });
}

/**
 * Create model at the given `name`.
 *
 * @param {String} pathToModels
 * @param {String} modelName
 */
function createModelAt(pathToModels, modelName) {
    var modelFile = path.normalize(pathToModels + '/' + modelName + '.js');
    var modelTemplate = fs.readFileSync(__dirname + '/../templates/model/Model.ejs', 'utf-8');
    // mkdir(path + '/models');
    var fields = parseFields();
    modelTemplate = modelTemplate.replace('{fields}', fields.join(',\n'));
    modelTemplate = modelTemplate.replace(/{name}/gi, modelName);
    modelTemplate = modelTemplate.replace('{nameToLowerCase}', modelName.toLowerCase());
    write(modelFile, modelTemplate);
}

// parse Fields
function parseFields() {
    var fields = [];
    for (var i in process.argv) {
        // Skip the first two - Node and app.js path
        if (i > 3) {
            var fdata = process.argv[i].split(':');
            var field = '';
            if (fdata[1]) {
                var type = 'type : String';
                switch (type) {
                    case 'int':
                    case 'integer':
                    case 'double':
                    case 'number':
                        type = 'type : Number';
                        break;
                    case 'bool':
                    case 'boolean':
                        type = 'type : Boolean';
                        break;
                    case 'str':
                    case 'string':
                        type = 'type : String';
                        break;
                    case 'text':
                        type = 'type : schema.Text';
                        break;
                    case 'json':
                        type = 'type : schema.JSON';
                        break;
                    default:
                        type = 'type : String';
                }
                field += type;
            } else {
                field += 'type : String';
            }
            if (fdata[2]) {
                field += ", 'default' : " + fdata[2];
            }
            fields.push('           ' + fdata[0] + ' : { ' + field + ' }');
        }
    }
    return fields;
}

/**
 * Create application at the given directory `path`.
 *
 * @param {String} path
 */
function createApplicationAt(path) {
    console.log();
    process.on('exit', function() {
        console.log();
        console.log('   install dependencies:');
        console.log('     $ cd %s && npm install', path);
        console.log();
        console.log('   run the app:');
        console.log('     $ caminte -s');
        console.log();
        console.log('   or:');
        console.log('     $ DEBUG=' + program.init + ' ./bin/www');
        console.log();
    });

    mkdir(path, function() {
        mkdir(path + '/models');
        mkdir(path + '/public');
        mkdir(path + '/public/js');
        mkdir(path + '/public/img');
        mkdir(path + '/public/css', function() {
            switch (program.css) {
                case 'less':
                    write(path + '/public/css/style.less', less);
                    break;
                case 'stylus':
                    write(path + '/public/css/style.styl', stylus);
                    break;
                case 'compass':
                    write(path + '/public/css/style.scss', compass);
                    break;
                default:
                    write(path + '/public/css/style.css', css);
            }
        });

        mkdir(path + '/routes', function() {
            write(path + '/routes/index.js', index);
            write(path + '/routes/rest.js', rest);
        });

        mkdir(path + '/lib', function() {
            write(path + '/lib/inflection.js', inflect);
            write(path + '/lib/tools.js', tools);
            write(path + '/lib/xml.js', xml);
        });

        mkdir(path + '/views', function() {
            switch (program.template) {
                case 'ejs':
                    copy_template('ejs/index.ejs', path + '/views/index.ejs');
                    copy_template('ejs/error.ejs', path + '/views/error.ejs');
                    break;
                case 'jade':
                    copy_template('jade/index.jade', path + '/views/index.jade');
                    copy_template('jade/layout.jade', path + '/views/layout.jade');
                    copy_template('jade/error.jade', path + '/views/error.jade');
                    break;
                case 'hjs':
                    copy_template('hogan/index.hjs', path + '/views/index.hjs');
                    copy_template('hogan/error.hjs', path + '/views/error.hjs');
                    break;
            }
        });

        // CSS Engine support
        switch (program.css) {
            case 'less':
                app = app.replace('{css}', eol + 'app.use(require(\'less-middleware\')({ src: path.join(__dirname, \'public\') }));');
                break;
            case 'stylus':
                app = app.replace('{css}', eol + 'app.use(require(\'stylus\').middleware(path.join(__dirname, \'public\')));');
                break;
            case 'compass':
                app = app.replace('{css}', eol + 'app.use(require(\'node-compass\')({mode: \'expanded\'}));');
                break;
            default:
                app = app.replace('{css}', '');
        }

        // Template support
        app = app.replace('{views}', program.template);

        // package.json
        var pkg = {
            name: program.init
            , version: '0.0.1'
            , private: true
            , scripts: {start: 'node ./bin/www'}
            , dependencies: {
                'caminte': '>=0.0.21',
                'express': '>=4.0.0',
                'static-favicon': '>=1.0.0',
                'morgan': '>=1.2.0',
                'cookie-parser': '>=1.3.0',
                'body-parser': '>=1.6.0',
                'method-override': '>=2.1.3',
                'connect-multiparty': '>=1.0.0',
                'debug': '>=0.7.4'
            }
        };
        
        pkg.dependencies[program.adapter] = '*';
        
        switch (program.template) {
            case 'jade':
                pkg.dependencies['jade'] = '~1.3.0';
                break;
            case 'ejs':
                pkg.dependencies['ejs'] = '~1.0.0';
                break;
            case 'hjs':
                pkg.dependencies['hjs'] = '~0.0.6';
                break;
            default:
        }

        // CSS Engine support
        switch (program.css) {
            case 'less':
                pkg.dependencies['less-middleware'] = '0.1.15';
                break;
            case 'compass':
                pkg.dependencies['node-compass'] = '0.2.3';
                break;
            case 'stylus':
                pkg.dependencies['stylus'] = '0.42.3';
                break;
            default:
        }

        write(path + '/package.json', JSON.stringify(pkg, null, 2));
        write(path + '/app.js', app);
        mkdir(path + '/bin', function() {
            www = www.replace('{app}', program.init);
            write(path + '/bin/www', www, 0755);
        });
        mkdir(path + '/uploads');
        mkdir(path + '/config', function() {
            var dbPort = 3306, dbBase = 'test';
            switch(program.adapter) {
                case 'redis':
                    dbPort = 6379;
                    break;
                case 'nano':
                case 'couchdb':
                    dbPort = 5984;
                    break;
                case 'postgres':
                    dbPort = 5432;
                    break;
                case 'rethinkdb':
                    dbPort = 28015;
                    break;
                case 'mongo':
                case 'mongodb':
                case 'mongoose':
                    dbPort = 27017;
                    break;
                case 'tingodb':
                    dbPort = 0;
                    dbBase = './dbt/test';
                    mkdir(path + '/dbt');
                    break;
                case 'sqlite3':
                    dbPort = 0;
                    dbBase = './dbs/test.sqlite';
                    mkdir(path + '/dbs');
                    break;
            }
            cfg = cfg.replace('{driver}', program.adapter);
            cfg = cfg.replace('{port}', dbPort);
            cfg = cfg.replace('{database}', dbBase);
            
            write(path + '/config/index.js', cfg, 0755);
        });
    });
}

function copy_template(from, to) {
    from = path.join(__dirname, '..', 'templates', from);
    write(to, fs.readFileSync(from, 'utf-8'));
}

/**
 * Check if the given directory `path` is empty.
 *
 * @param {String} path
 * @param {Function} fn
 */
function emptyDirectory(path, fn) {
    fs.readdir(path, function(err, files) {
        if (err && 'ENOENT' !== err.code)
            throw err;
        fn(!files || !files.length);
    });
}

/**
 * Check if the given file `path` exists.
 *
 * @param {String} path
 * @param {Function} fn
 */
function existsFile(path, fn) {
    fs.exists(path, function(exists) {
        fn(exists);
    });
}

/**
 * echo str > path.
 *
 * @param {String} path
 * @param {String} str
 * @param {Number} mode
 */
function write(path, str, mode) {
    fs.writeFile(path, str, {mode: mode || 0666});
    console.log('   \x1b[36mcreate\x1b[0m : ' + path);
}

/**
 * Mkdir -p.
 *
 * @param {String} path
 * @param {Function} fn
 */
function mkdir(path, fn) {
    mkdirp(path, 0755, function(err) {
        if (err)
            throw err;
        console.log('   \033[36mcreate\033[0m : ' + path);
        fn && fn();
    });
}

/**
 * Exit with the given `str`.
 *
 * @param {String} str
 */
function abort(str) {
    console.error(str);
    process.exit(1);
}
