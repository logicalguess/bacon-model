'use strict';
var tmpl = require('./templates/customer.hbs'),
    api = require('../api'),
    _ = require('underscore');

function createModel(elem, dataSpec) {
    var model = Bacon.Model({});
    dataSpec.getValues().forEach(function (field) {
        var fieldName = field.getName();
        if (field.from) {
            var selector = field.from.selector || field.from.elemType + '[name=' + fieldName + ']';
            var fieldStream = Bacon.$[field.from.bindingType + 'Value'](elem.find(selector));
            model.lens(fieldName).bind(fieldStream);
        }

        if (field.to) {
            field.to.forEach(function (listener) {
                var fld = listener.formatter ? fieldStream.map(listener.formatter) : fieldStream;
                fld.assign(elem.find(listener.selector), listener.attr);
            });
        }
    });
    return model;
}

function createEventStreams(elem, eventSpec) {
    var streams = {};
    eventSpec.getValues().forEach(function (event) {
        streams[event.getName()] = Bacon.fromEventTarget(elem.find(event.target.selector), event.target.eventType)
            .doAction(".preventDefault");
    });
    return streams;
}

var BindingTypes = new Enum(['textField', 'checkBox', 'select', 'radioGroup', 'checkBoxGroup']);
var CustomerDataSpec = new Enum({
    name: {
        from: {
            elemType: 'input',
            bindingType: BindingTypes.textField
        },
        to: [{
            selector: 'h1.customer-name',
            attr: 'text',
            formatter: function(value) {
                return value.toUpperCase();
            }
        }]
    },
    email: {
        from: {
            elemType: 'input',
            bindingType: BindingTypes.textField
        }
    }
});

var CustomerEventSpec = new Enum({
    save: {
        target: {
            selector: 'button[type="submit"]',
            eventType: 'click'
        }
    },
    reset: {
        target: {
            selector: '.button.reset',
            eventType: 'click'
        }
    }
});

var CustomerView = module.exports = function CustomerView(data) {
    this.model = data;
    this.element = $('<div />');

    this.render();

    var model = createModel(this.element, CustomerDataSpec);

    var eventStreams = createEventStreams(this.element, CustomerEventSpec);
    var save = eventStreams['save'];
    var reset = eventStreams['reset'];

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

    reset.onValue(_.bind(function (ev) {
        this.render();
    }, this));
};

CustomerView.prototype.render = function () {
    this.element.html(tmpl(this.model));
};

