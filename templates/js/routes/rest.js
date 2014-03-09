/**
 *  Rest Routes
 *
 *  Created by create model script
 *  App based on CaminteJS
 *  CaminteJS homepage http://www.camintejs.com
 **/

var Tools = require('../lib/tools.js');
var inflection = require('../lib/inflection.js');

module.exports = {
    /**
     * Index action, returns a list either
     * Default mapping to GET '/users'
     * For JSON use '/users.json'
     * 
     * @param {Object} req
     * @param {Object} res
     * @param {Function} next
     **/
    'index': function(req, res, next) {
        var Model = req.model;
        var sort = req.query.sort || req.body.sort;
        var search = req.query.search || req.body.search;
        var query = req.method === 'POST' ? req.body : req.query;
        var from = req.params.from ? parseInt(req.params.from) - 1 : 0;
        var to = req.params.to ? parseInt(req.params.to) : 20;
        var total = 0;
        var opts = {
            skip: from,
            limit: to,
            order: 'id DESC',
            where: {}
        };

        if (sort && sort !== '') {
            var direction = 'ASC';
            if (sort.substr(0, 1) === '-') {
                direction = 'DESC';
                sort = sort.substr(1, sort.length);
            }
            opts.order = sort + " " + direction;
        }

        if (search && search !== "") {
            search = search.toString().replace(/^\s|\s$/, "");
            opts.where.name = {
                regex: search
            };
        }

        Tools.validateFields(Model, query, {}, function(err, filtered) {
            for (var field in filtered) {
                opts.where[field] = filtered[field];
            }
            Model.count(opts.where, function(err, count) {
                total = count;
                Model.all(opts, function(err, users) {
                    if (err) {
                        return next(err);
                    }
                    var out = {
                        first_page: 1,
                        curent_page: from / to + 1,
                        total_pages: Math.ceil(total / to) + 1,
                        items_per_page: to,
                        items_total: total,
                        items_start: from,
                        items_end: from + to
                    };

                    switch (req.format.toString()) {
                        case 'xml':
                            out.items = users.map(function(u) {
                                return {item: u.toObject()};
                            });
                            res.xml({root: out});
                            break;
                        default:
                            out.items = users.map(function(u) {
                                return u.toObject();
                            });
                            res.json(out);
                    }
                });
            });
        });
    },
    /**
     * Show action, returns shows a single item
     * Default mapping to GET '/user/:id'
     * For JSON use '/user/:id.json'
     * 
     * @param {Object} req
     * @param {Object} res
     * @param {Function} next
     **/
    'show': function(req, res, next) {
        var Model = req.model;
        Model.findById(req.params.id, function(err, item) {
            if (err) {
                return next(err);
            }
            if (item) {
                Tools.validateFields(Model, req.body, {
                    validate: true
                }, function(err, filtered) {
                    if (err && err.length) {
                        res[req.format.toString()](400, {
                            error: err
                        });
                    } else {
                        switch (req.format.toString()) {
                            case 'xml':
                                res.xml({root: {item: item.toObject()}});
                                break;
                            default:
                                res.json(item.toObject());
                        }
                    }
                });
            } else {
                res[req.format.toString()](404, {error: 'Not Found.'});
            }
        });
    },
    /**
     * Update action, updates a single item
     * Default mapping to PUT '/user/:id', no GET mapping
     * 
     * @param {Object} req
     * @param {Object} res
     * @param {Function} next
     **/
    'update': function(req, res, next) {
        var Model = req.model;
        Model.findById(req.params.id, function(err, item) {
            if (item) {
                Tools.validateFields(Model, req.body, {
                    validate: true
                }, function(err, filtered) {
                    if (err) {
                        res[req.format.toString()](400, {
                            error: err
                        });
                        return false;
                    }
                    item.updateAttributes(filtered, function(err) {
                        if (err) {
                            res[req.format.toString()](400, {
                                error: err
                            });
                            return false;
                        }
                        switch (req.format.toString()) {
                            case 'xml':
                                res.xml({root: {item: item.toObject()}});
                                break;
                            default:
                                res.json(item.toObject());
                        }
                    });
                });
            } else {
                res[req.format.toString()](404, {error: 'Not Found.'});
            }
        });
    },
    /**
     * Create action, creates a single item
     * Default mapping to POST '/users', no GET mapping
     * 
     * @param {Object} req
     * @param {Object} res
     * @param {Function} next
     **/
    'create': function(req, res, next) {
        var Model = req.model;
        Tools.validateFields(Model, req.body, {
            validate: true
        }, function(err, filtered) {
            if (err) {
                res[req.format.toString()](400, {
                    error: err
                });
                return false;
            }
            var item = new Model(filtered);

            item.save(function(err) {
                if (err) {
                    res[req.format.toString()](400, {
                        error: err
                    });
                    return false;
                }
                switch (req.format.toString()) {
                    case 'xml':
                        res.xml(201, {root: {item: item.toObject()}});
                        break;
                    default:
                        res.json(201, item.toObject());
                }
            });
        });
    },
    /**
     * Delete action, deletes a single item
     * Default mapping to DEL '/user/:id', no GET mapping
     * 
     * @param {Object} req
     * @param {Object} res
     * @param {Function} next
     **/
    'destroy': function(req, res, next) {
        var Model = req.model;
        Model.findById(req.params.id, function(err, item) {
            if (!item) {
                res[req.format.toString()](400, {error: 'Unable to locate the item to delete!'});
                return false;
            }
            item.destroy(function(err) {
                if (err) {
                    res[req.format.toString()](400, {error: 'There was an error deleting! ' + err.join(', \n')});
                } else {
                    res[req.format.toString()](204, {message: 'Item deleted!'});
                }
            });
        });
    },
    /**
     * Delete action, deletes a all items
     * Default mapping to DEL '/users', no GET mapping
     * 
     * @param {Object} req
     * @param {Object} res
     * @param {Function} next
     **/
    'destroyall': function(req, res, next) {
        var Model = req.model;
        Model.destroyAll(function(err) {
            if (err) {
                res[req.format.toString()]('There was an error deleting the users! ' + err.join(', \n'));
            } else {
                res[req.format.toString()]('Items deleted!');
            }
        });
    }
};