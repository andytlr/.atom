(function() {
  var AtomColorHighlightEditor, AtomColorHighlightModel, AtomColorHighlightView, Subscriber,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Subscriber = require('emissary').Subscriber;

  AtomColorHighlightModel = require('./atom-color-highlight-model');

  AtomColorHighlightView = require('./atom-color-highlight-view');

  module.exports = AtomColorHighlightEditor = (function() {
    Subscriber.includeInto(AtomColorHighlightEditor);

    function AtomColorHighlightEditor(editorView) {
      this.editorView = editorView;
      this.subscribeToBuffer = __bind(this.subscribeToBuffer, this);
      this.destroy = __bind(this.destroy, this);
      this.editor = this.editorView.editor;
      this.models = {};
      this.views = {};
      this.subscribe(this.editorView, 'editor:path-changed', this.subscribeToBuffer);
      this.subscribeToBuffer();
      this.subscribe(this.editorView, 'editor:will-be-removed', this.destroy);
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFGQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQyxhQUFjLE9BQUEsQ0FBUSxVQUFSLEVBQWQsVUFBRCxDQUFBOztBQUFBLEVBRUEsdUJBQUEsR0FBMEIsT0FBQSxDQUFRLDhCQUFSLENBRjFCLENBQUE7O0FBQUEsRUFHQSxzQkFBQSxHQUF5QixPQUFBLENBQVEsNkJBQVIsQ0FIekIsQ0FBQTs7QUFBQSxFQUtBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixJQUFBLFVBQVUsQ0FBQyxXQUFYLENBQXVCLHdCQUF2QixDQUFBLENBQUE7O0FBRWEsSUFBQSxrQ0FBRSxVQUFGLEdBQUE7QUFDWCxNQURZLElBQUMsQ0FBQSxhQUFBLFVBQ2IsQ0FBQTtBQUFBLG1FQUFBLENBQUE7QUFBQSwrQ0FBQSxDQUFBO0FBQUEsTUFBQyxJQUFDLENBQUEsU0FBVSxJQUFDLENBQUEsV0FBWCxNQUFGLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxNQUFELEdBQVUsRUFGVixDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsS0FBRCxHQUFTLEVBSFQsQ0FBQTtBQUFBLE1BS0EsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFDLENBQUEsVUFBWixFQUF3QixxQkFBeEIsRUFBK0MsSUFBQyxDQUFBLGlCQUFoRCxDQUxBLENBQUE7QUFBQSxNQU9BLElBQUMsQ0FBQSxpQkFBRCxDQUFBLENBUEEsQ0FBQTtBQUFBLE1BU0EsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFDLENBQUEsVUFBWixFQUF3Qix3QkFBeEIsRUFBa0QsSUFBQyxDQUFBLE9BQW5ELENBVEEsQ0FEVztJQUFBLENBRmI7O0FBQUEsdUNBY0EsY0FBQSxHQUFnQixTQUFBLEdBQUE7QUFDZCxVQUFBLElBQUE7QUFBQSxNQUFBLElBQUEsR0FBTyxJQUFDLENBQUEs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
//# sourceURL=/Users/andytlr/.atom/packages/atom-color-highlight/lib/atom-color-highlight-editor.coffee