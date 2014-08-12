(function() {
  var DiffListView, GitDiffView, ReactGitDiffView, diffListView, toggleDiffList;

  GitDiffView = require('./git-diff-view');

  ReactGitDiffView = require('./react-git-diff-view');

  DiffListView = null;

  diffListView = null;

  toggleDiffList = function() {
    if (DiffListView == null) {
      DiffListView = require('./diff-list-view');
    }
    if (diffListView == null) {
      diffListView = new DiffListView();
    }
    return diffListView.toggle();
  };

  module.exports = {
    configDefaults: {
      showIconsInEditorGutter: false
    },
    activate: function() {
      return atom.workspaceView.eachEditorView(function(editorView) {
        if ((atom.project.getRepo() != null) && editorView.attached && (editorView.getPane() != null)) {
          if (editorView.hasClass('react')) {
            new ReactGitDiffView(editorView);
          } else {
            new GitDiffView(editorView);
          }
          return editorView.command('git-diff:toggle-diff-list', toggleDiffList);
        }
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHlFQUFBOztBQUFBLEVBQUEsV0FBQSxHQUFjLE9BQUEsQ0FBUSxpQkFBUixDQUFkLENBQUE7O0FBQUEsRUFDQSxnQkFBQSxHQUFtQixPQUFBLENBQVEsdUJBQVIsQ0FEbkIsQ0FBQTs7QUFBQSxFQUVBLFlBQUEsR0FBZSxJQUZmLENBQUE7O0FBQUEsRUFLQSxZQUFBLEdBQWUsSUFMZixDQUFBOztBQUFBLEVBTUEsY0FBQSxHQUFpQixTQUFBLEdBQUE7O01BQ2YsZUFBZ0IsT0FBQSxDQUFRLGtCQUFSO0tBQWhCOztNQUNBLGVBQW9CLElBQUEsWUFBQSxDQUFBO0tBRHBCO1dBRUEsWUFBWSxDQUFDLE1BQWIsQ0FBQSxFQUhlO0VBQUEsQ0FOakIsQ0FBQTs7QUFBQSxFQVdBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLGNBQUEsRUFDRTtBQUFBLE1BQUEsdUJBQUEsRUFBeUIsS0FBekI7S0FERjtBQUFBLElBR0EsUUFBQSxFQUFVLFNBQUEsR0FBQTthQUNSLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBbkIsQ0FBa0MsU0FBQyxVQUFELEdBQUE7QUFDaEMsUUFBQSxJQUFHLGdDQUFBLElBQTRCLFVBQVUsQ0FBQyxRQUF2QyxJQUFvRCw4QkFBdkQ7QUFDRSxVQUFBLElBQUcsVUFBVSxDQUFDLFFBQVgsQ0FBb0IsT0FBcEIsQ0FBSDtBQUNFLFlBQUksSUFBQSxnQkFBQSxDQUFpQixVQUFqQixDQUFKLENBREY7V0FBQSxNQUFBO0FBR0UsWUFBSSxJQUFBLFdBQUEsQ0FBWSxVQUFaLENBQUosQ0FIRjtXQUFBO2lCQUtBLFVBQVUsQ0FBQyxPQUFYLENBQW1CLDJCQUFuQixFQUFnRCxjQUFoRCxFQU5GO1NBRGdDO01BQUEsQ0FBbEMsRUFEUTtJQUFBLENBSFY7R0FaRixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/andytlr/.atom/packages/git-diff/lib/main.coffee