(function() {
  var StyleText, config, styles, utils;

  config = require("./config");

  utils = require("./utils");

  styles = {
    code: {
      before: "`",
      after: "`"
    },
    bold: {
      before: "**",
      after: "**"
    },
    italic: {
      before: "_",
      after: "_"
    },
    keystroke: {
      before: "<kbd>",
      after: "</kbd>"
    },
    strikethrough: {
      before: "~~",
      after: "~~"
    },
    codeblock: function() {
      return config.get("codeblock");
    }
  };

  module.exports = StyleText = (function() {
    StyleText.prototype.editor = null;

    StyleText.prototype.style = null;

    function StyleText(style) {
      this.style = styles[style];
      if (typeof styles[style] === "function") {
        this.style = this.style();
      }
    }

    StyleText.prototype.display = function() {
      this.editor = atom.workspace.getActiveEditor();
      this.editor.buffer.beginTransaction();
      this.editor.getSelections().forEach((function(_this) {
        return function(selection) {
          var text;
          if (text = selection.getText()) {
            return _this.toggleStyle(selection, text);
          } else {
            return _this.insertEmptyStyle(selection);
          }
        };
      })(this));
      return this.editor.buffer.commitTransaction();
    };

    StyleText.prototype.toggleStyle = function(selection, text) {
      if (this.isStyleOn(text)) {
        text = this.removeStyle(text);
      } else {
        text = this.addStyle(text);
      }
      return selection.insertText(text);
    };

    StyleText.prototype.insertEmptyStyle = function(selection) {
      var column, row, _ref;
      selection.insertText(this.addStyle(""));
      _ref = selection.cursor.getBufferPosition(), row = _ref.row, column = _ref.column;
      return selection.cursor.setBufferPosition([row, column - this.style.after.length]);
    };

    StyleText.prototype.isStyleOn = function(text) {
      if (text) {
        return this.getStylePattern().test(text);
      }
    };

    StyleText.prototype.addStyle = function(text) {
      return "" + this.style.before + text + this.style.after;
    };

    StyleText.prototype.removeStyle = function(text) {
      var matches;
      matches = this.getStylePattern().exec(text);
      return matches.slice(1).join("");
    };

    StyleText.prototype.getStylePattern = function() {
      var after, before;
      before = this.style.regexBefore || utils.regexpEscape(this.style.before);
      after = this.style.regexAfter || utils.regexpEscape(this.style.after);
      return RegExp("^([\\s\\S]*?)(?:" + before + "([\\s\\S]*?)" + after + "([\\s\\S]+?))*" + before + "([\\s\\S]*?)" + after + "([\\s\\S]*)$", "gm");
    };

    return StyleText;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGdDQUFBOztBQUFBLEVBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSLENBQVQsQ0FBQTs7QUFBQSxFQUNBLEtBQUEsR0FBUSxPQUFBLENBQVEsU0FBUixDQURSLENBQUE7O0FBQUEsRUFJQSxNQUFBLEdBQ0U7QUFBQSxJQUFBLElBQUEsRUFBTTtBQUFBLE1BQUEsTUFBQSxFQUFRLEdBQVI7QUFBQSxNQUFhLEtBQUEsRUFBTyxHQUFwQjtLQUFOO0FBQUEsSUFDQSxJQUFBLEVBQU07QUFBQSxNQUFBLE1BQUEsRUFBUSxJQUFSO0FBQUEsTUFBYyxLQUFBLEVBQU8sSUFBckI7S0FETjtBQUFBLElBRUEsTUFBQSxFQUFRO0FBQUEsTUFBQSxNQUFBLEVBQVEsR0FBUjtBQUFBLE1BQWEsS0FBQSxFQUFPLEdBQXBCO0tBRlI7QUFBQSxJQUdBLFNBQUEsRUFBVztBQUFBLE1BQUEsTUFBQSxFQUFRLE9BQVI7QUFBQSxNQUFpQixLQUFBLEVBQU8sUUFBeEI7S0FIWDtBQUFBLElBSUEsYUFBQSxFQUFlO0FBQUEsTUFBQSxNQUFBLEVBQVEsSUFBUjtBQUFBLE1BQWMsS0FBQSxFQUFPLElBQXJCO0tBSmY7QUFBQSxJQUtBLFNBQUEsRUFBVyxTQUFBLEdBQUE7YUFBRyxNQUFNLENBQUMsR0FBUCxDQUFXLFdBQVgsRUFBSDtJQUFBLENBTFg7R0FMRixDQUFBOztBQUFBLEVBWUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLHdCQUFBLE1BQUEsR0FBUSxJQUFSLENBQUE7O0FBQUEsd0JBQ0EsS0FBQSxHQUFPLElBRFAsQ0FBQTs7QUFHYSxJQUFBLG1CQUFDLEtBQUQsR0FBQTtBQUNYLE1BQUEsSUFBQyxDQUFBLEtBQUQsR0FBUyxNQUFPLENBQUEsS0FBQSxDQUFoQixDQUFBO0FBQ0EsTUFBQSxJQUFx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
//# sourceURL=/Users/andytlr/.atom/packages/markdown-writer/lib/style-text.coffee