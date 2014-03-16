Bacon.Model Form example
========================

![ ](screen.png)

Inspired by: [Bacon Form Example](https://github.com/nnarhinen/bacon-form-example)

Shows how to use an Enum ([https://github.com/timheap/enum](https://github.com/timheap/enum)) for model field names.

Also demonstrates how to use pre-compiled Handlebars templates with browserify.

Building
--------

 * `npm install`
 * `npm run watch`

It will create `dist/app.js`

Code
----
        function createModel(elem, interactionConfig) {
            var model = Bacon.Model({});
            interactionConfig.getValues().forEach(function (interaction) {
                var interactionName = interaction.getName();
                if (interaction.from) {
                    var selector = interaction.from.selector || interaction.from.elemType + '[name=' + interactionName + ']';
                    var field = Bacon.$[interaction.from.bindingType + 'Value'](elem.find(selector));
                    model.lens(interactionName).bind(field);
                }

                if (interaction.to) {
                    interaction.to.forEach(function (listener) {
                        var fld = listener.formatter ? field.map(listener.formatter) : field;
                        fld.assign(elem.find(listener.selector), listener.attr);
                    });
                }
            });
            return model;
        }

        function createEventStreams(elem, eventConfig) {
            var streams = {};
            eventConfig.getValues().forEach(function (event) {
                streams[event.getName()] = Bacon.fromEventTarget(elem.find(event.target.selector), event.target.eventType)
                    .doAction(".preventDefault");
            });
            return streams;
        }

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

        ...

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

        reset.onValue(_.bind(function (ev) {
            this.render();
        }, this));
