'use strict';
var tmpl = require('./templates/customer.hbs'),
    api = require('../api'),
    _ = require('underscore');

var CustomerFields = new Enum(['name', 'email']);

var CustomerView = module.exports = function CustomerView(data) {
    this.model = data;

    this.element = $('<div />').on('click', '.button.reset', _.bind(function (ev) {
        ev.preventDefault();
        this.render();
    }, this));

    this.render();

    var elem = this.element;

    var model = Bacon.Model({});
    CustomerFields.getValues().forEach(function(field) {
        var fieldName = field.getName();
        var input = Bacon.$.textFieldValue(elem.find('input[name=' + fieldName + ']'));

        model.lens(fieldName).bind(input);

        if (fieldName === 'name') {
            input.assign(elem.find('h1.customer-name'), 'text');
        }
    });

    var save = Bacon.fromEventTarget(this.element.find('button[type="submit"]'), "click")
        .doAction(".preventDefault");

    var request = Bacon.combineTemplate({customer: model});

    var submits = request.sampledBy(save)
        .flatMapLatest(function (req) {
            return Bacon.fromPromise(api.persistCustomer(req));
        });

    submits.onValue(_.bind(function (res) {
        $('.dummy-api').append('<p>API Response <pre>' + JSON.stringify(res) + '</pre></p>');
    }, this));

    submits.onError(function (err) {
        console.error('Failed to persist customer');
    });
};

CustomerView.prototype.render = function () {
    this.element.html(tmpl(this.model));
};

