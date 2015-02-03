{ CompositeDisposable } = require "atom"

validator = require "./validator"

module.exports = HtmlValidation =
    subscriptions: null

    config:
        validateOnSave:
            type: "boolean"
            default: no
        validateOnChange:
            type: "boolean"
            default: no

    activate: ->
        ( @subscriptions = new CompositeDisposable )
            .add atom.commands.add "atom-text-editor", "html-validation:validate": validator

    deactivate: ->
        @subscriptions.dispose()
