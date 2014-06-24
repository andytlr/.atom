(function() {
  module.exports = {
    activate: function(state) {
      return atom.workspaceView.command("clean:toggle", (function(_this) {
        return function() {
          return _this.toggle();
        };
      })(this));
    },
    toggle: function() {
      var workspace;
      workspace = atom.workspaceView;
      return workspace.toggleClass('clean');
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLFFBQUEsRUFBVSxTQUFDLEtBQUQsR0FBQTthQUNSLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBbkIsQ0FBMkIsY0FBM0IsRUFBMkMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFBRyxLQUFDLENBQUEsTUFBRCxDQUFBLEVBQUg7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEzQyxFQURRO0lBQUEsQ0FBVjtBQUFBLElBR0EsTUFBQSxFQUFRLFNBQUEsR0FBQTtBQUNOLFVBQUEsU0FBQTtBQUFBLE1BQUEsU0FBQSxHQUFZLElBQUksQ0FBQyxhQUFqQixDQUFBO2FBRUEsU0FBUyxDQUFDLFdBQVYsQ0FBc0IsT0FBdEIsRUFITTtJQUFBLENBSFI7R0FERixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/andytlr/.atom/packages/Clean/lib/clean.coffee