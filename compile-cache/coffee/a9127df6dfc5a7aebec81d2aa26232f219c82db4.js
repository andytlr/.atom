(function() {
  var GitDiffView, ReactGitDiffView;

  GitDiffView = require('./git-diff-view');

  ReactGitDiffView = require('./react-git-diff-view');

  module.exports = {
    configDefaults: {
      showIconsInEditorGutter: false
    },
    activate: function() {
      return atom.workspaceView.eachEditorView(function(editorView) {
        if ((atom.project.getRepo() != null) && editorView.attached && (editorView.getPane() != null)) {
          if (editorView.hasClass('react')) {
            return new ReactGitDiffView(editorView);
          } else {
            return new GitDiffView(editorView);
          }
        }
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDZCQUFBOztBQUFBLEVBQUEsV0FBQSxHQUFjLE9BQUEsQ0FBUSxpQkFBUixDQUFkLENBQUE7O0FBQUEsRUFDQSxnQkFBQSxHQUFtQixPQUFBLENBQVEsdUJBQVIsQ0FEbkIsQ0FBQTs7QUFBQSxFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLGNBQUEsRUFDRTtBQUFBLE1BQUEsdUJBQUEsRUFBeUIsS0FBekI7S0FERjtBQUFBLElBR0EsUUFBQSxFQUFVLFNBQUEsR0FBQTthQUNSLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBbkIsQ0FBa0MsU0FBQyxVQUFELEdBQUE7QUFDaEMsUUFBQSxJQUFHLGdDQUFBLElBQTRCLFVBQVUsQ0FBQyxRQUF2QyxJQUFvRCw4QkFBdkQ7QUFDRSxVQUFBLElBQUcsVUFBVSxDQUFDLFFBQVgsQ0FBb0IsT0FBcEIsQ0FBSDttQkFDTSxJQUFBLGdCQUFBLENBQWlCLFVBQWpCLEVBRE47V0FBQSxNQUFBO21CQUdNLElBQUEsV0FBQSxDQUFZLFVBQVosRUFITjtXQURGO1NBRGdDO01BQUEsQ0FBbEMsRUFEUTtJQUFBLENBSFY7R0FKRixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/andytlr/.atom/packages/git-diff/lib/git-diff.coffee