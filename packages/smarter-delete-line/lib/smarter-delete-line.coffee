module.exports =
  activate: ->
    atom.workspaceView.command 'smarter-delete-line:delete-to-first-character', '.editor', ->
      editor = atom.workspaceView.getActivePaneItem()

      editor.mutateSelectedText (selection) ->
        if selection.isEmpty
          selection.selectToFirstCharacterOfLine()

        selection.deleteSelectedText()
