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
    config: {
      showIconsInEditorGutter: {
        type: 'boolean',
        "default": false
      }
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVEQUFBOztBQUFBLEVBQUEsV0FBQSxHQUFjLE9BQUEsQ0FBUSxpQkFBUixDQUFkLENBQUE7O0FBQUEsRUFDQSxZQUFBLEdBQWUsSUFEZixDQUFBOztBQUFBLEVBR0EsWUFBQSxHQUFlLElBSGYsQ0FBQTs7QUFBQSxFQUlBLGNBQUEsR0FBaUIsU0FBQSxHQUFBOztNQUNmLGVBQWdCLE9BQUEsQ0FBUSxrQkFBUjtLQUFoQjs7TUFDQSxlQUFvQixJQUFBLFlBQUEsQ0FBQTtLQURwQjtXQUVBLFlBQVksQ0FBQyxNQUFiLENBQUEsRUFIZTtFQUFBLENBSmpCLENBQUE7O0FBQUEsRUFTQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxNQUFBLEVBQ0U7QUFBQSxNQUFBLHVCQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsS0FEVDtPQURGO0tBREY7QUFBQSxJQUtBLFFBQUEsRUFBVSxTQUFBLEdBQUE7YUFDUixJQUFJLENBQUMsYUFBYSxDQUFDLGNBQW5CLENBQWtDLFNBQUMsVUFBRCxHQUFBO0FBQ2hDLFFBQUEsSUFBRyxnQ0FBQSxJQUE0QixVQUFVLENBQUMsUUFBdkMsSUFBb0QsOEJBQXZEO0FBQ0UsVUFBSSxJQUFBLFdBQUEsQ0FBWSxVQUFaLENBQUosQ0FBQTtpQkFFQSxVQUFVLENBQUMsT0FBWCxDQUFtQiwyQkFBbkIsRUFBZ0QsY0FBaEQsRUFIRjtTQURnQztNQUFBLENBQWxDLEVBRFE7SUFBQSxDQUxWO0dBVkYsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/andytlr/.atom/packages/git-diff/lib/main.coffee