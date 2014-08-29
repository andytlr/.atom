(function() {
  var DiffListView, GitDiffView, diffListView, toggleDiffList;

  GitDiffView = require('./git-diff-view');

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
          new GitDiffView(editorView);
          return editorView.command('git-diff:toggle-diff-list', toggleDiffList);
        }
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVEQUFBOztBQUFBLEVBQUEsV0FBQSxHQUFjLE9BQUEsQ0FBUSxpQkFBUixDQUFkLENBQUE7O0FBQUEsRUFDQSxZQUFBLEdBQWUsSUFEZixDQUFBOztBQUFBLEVBSUEsWUFBQSxHQUFlLElBSmYsQ0FBQTs7QUFBQSxFQUtBLGNBQUEsR0FBaUIsU0FBQSxHQUFBOztNQUNmLGVBQWdCLE9BQUEsQ0FBUSxrQkFBUjtLQUFoQjs7TUFDQSxlQUFvQixJQUFBLFlBQUEsQ0FBQTtLQURwQjtXQUVBLFlBQVksQ0FBQyxNQUFiLENBQUEsRUFIZTtFQUFBLENBTGpCLENBQUE7O0FBQUEsRUFVQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxjQUFBLEVBQ0U7QUFBQSxNQUFBLHVCQUFBLEVBQXlCLEtBQXpCO0tBREY7QUFBQSxJQUdBLFFBQUEsRUFBVSxTQUFBLEdBQUE7YUFDUixJQUFJLENBQUMsYUFBYSxDQUFDLGNBQW5CLENBQWtDLFNBQUMsVUFBRCxHQUFBO0FBQ2hDLFFBQUEsSUFBRyxnQ0FBQSxJQUE0QixVQUFVLENBQUMsUUFBdkMsSUFBb0QsOEJBQXZEO0FBQ0UsVUFBSSxJQUFBLFdBQUEsQ0FBWSxVQUFaLENBQUosQ0FBQTtpQkFFQSxVQUFVLENBQUMsT0FBWCxDQUFtQiwyQkFBbkIsRUFBZ0QsY0FBaEQsRUFIRjtTQURnQztNQUFBLENBQWxDLEVBRFE7SUFBQSxDQUhWO0dBWEYsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/andytlr/.atom/packages/git-diff/lib/main.coffee