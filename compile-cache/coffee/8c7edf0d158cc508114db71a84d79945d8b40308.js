(function() {
  var GitDiffView;

  GitDiffView = require('./git-diff-view');

  module.exports = {
    configDefaults: {
      showIconsInEditorGutter: false
    },
    activate: function() {
      return atom.workspaceView.eachEditorView(function(editor) {
        if ((atom.project.getRepo() != null) && editor.attached && (editor.getPane() != null)) {
          return new GitDiffView(editor);
        }
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLFdBQUE7O0FBQUEsRUFBQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGlCQUFSLENBQWQsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLGNBQUEsRUFDRTtBQUFBLE1BQUEsdUJBQUEsRUFBeUIsS0FBekI7S0FERjtBQUFBLElBR0EsUUFBQSxFQUFVLFNBQUEsR0FBQTthQUNSLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBbkIsQ0FBa0MsU0FBQyxNQUFELEdBQUE7QUFDaEMsUUFBQSxJQUFHLGdDQUFBLElBQTRCLE1BQU0sQ0FBQyxRQUFuQyxJQUFnRCwwQkFBbkQ7aUJBQ00sSUFBQSxXQUFBLENBQVksTUFBWixFQUROO1NBRGdDO01BQUEsQ0FBbEMsRUFEUTtJQUFBLENBSFY7R0FIRixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/andytlr/.atom/packages/git-diff/lib/git-diff.coffee