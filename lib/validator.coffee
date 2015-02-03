{ MessagePanelView, LineMessageView, PlainMessageView } = require "atom-message-panel"

validator = require "w3cvalidator"

oMessagesPanel = new MessagePanelView
    title: ( sPanelTitle = '<span class="icon-microscope"></span> W3C Markup Validation Service Report' )
    rawTitle: yes
    closeMethod: "destroy"

module.exports = ->
    return unless ( oEditor = atom.workspace.getActiveTextEditor() ) and oEditor.getGrammar().name is "HTML"

    oMessagesPanel.clear()
    oMessagesPanel.attach()

    oMessagesPanel.toggle() if atom.config.get( "html-validation.useFoldModeAsDefault" ) and oMessagesPanel.summary.css( "display" ) is "none"

    oMessagesPanel.add new PlainMessageView
        message: '<span class="icon-hourglass"></span> Validation pending (this can take some time)...'
        raw: yes
        className: "text-info"

    validator.validate
        input: oEditor.getText()
        output: "json"
        charset: oEditor.getEncoding()
        callback: ( oResponse ) ->
            oMessagesPanel.clear()

            return unless oResponse.messages

            unless oResponse.messages.length
                return oMessagesPanel.close() if atom.config.get "html-validation.hideOnNoErrors"

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
                    preview: oEditor.lineTextForBufferRow( oMessage.lastLine - 1 ).trim()
                    className: "text-#{ oMessage.type }"

            atom.workspace.onDidChangeActivePaneItem -> oMessagesPanel.close()
