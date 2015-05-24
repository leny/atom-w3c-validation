{ MessagePanelView, LineMessageView, PlainMessageView } = require "atom-message-panel"

validator = require "w3cvalidator"

sHTMLPanelTitle = '<span class="icon-microscope"></span> W3C Markup Validation Service Report'
sCSSPanelTitle = '<span class="icon-microscope"></span> W3C CSS Validation Service Report'

oMessagesPanel = new MessagePanelView
    rawTitle: yes
    closeMethod: "destroy"

module.exports = ->
    return unless ( oEditor = atom.workspace.getActiveTextEditor() )

    oMessagesPanel.clear()

    oMessagesPanel.setTitle ( sPanelTitle = if oEditor.getGrammar().name is "CSS" then sCSSPanelTitle else sHTMLPanelTitle ), yes

    oMessagesPanel.attach()

    oMessagesPanel.toggle() if atom.config.get( "w3c-validation.useFoldModeAsDefault" ) and oMessagesPanel.summary.css( "display" ) is "none"

    oMessagesPanel.add new PlainMessageView
        message: '<span class="icon-hourglass"></span> Validation pending (this can take some time)...'
        raw: yes
        className: "text-info"

    oOptions =
        input: oEditor.getText()
        output: "json"
        charset: oEditor.getEncoding()
        callback: ( oResponse ) ->
            oMessagesPanel.clear()

            return unless oResponse.messages

            unless oResponse.messages.length
                return oMessagesPanel.close() if atom.config.get "w3c-validation.hideOnNoErrors"

                return oMessagesPanel.add new PlainMessageView
                    message: '<span class="icon-check"></span> No errors were found !'
                    raw: yes
                    className: "text-success"

            oMessagesPanel.setTitle "#{ sPanelTitle } (#{ oResponse.messages.length } messages)", yes

            for oMessage in oResponse.messages when !!oMessage
                oMessagesPanel.add new LineMessageView
                    message: oMessage.message
                    line: oMessage.lastLine
                    character: oMessage.lastColumn
                    preview: ( oEditor.lineTextForBufferRow( oMessage.lastLine - 1 ) ? "" ).trim()
                    className: "text-#{ oMessage.type }"

            atom.workspace.onDidChangeActivePaneItem -> oMessagesPanel.close()

    if oEditor.getGrammar().name is "CSS"
        oOptions.validate = oEditor.getGrammar().name.toLowerCase()
        oOptions.profile = atom.config.get "w3c-validation.cssProfile"
        oOptions.medium = atom.config.get "w3c-validation.cssMedia"
        oOptions.warnings = switch atom.config.get "w3c-validation.cssReportType"
            when "all" then 2
            when "most important" then 0
            when "no warnings" then "no"
            else 1

    validator.validate oOptions
