(function() {
  var MarkdownFormat, Spawn;

  Spawn = require('child_process').spawn;

  MarkdownFormat = (function() {
    function MarkdownFormat() {
      atom.workspace.eachEditor((function(_this) {
        return function(editor) {
          return _this.handleSave(editor);
        };
      })(this));
    }

    MarkdownFormat.prototype.destroy = function() {};

    MarkdownFormat.prototype.handleSave = function(editor) {
      var buffer;
      buffer = editor.getBuffer();
      return buffer.on('saved', (function(_this) {
        return function() {
          var markdownfmt, options;
          if (editor.getGrammar().scopeName === 'source.gfm') {
            options = ['-w', editor.getUri()];
            return markdownfmt = Spawn(atom.config.get('markdown-format.pathToBinary'), options);
          }
        };
      })(this));
    };

    return MarkdownFormat;

  })();

  module.exports = {
    configDefaults: {
      pathToBinary: 'markdownfmt'
    },
    activate: function() {
      return this.markdownFormat = new MarkdownFormat();
    },
    deactivate: function() {
      return this.markdownFormat.destroy();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFCQUFBOztBQUFBLEVBQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxlQUFSLENBQXdCLENBQUMsS0FBakMsQ0FBQTs7QUFBQSxFQUVNO0FBQ1MsSUFBQSx3QkFBQSxHQUFBO0FBQ1gsTUFBQSxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQWYsQ0FBMEIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsTUFBRCxHQUFBO2lCQUN4QixLQUFDLENBQUEsVUFBRCxDQUFZLE1BQVosRUFEd0I7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUExQixDQUFBLENBRFc7SUFBQSxDQUFiOztBQUFBLDZCQUlBLE9BQUEsR0FBUyxTQUFBLEdBQUEsQ0FKVCxDQUFBOztBQUFBLDZCQU1BLFVBQUEsR0FBWSxTQUFDLE1BQUQsR0FBQTtBQUNWLFVBQUEsTUFBQTtBQUFBLE1BQUEsTUFBQSxHQUFTLE1BQU0sQ0FBQyxTQUFQLENBQUEsQ0FBVCxDQUFBO2FBQ0EsTUFBTSxDQUFDLEVBQVAsQ0FBVSxPQUFWLEVBQW1CLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDakIsY0FBQSxvQkFBQTtBQUFBLFVBQUEsSUFBRyxNQUFNLENBQUMsVUFBUCxDQUFBLENBQW1CLENBQUMsU0FBcEIsS0FBaUMsWUFBcEM7QUFDRSxZQUFBLE9BQUEsR0FBVSxDQUNSLElBRFEsRUFFUixNQUFNLENBQUMsTUFBUCxDQUFBLENBRlEsQ0FBVixDQUFBO21CQUlBLFdBQUEsR0FBYyxLQUFBLENBQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDhCQUFoQixDQUFOLEVBQXVELE9BQXZELEVBTGhCO1dBRGlCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkIsRUFGVTtJQUFBLENBTlosQ0FBQTs7MEJBQUE7O01BSEYsQ0FBQTs7QUFBQSxFQW1CQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxjQUFBLEVBQ0U7QUFBQSxNQUFBLFlBQUEsRUFBYyxhQUFkO0tBREY7QUFBQSxJQUdBLFFBQUEsRUFBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsY0FBRCxHQUFzQixJQUFBLGNBQUEsQ0FBQSxFQURkO0lBQUEsQ0FIVjtBQUFBLElBTUEsVUFBQSxFQUFZLFNBQUEsR0FBQTthQUNWLElBQUMsQ0FBQSxjQUFjLENBQUMsT0FBaEIsQ0FBQSxFQURVO0lBQUEsQ0FOWjtHQXBCRixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/andytlr/.atom/packages/markdown-format/lib/markdown-format.coffee