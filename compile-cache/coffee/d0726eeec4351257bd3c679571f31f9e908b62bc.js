(function() {
  var AtomColorHighlight, AtomColorHighlightEditor, EditorView, Emitter;

  EditorView = require('atom').EditorView;

  Emitter = require('emissary').Emitter;

  AtomColorHighlightEditor = require('./atom-color-highlight-editor');

  AtomColorHighlight = (function() {
    function AtomColorHighlight() {}

    Emitter.includeInto(AtomColorHighlight);

    AtomColorHighlight.prototype.configDefaults = {
      markersAtEndOfLine: false,
      hideMarkersInComments: false,
      hideMarkersInStrings: false,
      dotMarkersSize: 16,
      dotMarkersSpacing: 4
    };

    AtomColorHighlight.prototype.editors = {};

    AtomColorHighlight.prototype.activate = function(state) {
      return atom.workspaceView.eachEditorView((function(_this) {
        return function(editor) {
          var colorEditor;
          if (editor.hasClass('mini')) {
            return;
          }
          colorEditor = new AtomColorHighlightEditor(editor);
          _this.editors[editor.editor.id] = colorEditor;
          return _this.emit('color-highlight:editor-created', colorEditor);
        };
      })(this));
    };

    AtomColorHighlight.prototype.eachColorHighlightEditor = function(callback) {
      var editor, id, _ref;
      if (callback != null) {
        _ref = this.editors;
        for (id in _ref) {
          editor = _ref[id];
          if (typeof callback === "function") {
            callback(editor);
          }
        }
      }
      return this.on('color-highlight:editor-created', callback);
    };

    AtomColorHighlight.prototype.viewForEditorView = function(editorView) {
      if (editorView != null ? editorView.hasClass('editor') : void 0) {
        return this.viewForEditor(editorView.getEditor());
      }
    };

    AtomColorHighlight.prototype.modelForEditorView = function(editorView) {
      if (editorView != null ? editorView.hasClass('editor') : void 0) {
        return this.modelForEditor(editorView.getEditor());
      }
    };

    AtomColorHighlight.prototype.modelForEditor = function(editor) {
      var _ref;
      return (_ref = this.editors[editor.id]) != null ? _ref.getActiveModel() : void 0;
    };

    AtomColorHighlight.prototype.viewForEditor = function(editor) {
      var _ref;
      return (_ref = this.editors[editor.id]) != null ? _ref.getactiveView() : void 0;
    };

    AtomColorHighlight.prototype.deactivate = function() {
      var editor, id, _ref, _results;
      _ref = this.editors;
      _results = [];
      for (id in _ref) {
        editor = _ref[id];
        this.emit('color-highlight:editor-will-be-destroyed', editor);
        _results.push(editor.destroy());
      }
      return _results;
    };

    return AtomColorHighlight;

  })();

  module.exports = new AtomColorHighlight;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlFQUFBOztBQUFBLEVBQUMsYUFBYyxPQUFBLENBQVEsTUFBUixFQUFkLFVBQUQsQ0FBQTs7QUFBQSxFQUNDLFVBQVcsT0FBQSxDQUFRLFVBQVIsRUFBWCxPQURELENBQUE7O0FBQUEsRUFHQSx3QkFBQSxHQUEyQixPQUFBLENBQVEsK0JBQVIsQ0FIM0IsQ0FBQTs7QUFBQSxFQUtNO29DQUNKOztBQUFBLElBQUEsT0FBTyxDQUFDLFdBQVIsQ0FBb0Isa0JBQXBCLENBQUEsQ0FBQTs7QUFBQSxpQ0FFQSxjQUFBLEdBQ0U7QUFBQSxNQUFBLGtCQUFBLEVBQW9CLEtBQXBCO0FBQUEsTUFDQSxxQkFBQSxFQUF1QixLQUR2QjtBQUFBLE1BRUEsb0JBQUEsRUFBc0IsS0FGdEI7QUFBQSxNQUdBLGNBQUEsRUFBZ0IsRUFIaEI7QUFBQSxNQUlBLGlCQUFBLEVBQW1CLENBSm5CO0tBSEYsQ0FBQTs7QUFBQSxpQ0FTQSxPQUFBLEdBQVMsRUFUVCxDQUFBOztBQUFBLGlDQVVBLFFBQUEsR0FBVSxTQUFDLEtBQUQsR0FBQTthQUNSLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBbkIsQ0FBa0MsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsTUFBRCxHQUFBO0FBQ2hDLGNBQUEsV0FBQTtBQUFBLFVBQUEsSUFBVSxNQUFNLENBQUMsUUFBUCxDQUFnQixNQUFoQixDQUFWO0FBQUEsa0JBQUEsQ0FBQTtXQUFBO0FBQUEsVUFDQSxXQUFBLEdBQWtCLElBQUEsd0JBQUEsQ0FBeUIsTUFBekIsQ0FEbEIsQ0FBQTtBQUFBLFVBR0EsS0FBQyxDQUFBLE9BQVEsQ0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQWQsQ0FBVCxHQUE2QixXQUg3QixDQUFBO2lCQUlBLEtBQUMsQ0FBQSxJQUFELENBQU0sZ0NBQU4sRUFBd0MsV0FBeEMsRUFMZ0M7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsQyxFQURRO0lBQUEsQ0FWVixDQUFBOztBQUFBLGlDQWtCQSx3QkFBQSxHQUEwQixTQUFDLFFBQUQsR0FBQTtBQUN4QixVQUFBLGdCQUFBO0FBQUEsTUFBQSxJQUErQyxnQkFBL0M7QUFBQTtBQUFBLGFBQUEsVUFBQTs0QkFBQTs7WUFBQSxTQUFVO1dBQVY7QUFBQSxTQUFBO09BQUE7YUFDQSxJQUFDLENBQUEsRUFBRCxDQUFJLGdDQUFKLEVBQXNDLFFBQXRDLEVBRndCO0lBQUEsQ0FsQjFCLENBQUE7O0FBQUEsaUNBc0JBLGlCQUFBLEdBQW1CLFNBQUMsVUFBRCxHQUFBO0FBQ2pCLE1BQUEseUJBQTBDLFVBQVUsQ0FBRSxRQUFaLENBQXFCLFFBQXJCLFVBQTFDO2VBQUEsSUFBQyxDQUFBLGFBQUQsQ0FBZSxVQUFVLENBQUMsU0FBWCxDQUFBLENBQWYsRUFBQTtPQURpQjtJQUFBLENBdEJuQixDQUFBOztBQUFBLGlDQXlCQSxrQkFBQSxHQUFvQixTQUFDLFVBQUQsR0FBQTtBQUNsQixNQUFBLHlCQUEyQyxVQUFVLENBQUUsUUFBWixDQUFxQixRQUFyQixVQUEzQztlQUFBLElBQUMsQ0FBQSxjQUFELENBQWdCLFVBQVUsQ0FBQyxTQUFYLENBQUEsQ0FBaEIsRUFBQTtPQURrQjtJQUFBLENBekJwQixDQUFBOztBQUFBLGlDQTRCQSxjQUFBLEdBQWdCLFNBQUMsTUFBRCxHQUFBO0FBQVksVUFBQSxJQUFBOzREQUFtQixDQUFFLGNBQXJCLENBQUEsV0FBWjtJQUFBLENBNUJoQixDQUFBOztBQUFBLGlDQTZCQSxhQUFBLEdBQWUsU0FBQyxNQUFELEdBQUE7QUFBWSxVQUFBLElBQUE7NERBQW1CLENBQUUsYUFBckIsQ0FBQSxXQUFaO0lBQUEsQ0E3QmYsQ0FBQTs7QUFBQSxpQ0ErQkEsVUFBQSxHQUFZLFNBQUEsR0FBQTtBQUNWLFVBQUEsMEJBQUE7QUFBQTtBQUFBO1dBQUEsVUFBQTswQkFBQTtBQUNFLFFBQUEsSUFBQyxDQUFBLElBQUQsQ0FBTSwwQ0FBTixFQUFrRCxNQUFsRCxDQUFBLENBQUE7QUFBQSxzQkFDQSxNQUFNLENBQUMsT0FBUCxDQUFBLEVBREEsQ0FERjtBQUFBO3NCQURVO0lBQUEsQ0EvQlosQ0FBQTs7OEJBQUE7O01BTkYsQ0FBQTs7QUFBQSxFQTBDQSxNQUFNLENBQUMsT0FBUCxHQUFpQixHQUFBLENBQUEsa0JBMUNqQixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/andytlr/.atom/packages/atom-color-highlight/lib/atom-color-highlight.coffee