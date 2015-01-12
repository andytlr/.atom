(function() {
  var Provider;

  module.exports = Provider = (function() {
    Provider.prototype.wordRegex = /\b\w*[a-zA-Z_-]+\w*\b/g;

    function Provider(editorView) {
      this.editorView = editorView;
      this.editor = editorView.editor;
      this.initialize.apply(this, arguments);
    }

    Provider.prototype.initialize = function() {};

    Provider.prototype.exclusive = false;

    Provider.prototype.buildSuggestions = function() {
      throw new Error("Subclass must implement a buildWordList(prefix) method");
    };

    Provider.prototype.confirm = function(suggestion) {
      return true;
    };

    Provider.prototype.prefixOfSelection = function(selection) {
      var lineRange, prefix, selectionRange;
      selectionRange = selection.getBufferRange();
      lineRange = [[selectionRange.start.row, 0], [selectionRange.end.row, this.editor.lineTextForBufferRow(selectionRange.end.row).length]];
      prefix = "";
      this.editor.getBuffer().scanInRange(this.wordRegex, lineRange, function(_arg) {
        var match, prefixOffset, range, stop;
        match = _arg.match, range = _arg.range, stop = _arg.stop;
        if (range.start.isGreaterThan(selectionRange.end)) {
          stop();
        }
        if (range.intersectsWith(selectionRange)) {
          prefixOffset = selectionRange.start.column - range.start.column;
          if (range.start.isLessThan(selectionRange.start)) {
            return prefix = match[0].slice(0, prefixOffset);
          }
        }
      });
      return prefix;
    };

    return Provider;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBR0E7QUFBQSxNQUFBLFFBQUE7O0FBQUEsRUFBQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osdUJBQUEsU0FBQSxHQUFXLHdCQUFYLENBQUE7O0FBRWEsSUFBQSxrQkFBRSxVQUFGLEdBQUE7QUFDWCxNQURZLElBQUMsQ0FBQSxhQUFBLFVBQ2IsQ0FBQTtBQUFBLE1BQUMsSUFBQyxDQUFBLFNBQVUsV0FBVixNQUFGLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxVQUFVLENBQUMsS0FBWixDQUFrQixJQUFsQixFQUF3QixTQUF4QixDQURBLENBRFc7SUFBQSxDQUZiOztBQUFBLHVCQU9BLFVBQUEsR0FBWSxTQUFBLEdBQUEsQ0FQWixDQUFBOztBQUFBLHVCQVlBLFNBQUEsR0FBVyxLQVpYLENBQUE7O0FBQUEsdUJBbUJBLGdCQUFBLEdBQWtCLFNBQUEsR0FBQTtBQUNoQixZQUFVLElBQUEsS0FBQSxDQUFNLHdEQUFOLENBQVYsQ0FEZ0I7SUFBQSxDQW5CbEIsQ0FBQTs7QUFBQSx1QkE2QkEsT0FBQSxHQUFTLFNBQUMsVUFBRCxHQUFBO0FBQ1AsYUFBTyxJQUFQLENBRE87SUFBQSxDQTdCVCxDQUFBOztBQUFBLHVCQXFDQSxpQkFBQSxHQUFtQixTQUFDLFNBQUQsR0FBQTtBQUNqQixVQUFBLGlDQUFBO0FBQUEsTUFBQSxjQUFBLEdBQWlCLFNBQVMsQ0FBQyxjQUFWLENBQUEsQ0FBakIsQ0FBQTtBQUFBLE1BQ0EsU0FBQSxHQUFZLENBQUMsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLEdBQXRCLEVBQTJCLENBQTNCLENBQUQsRUFBZ0MsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEdBQXBCLEVBQXlCLElBQUMsQ0FBQSxNQUFNLENBQUMsb0JBQVIsQ0FBNkIsY0FBYyxDQUFDLEdBQUcsQ0FBQyxHQUFoRCxDQUFvRCxDQUFDLE1BQTlFLENBQWhDLENBRFosQ0FBQTtBQUFBLE1BRUEsTUFBQSxHQUFTLEVBRlQsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUFSLENBQUEsQ0FBbUIsQ0FBQyxXQUFwQixDQUFnQyxJQUFDLENBQUEsU0FBakMsRUFBNEMsU0FBNUMsRUFBdUQsU0FBQyxJQUFELEdBQUE7QUFDckQsWUFBQSxnQ0FBQTtBQUFBLFFBRHVELGFBQUEsT0FBTyxhQUFBLE9BQU8sWUFBQSxJQUNyRSxDQUFBO0FBQUEsUUFBQSxJQUFVLEtBQUssQ0FBQyxLQUFLLENBQUMsYUFBWixDQUEwQixjQUFjLENBQUMsR0FBekMsQ0FBVjtBQUFBLFVBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQTtTQUFBO0FBRUEsUUFBQSxJQUFHLEtBQUssQ0FBQyxjQUFOLENBQXFCLGNBQXJCLENBQUg7QUFDRSxVQUFBLFlBQUEsR0FBZSxjQUFjLENBQUMsS0FBSyxDQUFDLE1BQXJCLEdBQThCLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBekQsQ0FBQTtBQUNBLFVBQUEsSUFBdUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFaLENBQXVCLGNBQWMsQ0FBQyxLQUF0QyxDQUF2QzttQkFBQSxNQUFBLEdBQVMsS0FBTSxDQUFBLENBQUEsQ0FBRyx3QkFBbEI7V0FGRjtTQUhxRDtNQUFBLENBQXZELENBSEEsQ0FBQTtBQVVBLGFBQU8sTUFBUCxDQVhpQjtJQUFBLENBckNuQixDQUFBOztvQkFBQTs7TUFGRixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/andytlr/.atom/packages/autocomplete-plus/lib/provider.coffee