"use babel";

import { MessagePanelView, LineMessageView, PlainMessageView } from "atom-message-panel";
import W3CHTMLValidator from "w3cjs";
import W3CCSSValidator from "w3c-css";

let sHTMLPanelTitle = '<span class="icon-microscope"></span> W3C Markup Validation Service Report',
    sCSSPanelTitle = '<span class="icon-microscope"></span> W3C CSS Validation Service Report',
    oMessagesPanel = new MessagePanelView( {
        "rawTitle": true,
        "closeMethod": "destroy"
    } ),
    fValidate,
    fShowError,
    fShowResults;

fShowError = function( oError ) {
    oMessagesPanel.clear();
    oMessagesPanel.add( new PlainMessageView( {
        "message": '<span class="icon-alert"></span> Validation fails with error.',
        "preview": oError.message,
        "raw": true,
        "className": "text-error"
    } ) );
};

fShowResults = function( oEditor, aMessages ) {
    let iErrorCount = 0,
        iWarningCount = 0,
        aFilteredMessages, sErrorReport, sWarningReport;

    oMessagesPanel.clear();
    aFilteredMessages = aMessages.filter( ( oMessage ) => {
        return oMessage.type !== "info";
    } );
    if ( aFilteredMessages.length === 0 ) {
        if ( atom.config.get( "w3c-validation.hideOnNoErrors" ) ) {
            return oMessagesPanel.close();
        }
        oMessagesPanel.add( new PlainMessageView( {
            "message": '<span class="icon-check"></span> No errors were found !',
            "raw": true,
            "className": "text-success"
        } ) );
        return;
    }
    for ( let oMessage of aFilteredMessages ) {
        if ( oMessage.type !== "info" ) {
            ( oMessage.type === "error" ) && iErrorCount++;
            ( oMessage.type === "warning" ) && iWarningCount++;
            oMessagesPanel.add( new LineMessageView( {
                "character": oMessage.lastColumn,
                "className": `text-${ oMessage.type }`,
                "line": oMessage.lastLine,
                "message": oMessage.message,
                "preview": ( oEditor.lineTextForBufferRow( oMessage.lastLine - 1 ) || "" ).trim()
            } ) );
        }
    }
    sErrorReport = `${ iErrorCount } error${ iErrorCount > 1 ? "s" : "" }`;
    sWarningReport = `${ iWarningCount } warning${ iWarningCount > 1 ? "s" : "" }`;
    oMessagesPanel.setTitle( `${ oMessagesPanel.heading.html() } (${ sErrorReport }, ${ sWarningReport })`, true );
};

fValidate = function() {
    let oEditor,
        oValidatorOptions;

    if ( !( oEditor = atom.workspace.getActiveTextEditor() ) ) {
        return;
    }

    oMessagesPanel.clear();
    oMessagesPanel.setTitle( ( oEditor.getGrammar().scopeName.indexOf( "css" ) > -1 ? sCSSPanelTitle : sHTMLPanelTitle ), true );
    oMessagesPanel.attach();

    if ( atom.config.get( "w3c-validation.useFoldModeAsDefault" ) && oMessagesPanel.summary.css( "display" ) === "none" ) {
        oMessagesPanel.toggle();
    }

    oMessagesPanel.add( new PlainMessageView( {
        "message": '<span class="icon-hourglass"></span> Validation pending (this can take some time)...',
        "raw": true,
        "className": "text-info"
    } ) );

    if ( oEditor.getGrammar().scopeName.indexOf( "html" ) > -1 ) {
        oValidatorOptions = {
            "input": oEditor.getText(),
            callback( oResponse ) {
                if ( !oResponse || !oResponse.messages ) {
                    oMessagesPanel.add( new PlainMessageView( {
                        "message": '<span class="icon-alert"></span> Validation fails without error.',
                        "raw": true,
                        "className": "text-error"
                    } ) );
                    return;
                }
                fShowResults( oEditor, oResponse.messages );
            }
        };

        try {
            W3CHTMLValidator.validate( oValidatorOptions );
        } catch ( oError ) {
            fShowError( oError );
        }
    }

    if ( oEditor.getGrammar().scopeName.indexOf( "css" ) > -1 ) {
        oValidatorOptions = {
            "text": oEditor.getText(),
            "profile": atom.config.get( "w3c-validation.cssProfile" ),
            "medium": atom.config.get( "w3c-validation.cssMedia" )
        };
        switch ( atom.config.get( "w3c-validation.cssReportType" ) ) {
            case "all":
                oValidatorOptions.warnings = 2;
                break;
            case "most important":
                oValidatorOptions.warnings = 0;
                break;
            case "no warnings":
                oValidatorOptions.warnings = "no";
                break;
            default:
                oValidatorOptions.warnings = 1;
                break;
        }
        try {
            W3CCSSValidator.validate( oValidatorOptions, ( oError, aResults ) => {
                let aParsedErrors,
                    aParsedWarnings;

                if ( oError ) {
                    fShowError( oError );
                    return;
                }
                aParsedErrors = ( aResults.errors || [] ).map( ( oMessage ) => {
                    return {
                        "lastLine": oMessage.line,
                        "type": "error",
                        "message": oMessage.message
                    };
                } );
                aParsedWarnings = ( aResults.warnings || [] ).map( ( oMessage ) => {
                    return {
                        "lastLine": oMessage.line,
                        "type": "warning",
                        "message": oMessage.message
                    };
                } );
                fShowResults( oEditor, [].concat( aParsedErrors, aParsedWarnings ) );
            } );
        } catch ( oError ) {
            fShowError( oError );
        }
    }
};

export default fValidate;
