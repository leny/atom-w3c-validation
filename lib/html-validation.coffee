{ CompositeDisposable } = require 'atom'

module.exports = HtmlValidation =
    subscriptions: null

    activate: ->
        ( @subscriptions = new CompositeDisposable )
            .add atom.commands.add 'atom-text-editor', 'html-validation:validate': => @validate()

    deactivate: ->
        @subscriptions.dispose()

    validate: ->
        console.log 'HtmlValidation was triggered!'
