(function() {
  module.exports = {
    activate: function() {
      return atom.workspaceView.on('pane:item-removed', function() {
        if (atom.workspace.getEditors().length === 0) {
          return atom.close();
        }
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBRUU7QUFBQSxJQUFBLFFBQUEsRUFBVSxTQUFBLEdBQUE7YUFDUixJQUFJLENBQUMsYUFBYSxDQUFDLEVBQW5CLENBQXNCLG1CQUF0QixFQUEyQyxTQUFBLEdBQUE7QUFDekMsUUFBQSxJQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBZixDQUFBLENBQTJCLENBQUMsTUFBNUIsS0FBc0MsQ0FBekM7aUJBQ0UsSUFBSSxDQUFDLEtBQUwsQ0FBQSxFQURGO1NBRHlDO01BQUEsQ0FBM0MsRUFEUTtJQUFBLENBQVY7R0FGRixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/andytlr/.atom/packages/close-after-last-tab/lib/close-after-last-tab.coffee