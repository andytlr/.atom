(function() {
  var AtomColorHighlightEditor, AtomColorHighlightModel, AtomColorHighlightView, CompositeDisposable, Subscriber,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Subscriber = require('emissary').Subscriber;

  CompositeDisposable = require('event-kit').CompositeDisposable;

  AtomColorHighlightModel = require('./atom-color-highlight-model');

  AtomColorHighlightView = require('./atom-color-highlight-view');

  module.exports = AtomColorHighlightEditor = (function() {
    Subscriber.includeInto(AtomColorHighlightEditor);

    function AtomColorHighlightEditor(editorView) {
      this.editorView = editorView;
      this.subscribeToBuffer = __bind(this.subscribeToBuffer, this);
      this.destroy = __bind(this.destroy, this);
      this.editor = this.editorView.editor;
      this.subscriptions = new CompositeDisposable;
      this.models = {};
      this.views = {};
      this.subscriptions.add(this.editorView.getModel().onDidChangePath(this.subscribeToBuffer));
      this.subscriptions.add(this.editorView.getModel().getBuffer().onDidDestroy(this.destroy));
      this.subscribeToBuffer();
    }

    AtomColorHighlightEditor.prototype.getActiveModel = function() {
      var path;
      path = this.buffer.getPath();
      return this.models[path];
    };

    AtomColorHighlightEditor.prototype.getActiveView = function() {
      var path;
      path = this.buffer.getPath();
      return this.views[path];
    };

    AtomColorHighlightEditor.prototype.destroy = function() {
      this.unsubscribe();
      return this.unsubscribeFromBuffer();
    };

    AtomColorHighlightEditor.prototype.subscribeToBuffer = function() {
      var model, view;
      this.unsubscribeFromBuffer();
      if (this.buffer = this.editor.getBuffer()) {
        model = this.models[this.buffer.getPath()] = new AtomColorHighlightModel(this.editor, this.buffer);
        view = this.views[this.buffer.getPath()] = new AtomColorHighlightView(model, this.editorView);
        if (atom.config.get('core.useReactEditor')) {
          this.editorView.find('.lines').append(view);
        } else {
          this.editorView.overlayer.append(view);
        }
        return model.init();
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
      var path, _ref;
      path = this.buffer.getPath();
      if ((_ref = this.views[path]) != null) {
        _ref.destroy();
      }
      return delete this.views[path];
    };

    AtomColorHighlightEditor.prototype.removeModel = function() {
      var path, _ref;
      path = this.buffer.getPath();
      if ((_ref = this.models[path]) != null) {
        _ref.dispose();
      }
      return delete this.models[path];
    };

    return AtomColorHighlightEditor;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDBHQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQyxhQUFjLE9BQUEsQ0FBUSxVQUFSLEVBQWQsVUFBRCxDQUFBOztBQUFBLEVBQ0Msc0JBQXVCLE9BQUEsQ0FBUSxXQUFSLEVBQXZCLG1CQURELENBQUE7O0FBQUEsRUFHQSx1QkFBQSxHQUEwQixPQUFBLENBQVEsOEJBQVIsQ0FIMUIsQ0FBQTs7QUFBQSxFQUlBLHNCQUFBLEdBQXlCLE9BQUEsQ0FBUSw2QkFBUixDQUp6QixDQUFBOztBQUFBLEVBTUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLElBQUEsVUFBVSxDQUFDLFdBQVgsQ0FBdUIsd0JBQXZCLENBQUEsQ0FBQTs7QUFFYSxJQUFBLGtDQUFFLFVBQUYsR0FBQTtBQUNYLE1BRFksSUFBQyxDQUFBLGFBQUEsVUFDYixDQUFBO0FBQUEsbUVBQUEsQ0FBQTtBQUFBLCtDQUFBLENBQUE7QUFBQSxNQUFDLElBQUMsQ0FBQSxTQUFVLElBQUMsQ0FBQSxXQUFYLE1BQUYsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsR0FBQSxDQUFBLG1CQUZqQixDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsTUFBRCxHQUFVLEVBSlYsQ0FBQTtBQUFBLE1BS0EsSUFBQyxDQUFBLEtBQUQsR0FBUyxFQUxULENBQUE7QUFBQSxNQU9BLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsVUFBVSxDQUFDLFFBQVosQ0FBQSxDQUFzQixDQUFDLGVBQXZCLENBQXVDLElBQUMsQ0FBQSxpQkFBeEMsQ0FBbkIsQ0FQQSxDQUFBO0FBQUEsTUFRQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLFVBQVUsQ0FBQyxRQUFaLENBQUEsQ0FBc0IsQ0FB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
//# sourceURL=/Users/andytlr/.atom/packages/atom-color-highlight/lib/atom-color-highlight-editor.coffee