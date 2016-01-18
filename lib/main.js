"use babel";

import validator from "./validator";
import { CompositeDisposable } from "atom";

let oConfig,
    oDisposables,
    fActivate,
    fDeactivate;

oConfig = {
    "validateOnSave": {
        "default": true,
        "description": "Make a validation each time you save an HTML file.",
        "title": "Validate on save",
        "type": "boolean"
    },
    "validateOnChange": {
        "default": false,
        "description": "Make a validation each time you change an HTML file.",
        "title": "Validate on change",
        "type": "boolean"
    },
    "hideOnNoErrors": {
        "default": false,
        "description": "Hide the panel if there was no errors.",
        "title": "Hide on no errors",
        "type": "boolean"
    },
    "useFoldModeAsDefault": {
        "default": false,
        "description": "Fold the results panel by default.",
        "title": "Use fold mode as default",
        "type": "boolean"
    },
    "cssProfile": {
        "default": "css3",
        "description": "Profile to use for CSS file validation (default: css3).",
        "enum": [ "none", "css1", "css2", "css21", "css3", "svg", "svgbasic", "svgtiny", "mobile", "atsc-tv", "tv" ],
        "title": "CSS Profile",
        "type": "string"
    },
    "cssMedia": {
        "default": "all",
        "description": "Media to use for CSS file validation (default: all).",
        "enum": [ "all", "aural", "braille", "embossed", "handheld", "print", "projection", "screen", "tty", "tv", "presentation" ],
        "title": "CSS Media",
        "type": "string"
    },
    "cssReportType": {
        "default": "normal",
        "description": "CSS Report severity (default: normal).",
        "enum": [ "all", "normal", "most important", "no warnings" ],
        "title": "CSS Report severity",
        "type": "string"
    }
};

fActivate = function() {
    let oCommand;

    oDisposables && oDisposables.dispose();
    oDisposables = new CompositeDisposable();

    oCommand = atom.commands.add( "atom-text-editor:not([mini])", "w3c-validation:validate", () => {

        if ( ( atom.workspace.getActiveTextEditor().getGrammar().scopeName.indexOf( "text.html" ) > -1 ) || ( atom.workspace.getActiveTextEditor().getGrammar().scopeName.indexOf( "source.css" ) > -1 ) ) {
            validator();
        } else {
            atom.notifications.addWarning( "Current file ins't HTML or CSS!" );
        }
    } );

    atom.config.observe( "w3c-validation.validateOnSave", ( bValue ) => {
        atom.workspace.observeTextEditors( ( oEditor ) => {
            if ( bValue && ( ( oEditor.getGrammar().scopeName.indexOf( "text.html" ) > -1 ) || ( oEditor.getGrammar().scopeName.indexOf( "source.css" ) > -1 ) ) ) {
                oEditor.getBuffer().onDidSave( validator );
            }
        } );
    } );

    atom.config.observe( "w3c-validation.validateOnChange", ( bValue ) => {
        atom.workspace.observeTextEditors( ( oEditor ) => {
            if ( bValue && ( ( oEditor.getGrammar().scopeName.indexOf( "text.html" ) > -1 ) || ( oEditor.getGrammar().scopeName.indexOf( "source.css" ) > -1 ) ) ) {
                oEditor.getBuffer().onDidChange( "contents-modified", validator );
            }
        } );
    } );

    oDisposables.add( oCommand );
};

fDeactivate = function() {
    oDisposables && oDisposables.dispose();
};

export {
    oConfig as config,
    fActivate as activate,
    fDeactivate as deactivate
};
