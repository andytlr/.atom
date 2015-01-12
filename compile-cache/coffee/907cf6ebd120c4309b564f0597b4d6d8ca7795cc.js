(function() {
  var AtomColorHighlightEditor, AtomColorHighlightModel, AtomColorHighlightView, CompositeDisposable, Subscriber,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Subscriber = require('emissary').Subscriber;

  CompositeDisposable = require('event-kit').CompositeDisposable;

  AtomColorHighlightModel = require('./atom-color-highlight-model');

  AtomColorHighlightView = require('./atom-color-highlight-view');

  module.exports = AtomColorHighlightEditor = (function() {
    Subscriber.includeInto(AtomColorHighlightEditor);

    function AtomColorHighlightEditor(editor) {
      this.editor = editor;
      this.subscribeToBuffer = __bind(this.subscribeToBuffer, this);
      this.destroy = __bind(this.destroy, this);
      this.subscriptions = new CompositeDisposable;
      this.editorElement = atom.views.getView(this.editor);
      this.model = null;
      this.view = null;
      this.subscriptions.add(this.editor.onDidChangePath(this.subscribeToBuffer));
      this.subscriptions.add(this.editor.getBuffer().onDidDestroy(this.destroy));
      this.subscribeToBuffer();
    }

    AtomColorHighlightEditor.prototype.getActiveModel = function() {
      return this.model;
    };

    AtomColorHighlightEditor.prototype.getActiveView = function() {
      return this.view;
    };

    AtomColorHighlightEditor.prototype.destroy = function() {
      this.unsubscribe();
      return this.unsubscribeFromBuffer();
    };

    AtomColorHighlightEditor.prototype.subscribeToBuffer = function() {
      var _ref;
      this.unsubscribeFromBuffer();
      if (this.buffer = this.editor.getBuffer()) {
        this.model = new AtomColorHighlightModel(this.editor, this.buffer);
        this.view = new AtomColorHighlightView(this.model, this.editor, this.editorElement);
        ((_ref = this.editorElement.shadowRoot) != null ? _ref : this.editorElement).querySelector('.lines').appendChild(this.view.element);
        return this.model.init();
      }
    };

    AtomColorHighlightEditor.prototype.unsubscribeFromBuffer = function() {
      if (this.buffer != null) {
        this.removeModel();
        this.removeView();
        return this.buffer = null;
      }
    };

    AtomColorHighlightEditor.prototype.removeView = function() {
      var _ref;
      return (_ref = this.view) != null ? _ref.destroy() : void 0;
    };

    AtomColorHighlightEditor.prototype.removeModel = function() {
      var _ref;
      return (_ref = this.model) != null ? _ref.dispose() : void 0;
    };

    return AtomColorHighlightEditor;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDBHQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQyxhQUFjLE9BQUEsQ0FBUSxVQUFSLEVBQWQsVUFBRCxDQUFBOztBQUFBLEVBQ0Msc0JBQXVCLE9BQUEsQ0FBUSxXQUFSLEVBQXZCLG1CQURELENBQUE7O0FBQUEsRUFHQSx1QkFBQSxHQUEwQixPQUFBLENBQVEsOEJBQVIsQ0FIMUIsQ0FBQTs7QUFBQSxFQUlBLHNCQUFBLEdBQXlCLE9BQUEsQ0FBUSw2QkFBUixDQUp6QixDQUFBOztBQUFBLEVBTUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLElBQUEsVUFBVSxDQUFDLFdBQVgsQ0FBdUIsd0JBQXZCLENBQUEsQ0FBQTs7QUFFYSxJQUFBLGtDQUFFLE1BQUYsR0FBQTtBQUNYLE1BRFksSUFBQyxDQUFBLFNBQUEsTUFDYixDQUFBO0FBQUEsbUVBQUEsQ0FBQTtBQUFBLCtDQUFBLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxhQUFELEdBQWlCLEdBQUEsQ0FBQSxtQkFBakIsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLElBQUMsQ0FBQSxNQUFwQixDQURqQixDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBSFQsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLElBQUQsR0FBUSxJQUpSLENBQUE7QUFBQSxNQU1BLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsTUFBTSxDQUFDLGVBQVIsQ0FBd0IsSUFBQyxDQUFBLGlCQUF6QixDQUFuQixDQU5BLENBQUE7QUFBQSxNQU9BLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsTUFBTSxDQUFDLFNBQVIsQ0FBQSxDQUFtQixDQUFDLFlBQXBCLENBQWlDLElBQUMsQ0FBQSxPQUFsQyxDQUFuQixDQVBBLENBQUE7QUFBQSxNQVNBLElBQUMsQ0FBQSxpQkFBRCxDQUFBLENBVEEsQ0FEVztJQUFBLENBRmI7O0FBQUEsdUNBY0EsY0FBQSxHQUFnQixTQUFBLEdBQUE7YUFBRyxJQUFDLENBQUEsTUFBSjtJQUFBLENBZGhCLENBQUE7O0FBQUEsdUNBZ0JBLGFBQUEsR0FBZSxTQUFBLEdBQUE7YUFBRyxJQUFDLENBQUEsS0FBSjtJQUFBLENBaEJmLENBQUE7O0FBQUEsdUNBa0JBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxNQUFBLElBQUMsQ0FBQSxXQUFELENBQUEsQ0FBQSxDQUFBO2FBQ0EsSUFBQyxDQUFBLHFCQUFELENBQUEsRUFGTztJQUFBLENBbEJULENBQUE7O0FBQUEsdUNBc0JBLGlCQUFBLEdBQW1CLFNBQUEsR0FBQTtBQUNqQixVQUFBLElBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxxQkFBRCxDQUFBLENBQUEsQ0FBQTtBQUVBLE1BQUEsSUFBRyxJQUFDLENBQUEsTUFBRCxHQUFVLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBUixDQUFBLENBQWI7QUFDRSxRQUFBLElBQUMsQ0FBQSxLQUFELEdBQWEsSUFBQSx1QkFBQSxDQUF3QixJQUFDLENBQUEsTUFBekIsRUFBaUMsSUFBQyxDQUFBLE1BQWxDLENBQWIsQ0FBQTtBQUFBLFFBQ0EsSUFBQyxDQUFBLElBQUQsR0FBWSxJQUFBLHNCQUFBLENBQXVCLElBQUMsQ0FBQSxLQUF4QixFQUErQixJQUFDLENBQUEsTUFBaEMsRUFBd0MsSUFBQyxDQUFBLGFBQXpDLENBRFosQ0FBQTtBQUFBLFFBR0EseURBQTZCLElBQUMsQ0FBQSxhQUE5QixDQUE0QyxDQUFDLGFBQTdDLENBQTJELFFBQTNELENBQW9FLENBQUMsV0FBckUsQ0FBaUYsSUFBQyxDQUFBLElBQUksQ0FBQyxPQUF2RixDQUhBLENBQUE7ZUFLQSxJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBQSxFQU5GO09BSGlCO0lBQUEsQ0F0Qm5CLENBQUE7O0FBQUEsdUNBaUNBLHFCQUFBLEdBQXVCLFNBQUEsR0FBQTtBQUNyQixNQUFBLElBQUcsbUJBQUg7QUFDRSxRQUFBLElBQUMsQ0FBQSxXQUFELENBQUEsQ0FBQSxDQUFBO0FBQUEsUUFDQSxJQUFDLENBQUEsVUFBRCxDQUFBLENBREEsQ0FBQTtlQUVBLElBQUMsQ0FBQSxNQUFELEdBQVUsS0FIWjtPQURxQjtJQUFBLENBakN2QixDQUFBOztBQUFBLHVDQXVDQSxVQUFBLEdBQVksU0FBQSxHQUFBO0FBQUcsVUFBQSxJQUFBOzhDQUFLLENBQUUsT0FBUCxDQUFBLFdBQUg7SUFBQSxDQXZDWixDQUFBOztBQUFBLHVDQXlDQSxXQUFBLEdBQWEsU0FBQSxHQUFBO0FBQUcsVUFBQSxJQUFBOytDQUFNLENBQUUsT0FBUixDQUFBLFdBQUg7SUFBQSxDQXpDYixDQUFBOztvQ0FBQTs7TUFSRixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/andytlr/.atom/packages/atom-color-highlight/lib/atom-color-highlight-editor.coffee