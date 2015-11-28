'use strict';

var utils = require('../services/utilsService');
var categoriesService = require('../services/categoriesService');

module.exports = function(app, url) {

    app.get('/api/categories/:id', utils.ensureAuth, function(req, res) {
        var category = categoriesService.getById(req.params.id,
            function(category) {
                res.json(category);
            },
            function(error, status) {
                utils.sendError(res, error, status);
            }
        );
    })

    app.get('/api/categories', utils.ensureAuth, function(req, res) {
        var url_parts = url.parse(req.url, true);
        var query = url_parts.query;

        categoriesService.get(
            utils.getUserId(req),
            query,
            function(categories) {
                res.json(categories);
            },
            function(error, status) {
                utils.sendError(res, error, status);
            }
        );
    })

    app.post('/api/categories', utils.ensureAuth, function(req, res) {
        categoriesService.create(
            utils.getUserId(req),
            req.body,
            function(categories) {
                res.json('OK');
            },
            function(error, status) {
                utils.sendError(res, error, status);
            }
        );
    })

    app.delete('/api/categories/:id', utils.ensureAuth, function(req, res) {
        categoriesService.delete( { _id : req.params.id },
            function() {
                res.json('OK');
            },
            function(error, status) {
                utils.sendError(res, error, status);
            }
        );
    })

    app.patch('/api/categories/:id', utils.ensureAuth, function(req, res) {
        categoriesService.edit(req.params.id, req.body,
            function(categories) {
                res.json('OK');
            },
            function(error, status) {
                utils.sendError(res, error, status);
            }
        );
    })

}