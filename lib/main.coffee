validator = require "./validator"

module.exports = HtmlValidation =
    config:
        validateOnSave:
            type: "boolean"
            default: yes
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
            description: "Fold the results panel by default."
        cssProfile:
            type: "string"
            default: "css3"
            enum: [ "none", "css1", "css2", "css21", "css3", "svg", "svgbasic", "svgtiny", "mobile", "atsc-tv", "tv" ]
            title: "CSS Profile"
            description: "Profile to use for CSS file validation (default: css3)."
        cssMedia:
            type: "string"
            default: "all"
            enum: [ "all", "aural", "braille", "embossed", "handheld", "print", "projection", "screen", "tty", "tv", "presentation" ]
            title: "CSS Media"
            description: "Media to use for CSS file validation (default: all)."
        cssReportType:
            type: "string"
            default: "normal"
            enum: [ "all", "normal", "most important", "no warnings" ]
            title: "CSS Report severity"
            description: "CSS Report severity (default: normal)."

    activate: ->
        atom.commands.add "atom-text-editor", "w3c-validation:validate": ->
            validator() if atom.workspace.getActiveTextEditor().getGrammar().name in [ "HTML", "CSS" ]

        atom.config.observe "w3c-validation.validateOnSave", ( bValue ) ->
            atom.workspace.observeTextEditors ( oEditor ) ->
                oEditor.getBuffer().onDidSave( validator ) if bValue and oEditor.getGrammar().name in [ "HTML", "CSS" ]

        atom.config.observe "w3c-validation.validateOnChange", ( bValue ) ->
            atom.workspace.observeTextEditors ( oEditor ) ->
                oEditor.getBuffer().onDidChange( "contents-modified", validator ) if bValue and oEditor.getGrammar().name in [ "HTML", "CSS" ]
