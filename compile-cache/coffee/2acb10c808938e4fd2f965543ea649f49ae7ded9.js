(function() {
  module.exports = {
    activate: function() {
      return atom.workspaceView.command('smarter-delete-line:delete-to-first-character', '.editor', function() {
        var editor;
        editor = atom.workspaceView.getActivePaneItem();
        return editor.mutateSelectedText(function(selection) {
          if (selection.isEmpty) {
            selection.selectToFirstCharacterOfLine();
          }
          return selection.deleteSelectedText();
        });
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLFFBQUEsRUFBVSxTQUFBLEdBQUE7YUFDUixJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTJCLCtDQUEzQixFQUE0RSxTQUE1RSxFQUF1RixTQUFBLEdBQUE7QUFDckYsWUFBQSxNQUFBO0FBQUEsUUFBQSxNQUFBLEdBQVMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxpQkFBbkIsQ0FBQSxDQUFULENBQUE7ZUFFQSxNQUFNLENBQUMsa0JBQVAsQ0FBMEIsU0FBQyxTQUFELEdBQUE7QUFDeEIsVUFBQSxJQUFHLFNBQVMsQ0FBQyxPQUFiO0FBQ0UsWUFBQSxTQUFTLENBQUMsNEJBQVYsQ0FBQSxDQUFBLENBREY7V0FBQTtpQkFHQSxTQUFTLENBQUMsa0JBQVYsQ0FBQSxFQUp3QjtRQUFBLENBQTFCLEVBSHFGO01BQUEsQ0FBdkYsRUFEUTtJQUFBLENBQVY7R0FERixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/andytlr/.atom/packages/smarter-delete-line/lib/smarter-delete-line.coffee