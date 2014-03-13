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

        var CustomerFields = new Enum(['name', 'email']); //TODO add type

        ...

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
