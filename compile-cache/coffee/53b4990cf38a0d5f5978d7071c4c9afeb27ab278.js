(function() {
  var StyleLine, styles, utils;

  utils = require("./utils");

  styles = {
    h1: {
      before: "# ",
      after: ""
    },
    h2: {
      before: "## ",
      after: ""
    },
    h3: {
      before: "### ",
      after: ""
    },
    h4: {
      before: "#### ",
      after: ""
    },
    h5: {
      before: "##### ",
      after: ""
    },
    ul: {
      before: "- ",
      after: "",
      prefix: "-|\\*|\\d+\\."
    },
    ol: {
      before: "0. ",
      after: "",
      prefix: "-|\\*|\\d+\\."
    },
    task: {
      before: "- [ ] ",
      after: "",
      prefix: "- \\[ ]|- \\[x]|- \\[X]|-|\\*"
    },
    taskdone: {
      before: "- [x] ",
      after: "",
      prefix: "- \\[ ]|- \\[x]|- \\[X]|-|\\*"
    },
    blockquote: {
      before: "> ",
      after: ""
    }
  };

  module.exports = StyleLine = (function() {
    StyleLine.prototype.editor = null;

    StyleLine.prototype.style = null;

    function StyleLine(style) {
      this.style = styles[style];
    }

    StyleLine.prototype.display = function() {
      this.editor = atom.workspace.getActiveEditor();
      this.editor.buffer.beginTransaction();
      this.editor.getSelections().forEach((function(_this) {
        return function(selection) {
          var line, range, row, rows, _i, _ref, _ref1;
          range = selection.getBufferRange();
          rows = selection.getBufferRowRange();
          for (row = _i = _ref = rows[0], _ref1 = rows[1]; _ref <= _ref1 ? _i <= _ref1 : _i >= _ref1; row = _ref <= _ref1 ? ++_i : --_i) {
            selection.cursor.setBufferPosition([row, 0]);
            if (line = _this.getLine(selection)) {
              _this.toggleStyle(selection, line);
            } else {
              _this.insertEmptyStyle(selection);
            }
          }
          if (rows[0] !== rows[1]) {
            return selection.setBufferRange(range);
          }
        };
      })(this));
      return this.editor.buffer.commitTransaction();
    };

    StyleLine.prototype.getLine = function(selection) {
      selection.selectToEndOfLine();
      return selection.getText();
    };

    StyleLine.prototype.toggleStyle = function(selection, text) {
      if (this.isStyleOn(text)) {
        text = this.removeStyle(text);
      } else {
        text = this.addStyle(text);
      }
      return selection.insertText(text);
    };

    StyleLine.prototype.insertEmptyStyle = function(selection) {
      return selection.insertText(this.addStyle(""));
    };

    StyleLine.prototype.isStyleOn = function(text) {
      return this.getStylePattern().test(text);
    };

    StyleLine.prototype.addStyle = function(text) {
      var match, prefix;
      prefix = this.style.prefix || this.style.before[0];
      match = this.getStylePattern("(?:" + prefix + ")*\\s?").exec(text);
      return "" + match[1] + this.style.before + match[2] + this.style.after;
    };

    StyleLine.prototype.removeStyle = function(text) {
      var matches;
      matches = this.getStylePattern().exec(text);
      return matches.slice(1).join("");
    };

    StyleLine.prototype.getStylePattern = function(before, after) {
      if (before == null) {
        before = utils.regexpEscape(this.style.before);
      }
      if (after == null) {
        after = utils.regexpEscape(this.style.after);
      }
      return RegExp("^(\\s*)" + before + "(.*?)" + after + "$");
    };

    return StyleLine;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHdCQUFBOztBQUFBLEVBQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSLENBQVIsQ0FBQTs7QUFBQSxFQUVBLE1BQUEsR0FDRTtBQUFBLElBQUEsRUFBQSxFQUFJO0FBQUEsTUFBQSxNQUFBLEVBQVEsSUFBUjtBQUFBLE1BQWMsS0FBQSxFQUFPLEVBQXJCO0tBQUo7QUFBQSxJQUNBLEVBQUEsRUFBSTtBQUFBLE1BQUEsTUFBQSxFQUFRLEtBQVI7QUFBQSxNQUFlLEtBQUEsRUFBTyxFQUF0QjtLQURKO0FBQUEsSUFFQSxFQUFBLEVBQUk7QUFBQSxNQUFBLE1BQUEsRUFBUSxNQUFSO0FBQUEsTUFBZ0IsS0FBQSxFQUFPLEVBQXZCO0tBRko7QUFBQSxJQUdBLEVBQUEsRUFBSTtBQUFBLE1BQUEsTUFBQSxFQUFRLE9BQVI7QUFBQSxNQUFpQixLQUFBLEVBQU8sRUFBeEI7S0FISjtBQUFBLElBSUEsRUFBQSxFQUFJO0FBQUEsTUFBQSxNQUFBLEVBQVEsUUFBUjtBQUFBLE1BQWtCLEtBQUEsRUFBTyxFQUF6QjtLQUpKO0FBQUEsSUFLQSxFQUFBLEVBQUk7QUFBQSxNQUFBLE1BQUEsRUFBUSxJQUFSO0FBQUEsTUFBYyxLQUFBLEVBQU8sRUFBckI7QUFBQSxNQUF5QixNQUFBLEVBQVEsZUFBakM7S0FMSjtBQUFBLElBTUEsRUFBQSxFQUFJO0FBQUEsTUFBQSxNQUFBLEVBQVEsS0FBUjtBQUFBLE1BQWUsS0FBQSxFQUFPLEVBQXRCO0FBQUEsTUFBMEIsTUFBQSxFQUFRLGVBQWxDO0tBTko7QUFBQSxJQU9BLElBQUEsRUFBTTtBQUFBLE1BQUEsTUFBQSxFQUFRLFFBQVI7QUFBQSxNQUFrQixLQUFBLEVBQU8sRUFBekI7QUFBQSxNQUE2QixNQUFBLEVBQVEsK0JBQXJDO0tBUE47QUFBQSxJQVFB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
//# sourceURL=/Users/andytlr/.atom/packages/markdown-writer/lib/style-line.coffee