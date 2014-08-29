(function() {
  var AtomColorHighlight, AtomColorHighlightEditor, EditorView, Emitter;

  EditorView = require('atom').EditorView;

  Emitter = require('emissary').Emitter;

  AtomColorHighlightEditor = null;

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
          AtomColorHighlightEditor || (AtomColorHighlightEditor = require('./atom-color-highlight-editor'));
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlFQUFBOztBQUFBLEVBQUMsYUFBYyxPQUFBLENBQVEsTUFBUixFQUFkLFVBQUQsQ0FBQTs7QUFBQSxFQUNDLFVBQVcsT0FBQSxDQUFRLFVBQVIsRUFBWCxPQURELENBQUE7O0FBQUEsRUFFQSx3QkFBQSxHQUEyQixJQUYzQixDQUFBOztBQUFBLEVBSU07b0NBQ0o7O0FBQUEsSUFBQSxPQUFPLENBQUMsV0FBUixDQUFvQixrQkFBcEIsQ0FBQSxDQUFBOztBQUFBLGlDQUVBLGNBQUEsR0FDRTtBQUFBLE1BQUEsa0JBQUEsRUFBb0IsS0FBcEI7QUFBQSxNQUNBLHFCQUFBLEVBQXVCLEtBRHZCO0FBQUEsTUFFQSxvQkFBQSxFQUFzQixLQUZ0QjtBQUFBLE1BR0EsY0FBQSxFQUFnQixFQUhoQjtBQUFBLE1BSUEsaUJBQUEsRUFBbUIsQ0FKbkI7S0FIRixDQUFBOztBQUFBLGlDQVNBLE9BQUEsR0FBUyxFQVRULENBQUE7O0FBQUEsaUNBVUEsUUFBQSxHQUFVLFNBQUMsS0FBRCxHQUFBO2FBQ1IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxjQUFuQixDQUFrQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxNQUFELEdBQUE7QUFDaEMsY0FBQSxXQUFBO0FBQUEsVUFBQSw2QkFBQSwyQkFBNkIsT0FBQSxDQUFRLCtCQUFSLEVBQTdCLENBQUE7QUFBQSxVQUVBLFdBQUEsR0FBa0IsSUFBQSx3QkFBQSxDQUF5QixNQUF6QixDQUZsQixDQUFBO0FBQUEsVUFJQSxLQUFDLENBQUEsT0FBUSxDQUFBLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBZCxDQUFULEdBQTZCLFdBSjdCLENBQUE7aUJBS0EsS0FBQyxDQUFBLElBQUQsQ0FBTSxnQ0FBTixFQUF3QyxXQUF4QyxFQU5nQztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxDLEVBRFE7SUFBQSxDQVZWLENBQUE7O0FBQUEsaUNBbUJBLHdCQUFBLEdBQTBCLFNBQUMsUUFBRCxHQUFBO0FBQ3hCLFVBQUEsZ0JBQUE7QUFBQSxNQUFBLElBQStDLGdCQUEvQztBQUFBO0FBQUEsYUFBQSxVQUFBOzRCQUFBOztZQUFBLFNBQVU7V0FBVjtBQUFBLFNBQUE7T0FBQTthQUNBLElBQUMsQ0FBQSxFQUFELENBQUksZ0NBQUosRUFBc0MsUUFBdEMsRUFGd0I7SUFBQSxDQW5CMUIsQ0FBQTs7QUFBQSxpQ0F1QkEsaUJBQUEsR0FBbUIsU0FBQyxVQUFELEdBQUE7QUFDakIsTUFBQSx5QkFBMEMsVUFBVSxDQUFFLFFBQVosQ0FBcUIsUUFBckIsVUFBMUM7ZUFBQSxJQUFDLENBQUEsYUFBRCxDQUFlLFVBQVUsQ0FBQyxTQUFYLENBQUEsQ0FBZixFQUFBO09BRGlCO0lBQUEsQ0F2Qm5CLENBQUE7O0FBQUEsaUNBMEJBLGtCQUFBLEdBQW9CLFNBQUMsVUFBRCxHQUFBO0FBQ2xCLE1BQUEseUJBQTJDLFVBQVUsQ0FBRSxRQUFaLENBQXFCLFFBQXJCLFVBQTNDO2VBQUEsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsVUFBVSxDQUFDLFNBQVgsQ0FBQSxDQUFoQixFQUFBO09BRGtCO0lBQUEsQ0ExQnBCLENBQUE7O0FBQUEsaUNBNkJBLGNBQUEsR0FBZ0IsU0FBQyxNQUFELEdBQUE7QUFBWSxVQUFBLElBQUE7NERBQW1CLENBQUUsY0FBckIsQ0FBQSxXQUFaO0lBQUEsQ0E3QmhCLENBQUE7O0FBQUEsaUNBOEJBLGFBQUEsR0FBZSxTQUFDLE1BQUQsR0FBQTtBQUFZLFVBQUEsSUFBQTs0REFBbUIsQ0FBRSxhQUFyQixDQUFBLFdBQVo7SUFBQSxDQTlCZixDQUFBOztBQUFBLGlDQWdDQSxVQUFBLEdBQVksU0FBQSxHQUFBO0FBQ1YsVUFBQSwwQkFBQTtBQUFBO0FBQUE7V0FBQSxVQUFBOzBCQUFBO0FBQ0UsUUFBQSxJQUFDLENBQUEsSUFBRCxDQUFNLDBDQUFOLEVBQWtELE1BQWxELENBQUEsQ0FBQTtBQUFBLHNCQUNBLE1BQU0sQ0FBQyxPQUFQLENBQUEsRUFEQSxDQURGO0FBQUE7c0JBRFU7SUFBQSxDQWhDWixDQUFBOzs4QkFBQTs7TUFMRixDQUFBOztBQUFBLEVBMENBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLEdBQUEsQ0FBQSxrQkExQ2pCLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/andytlr/.atom/packages/atom-color-highlight/lib/atom-color-highlight.coffee