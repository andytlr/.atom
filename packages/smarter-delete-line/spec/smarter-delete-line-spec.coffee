{WorkspaceView} = require 'atom'
SmarterDeleteLine = require '../lib/smarter-delete-line'

# Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
#
# To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
# or `fdescribe`). Remove the `f` to unfocus the block.

describe "SmarterDeleteLine", ->
  editor = null
  editorView = null

  beforeEach ->
    atom.workspaceView = new WorkspaceView
    waitsForPromise ->
      atom.packages.activatePackage("smarter-delete-line")

    atom.workspaceView.openSync('sample.js')
    editorView = atom.workspaceView.getActiveView()
    editor = editorView.getEditor()

  describe "deleting lines", ->
    it "deletes to the first character when not indented", ->
      editor.setCursorBufferPosition [0, 17]

      editorView.trigger 'smarter-delete-line:delete-to-first-character'
      pos = editor.getCursorBufferPosition()

      expect(pos).toEqual [0,0]

    it "deletes to the first character when indented", ->
      editor.setCursorBufferPosition [1, 13]

      editorView.trigger 'smarter-delete-line:delete-to-first-character'
      pos = editor.getCursorBufferPosition()

      expect(pos).toEqual [1, 2]
