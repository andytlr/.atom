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
      return atom.workspace.observeTextEditors(function(editor) {
        if (atom.project.getRepositories().length === 0) {
          return;
        }
        new GitDiffView(editor);
        return atom.commands.add(atom.views.getView(editor), 'git-diff:toggle-diff-list', toggleDiffList);
      });
    },
    deactivate: function() {
      if (diffListView != null) {
        diffListView.cancel();
      }
      return diffListView = null;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVEQUFBOztBQUFBLEVBQUEsV0FBQSxHQUFjLE9BQUEsQ0FBUSxpQkFBUixDQUFkLENBQUE7O0FBQUEsRUFDQSxZQUFBLEdBQWUsSUFEZixDQUFBOztBQUFBLEVBR0EsWUFBQSxHQUFlLElBSGYsQ0FBQTs7QUFBQSxFQUlBLGNBQUEsR0FBaUIsU0FBQSxHQUFBOztNQUNmLGVBQWdCLE9BQUEsQ0FBUSxrQkFBUjtLQUFoQjs7TUFDQSxlQUFvQixJQUFBLFlBQUEsQ0FBQTtLQURwQjtXQUVBLFlBQVksQ0FBQyxNQUFiLENBQUEsRUFIZTtFQUFBLENBSmpCLENBQUE7O0FBQUEsRUFTQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxNQUFBLEVBQ0U7QUFBQSxNQUFBLHVCQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsS0FEVDtPQURGO0tBREY7QUFBQSxJQUtBLFFBQUEsRUFBVSxTQUFBLEdBQUE7YUFDUixJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFmLENBQWtDLFNBQUMsTUFBRCxHQUFBO0FBQ2hDLFFBQUEsSUFBVSxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWIsQ0FBQSxDQUE4QixDQUFDLE1BQS9CLEtBQXlDLENBQW5EO0FBQUEsZ0JBQUEsQ0FBQTtTQUFBO0FBQUEsUUFFSSxJQUFBLFdBQUEsQ0FBWSxNQUFaLENBRkosQ0FBQTtlQUdBLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsTUFBbkIsQ0FBbEIsRUFBOEMsMkJBQTlDLEVBQTJFLGNBQTNFLEVBSmdDO01BQUEsQ0FBbEMsRUFEUTtJQUFBLENBTFY7QUFBQSxJQVlBLFVBQUEsRUFBWSxTQUFBLEdBQUE7O1FBQ1YsWUFBWSxDQUFFLE1BQWQsQ0FBQTtPQUFBO2FBQ0EsWUFBQSxHQUFlLEtBRkw7SUFBQSxDQVpaO0dBVkYsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/andytlr/.atom/packages/git-diff/lib/main.coffee