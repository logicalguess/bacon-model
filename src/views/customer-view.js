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

    var name = Bacon.$.textFieldValue(this.element.find('input[name=' + CustomerFields.name.getName() + ']'));
    name.assign(this.element.find('h1.customer-name'), 'text');

    var email = Bacon.$.textFieldValue(this.element.find('input[name=' + CustomerFields.email.getName() + ']'));

    //var model = Bacon.Model.combine({name: name, email: email});
    var model = Bacon.Model({});
    model.lens(CustomerFields.name.getName()).bind(name);
    model.lens(CustomerFields.email.getName()).bind(email);

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

