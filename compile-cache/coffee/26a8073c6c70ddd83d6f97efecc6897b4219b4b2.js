(function() {
  var MarkdownFormat, markdownfmt;

  markdownfmt = require('./markdownfmt.js');

  MarkdownFormat = (function() {
    function MarkdownFormat() {
      atom.workspace.eachEditor((function(_this) {
        return function(editor) {
          return _this.handleSave(editor);
        };
      })(this));
    }

    MarkdownFormat.prototype.destroy = function() {
      return atom.unsubscribe();
    };

    MarkdownFormat.prototype.handleSave = function(editor) {
      var buffer;
      buffer = editor.getBuffer();
      return atom.subscribe(buffer, 'will-be-saved', (function(_this) {
        return function() {
          if (editor.getGrammar().scopeName === 'source.gfm') {
            return buffer.setTextViaDiff(markdownfmt.ProcessMarkdown(buffer.getText()));
          }
        };
      })(this));
    };

    return MarkdownFormat;

  })();

  module.exports = {
    activate: function() {
      return this.markdownFormat = new MarkdownFormat();
    },
    deactivate: function() {
      return this.markdownFormat.destroy();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDJCQUFBOztBQUFBLEVBQUEsV0FBQSxHQUFjLE9BQUEsQ0FBUSxrQkFBUixDQUFkLENBQUE7O0FBQUEsRUFFTTtBQUNTLElBQUEsd0JBQUEsR0FBQTtBQUNYLE1BQUEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFmLENBQTBCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLE1BQUQsR0FBQTtpQkFDeEIsS0FBQyxDQUFBLFVBQUQsQ0FBWSxNQUFaLEVBRHdCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBMUIsQ0FBQSxDQURXO0lBQUEsQ0FBYjs7QUFBQSw2QkFJQSxPQUFBLEdBQVMsU0FBQSxHQUFBO2FBQ1AsSUFBSSxDQUFDLFdBQUwsQ0FBQSxFQURPO0lBQUEsQ0FKVCxDQUFBOztBQUFBLDZCQU9BLFVBQUEsR0FBWSxTQUFDLE1BQUQsR0FBQTtBQUNWLFVBQUEsTUFBQTtBQUFBLE1BQUEsTUFBQSxHQUFTLE1BQU0sQ0FBQyxTQUFQLENBQUEsQ0FBVCxDQUFBO2FBQ0EsSUFBSSxDQUFDLFNBQUwsQ0FBZSxNQUFmLEVBQXVCLGVBQXZCLEVBQXdDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDdEMsVUFBQSxJQUFHLE1BQU0sQ0FBQyxVQUFQLENBQUEsQ0FBbUIsQ0FBQyxTQUFwQixLQUFpQyxZQUFwQzttQkFDRSxNQUFNLENBQUMsY0FBUCxDQUFzQixXQUFXLENBQUMsZUFBWixDQUE0QixNQUFNLENBQUMsT0FBUCxDQUFBLENBQTVCLENBQXRCLEVBREY7V0FEc0M7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF4QyxFQUZVO0lBQUEsQ0FQWixDQUFBOzswQkFBQTs7TUFIRixDQUFBOztBQUFBLEVBZ0JBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLFFBQUEsRUFBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsY0FBRCxHQUFzQixJQUFBLGNBQUEsQ0FBQSxFQURkO0lBQUEsQ0FBVjtBQUFBLElBR0EsVUFBQSxFQUFZLFNBQUEsR0FBQTthQUNWLElBQUMsQ0FBQSxjQUFjLENBQUMsT0FBaEIsQ0FBQSxFQURVO0lBQUEsQ0FIWjtHQWpCRixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/andytlr/.atom/packages/markdown-format/lib/markdown-format.coffee