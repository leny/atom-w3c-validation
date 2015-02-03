validator = require "./validator"

module.exports = HtmlValidation =
    config:
        validateOnSave:
            type: "boolean"
            default: no
            title: "Validate on save"
            description: "Make a validation each time you save an HTML file."
        validateOnChange:
            type: "boolean"
            default: no
            title: "Validate on change"
            description: "Make a validation each time you change an HTML file."
        hideOnNoErrors:
            type: "boolean"
            default: no
            title: "Hide on no errors"
            description: "Hide the panel if there was no errors."
        useFoldModeAsDefault:
            type: "boolean"
            default: no
            title: "Use fold mode as default"
            description: "Fold the panel by default."

    activate: ->
        atom.commands.add "atom-text-editor", "html-validation:validate": validator

        atom.config.observe "html-validation.validateOnSave", ( bValue ) ->
            atom.workspace.eachEditor ( oEditor ) ->
                oEditor.buffer[ if bValue then "on" else "off" ] "saved", validator

        atom.config.observe "html-validation.validateOnChange", ( bValue ) ->
            atom.workspace.eachEditor ( oEditor ) ->
                oEditor.buffer[ if bValue then "on" else "off" ] "contents-modified", validator
