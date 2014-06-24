(function() {
  var AtomColorHighlight, AtomColorHighlightEditor, EditorView, Emitter;

  EditorView = require('atom').EditorView;

  Emitter = require('emissary').Emitter;

  AtomColorHighlightEditor = require('./atom-color-highlight-editor');

  AtomColorHighlight = (function() {
    function AtomColorHighlight() {}

    Emitter.includeInto(AtomColorHighlight);

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
      if (editorView instanceof EditorView) {
        return this.viewForEditor(editorView.getEditor());
      }
    };

    AtomColorHighlight.prototype.modelForEditorView = function(editorView) {
      if (editorView instanceof EditorView) {
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlFQUFBOztBQUFBLEVBQUMsYUFBYyxPQUFBLENBQVEsTUFBUixFQUFkLFVBQUQsQ0FBQTs7QUFBQSxFQUNDLFVBQVcsT0FBQSxDQUFRLFVBQVIsRUFBWCxPQURELENBQUE7O0FBQUEsRUFHQSx3QkFBQSxHQUEyQixPQUFBLENBQVEsK0JBQVIsQ0FIM0IsQ0FBQTs7QUFBQSxFQUtNO29DQUNKOztBQUFBLElBQUEsT0FBTyxDQUFDLFdBQVIsQ0FBb0Isa0JBQXBCLENBQUEsQ0FBQTs7QUFBQSxpQ0FFQSxPQUFBLEdBQVMsRUFGVCxDQUFBOztBQUFBLGlDQUdBLFFBQUEsR0FBVSxTQUFDLEtBQUQsR0FBQTthQUNSLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBbkIsQ0FBa0MsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsTUFBRCxHQUFBO0FBQ2hDLGNBQUEsV0FBQTtBQUFBLFVBQUEsSUFBVSxNQUFNLENBQUMsUUFBUCxDQUFnQixNQUFoQixDQUFWO0FBQUEsa0JBQUEsQ0FBQTtXQUFBO0FBQUEsVUFDQSxXQUFBLEdBQWtCLElBQUEsd0JBQUEsQ0FBeUIsTUFBekIsQ0FEbEIsQ0FBQTtBQUFBLFVBR0EsS0FBQyxDQUFBLE9BQVEsQ0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQWQsQ0FBVCxHQUE2QixXQUg3QixDQUFBO2lCQUlBLEtBQUMsQ0FBQSxJQUFELENBQU0sZ0NBQU4sRUFBd0MsV0FBeEMsRUFMZ0M7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsQyxFQURRO0lBQUEsQ0FIVixDQUFBOztBQUFBLGlDQVdBLHdCQUFBLEdBQTBCLFNBQUMsUUFBRCxHQUFBO0FBQ3hCLFVBQUEsZ0JBQUE7QUFBQSxNQUFBLElBQStDLGdCQUEvQztBQUFBO0FBQUEsYUFBQSxVQUFBOzRCQUFBOztZQUFBLFNBQVU7V0FBVjtBQUFBLFNBQUE7T0FBQTthQUNBLElBQUMsQ0FBQSxFQUFELENBQUksZ0NBQUosRUFBc0MsUUFBdEMsRUFGd0I7SUFBQSxDQVgxQixDQUFBOztBQUFBLGlDQWVBLGlCQUFBLEdBQW1CLFNBQUMsVUFBRCxHQUFBO0FBQ2pCLE1BQUEsSUFBMEMsVUFBQSxZQUFzQixVQUFoRTtlQUFBLElBQUMsQ0FBQSxhQUFELENBQWUsVUFBVSxDQUFDLFNBQVgsQ0FBQSxDQUFmLEVBQUE7T0FEaUI7SUFBQSxDQWZuQixDQUFBOztBQUFBLGlDQWtCQSxrQkFBQSxHQUFvQixTQUFDLFVBQUQsR0FBQTtBQUNsQixNQUFBLElBQTJDLFVBQUEsWUFBc0IsVUFBakU7ZUFBQSxJQUFDLENBQUEsY0FBRCxDQUFnQixVQUFVLENBQUMsU0FBWCxDQUFBLENBQWhCLEVBQUE7T0FEa0I7SUFBQSxDQWxCcEIsQ0FBQTs7QUFBQSxpQ0FxQkEsY0FBQSxHQUFnQixTQUFDLE1BQUQsR0FBQTtBQUFZLFVBQUEsSUFBQTs0REFBbUIsQ0FBRSxjQUFyQixDQUFBLFdBQVo7SUFBQSxDQXJCaEIsQ0FBQTs7QUFBQSxpQ0FzQkEsYUFBQSxHQUFlLFNBQUMsTUFBRCxHQUFBO0FBQVksVUFBQSxJQUFBOzREQUFtQixDQUFFLGFBQXJCLENBQUEsV0FBWjtJQUFBLENBdEJmLENBQUE7O0FBQUEsaUNBd0JBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFDVixVQUFBLDBCQUFBO0FBQUE7QUFBQTtXQUFBLFVBQUE7MEJBQUE7QUFDRSxRQUFBLElBQUMsQ0FBQSxJQUFELENBQU0sMENBQU4sRUFBa0QsTUFBbEQsQ0FBQSxDQUFBO0FBQUEsc0JBQ0EsTUFBTSxDQUFDLE9BQVAsQ0FBQSxFQURBLENBREY7QUFBQTtzQkFEVTtJQUFBLENBeEJaLENBQUE7OzhCQUFBOztNQU5GLENBQUE7O0FBQUEsRUFtQ0EsTUFBTSxDQUFDLE9BQVAsR0FBaUIsR0FBQSxDQUFBLGtCQW5DakIsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/andytlr/.atom/packages/atom-color-highlight/lib/atom-color-highlight.coffee