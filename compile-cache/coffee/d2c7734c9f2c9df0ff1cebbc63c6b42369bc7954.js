(function() {
  var ReactGitDiffView, Subscriber,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Subscriber = require('emissary').Subscriber;

  module.exports = ReactGitDiffView = (function() {
    Subscriber.includeInto(ReactGitDiffView);

    function ReactGitDiffView(editorView) {
      var _ref;
      this.editorView = editorView;
      this.addDecorations = __bind(this.addDecorations, this);
      this.removeDecorations = __bind(this.removeDecorations, this);
      this.updateDiffs = __bind(this.updateDiffs, this);
      this.subscribeToBuffer = __bind(this.subscribeToBuffer, this);
      _ref = this.editorView, this.editor = _ref.editor, this.gutter = _ref.gutter;
      this.decorations = {};
      this.subscribe(this.editorView, 'editor:path-changed', this.subscribeToBuffer);
      this.subscribe(atom.project.getRepo(), 'statuses-changed', (function(_this) {
        return function() {
          return _this.scheduleUpdate();
        };
      })(this));
      this.subscribe(atom.project.getRepo(), 'status-changed', (function(_this) {
        return function(path) {
          if (path === _this.editor.getPath()) {
            return _this.scheduleUpdate();
          }
        };
      })(this));
      this.subscribeToBuffer();
      this.subscribe(this.editorView, 'editor:will-be-removed', (function(_this) {
        return function() {
          _this.unsubscribe();
          return _this.unsubscribeFromBuffer();
        };
      })(this));
      this.subscribeToCommand(this.editorView, 'git-diff:move-to-next-diff', (function(_this) {
        return function() {
          return _this.moveToNextDiff();
        };
      })(this));
      this.subscribeToCommand(this.editorView, 'git-diff:move-to-previous-diff', (function(_this) {
        return function() {
          return _this.moveToPreviousDiff();
        };
      })(this));
      this.subscribe(atom.config.observe('git-diff.showIconsInEditorGutter', (function(_this) {
        return function() {
          if (atom.config.get('git-diff.showIconsInEditorGutter')) {
            return _this.gutter.addClass('git-diff-icon');
          } else {
            return _this.gutter.removeClass('git-diff-icon');
          }
        };
      })(this)));
    }

    ReactGitDiffView.prototype.moveToNextDiff = function() {
      var cursorLineNumber, firstDiffLineNumber, newStart, nextDiffLineNumber, _i, _len, _ref, _ref1;
      cursorLineNumber = this.editor.getCursorBufferPosition().row + 1;
      nextDiffLineNumber = null;
      firstDiffLineNumber = null;
      _ref1 = (_ref = this.diffs) != null ? _ref : [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        newStart = _ref1[_i].newStart;
        if (newStart > cursorLineNumber) {
          if (nextDiffLineNumber == null) {
            nextDiffLineNumber = newStart - 1;
          }
          nextDiffLineNumber = Math.min(newStart - 1, nextDiffLineNumber);
        }
        if (firstDiffLineNumber == null) {
          firstDiffLineNumber = newStart - 1;
        }
        firstDiffLineNumber = Math.min(newStart - 1, firstDiffLineNumber);
      }
      if (nextDiffLineNumber == null) {
        nextDiffLineNumber = firstDiffLineNumber;
      }
      return this.moveToLineNumber(nextDiffLineNumber);
    };

    ReactGitDiffView.prototype.moveToPreviousDiff = function() {
      var cursorLineNumber, lastDiffLineNumber, newStart, previousDiffLineNumber, _i, _len, _ref, _ref1;
      cursorLineNumber = this.editor.getCursorBufferPosition().row + 1;
      previousDiffLineNumber = -1;
      lastDiffLineNumber = -1;
      _ref1 = (_ref = this.diffs) != null ? _ref : [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        newStart = _ref1[_i].newStart;
        if (newStart < cursorLineNumber) {
          previousDiffLineNumber = Math.max(newStart - 1, previousDiffLineNumber);
        }
        lastDiffLineNumber = Math.max(newStart - 1, lastDiffLineNumber);
      }
      if (previousDiffLineNumber === -1) {
        previousDiffLineNumber = lastDiffLineNumber;
      }
      return this.moveToLineNumber(previousDiffLineNumber);
    };

    ReactGitDiffView.prototype.moveToLineNumber = function(lineNumber) {
      if (lineNumber == null) {
        lineNumber = -1;
      }
      if (lineNumber >= 0) {
        this.editor.setCursorBufferPosition([lineNumber, 0]);
        return this.editor.moveCursorToFirstCharacterOfLine();
      }
    };

    ReactGitDiffView.prototype.unsubscribeFromBuffer = function() {
      if (this.buffer != null) {
        this.removeDecorations();
        this.buffer.off('contents-modified', this.updateDiffs);
        return this.buffer = null;
      }
    };

    ReactGitDiffView.prototype.subscribeToBuffer = function() {
      this.unsubscribeFromBuffer();
      if (this.buffer = this.editor.getBuffer()) {
        this.scheduleUpdate();
        return this.buffer.on('contents-modified', this.updateDiffs);
      }
    };

    ReactGitDiffView.prototype.scheduleUpdate = function() {
      return setImmediate(this.updateDiffs);
    };

    ReactGitDiffView.prototype.updateDiffs = function() {
      var path, _ref, _ref1;
      this.removeDecorations(this.decorations);
      if (path = (_ref = this.buffer) != null ? _ref.getPath() : void 0) {
        if (this.diffs = (_ref1 = atom.project.getRepo()) != null ? _ref1.getLineDiffs(path, this.buffer.getText()) : void 0) {
          this.decorations = this.generateDecorations(this.diffs);
          return this.addDecorations(this.decorations);
        }
      }
    };

    ReactGitDiffView.prototype.generateDecorations = function(diffs) {
      var decorations, newLines, newStart, oldLines, oldStart, row, _i, _j, _k, _len, _ref, _ref1, _ref2;
      decorations = {};
      for (_i = 0, _len = diffs.length; _i < _len; _i++) {
        _ref = diffs[_i], oldStart = _ref.oldStart, newStart = _ref.newStart, oldLines = _ref.oldLines, newLines = _ref.newLines;
        if (oldLines === 0 && newLines > 0) {
          for (row = _j = newStart, _ref1 = newStart + newLines; newStart <= _ref1 ? _j < _ref1 : _j > _ref1; row = newStart <= _ref1 ? ++_j : --_j) {
            decorations[row - 1] = {
              type: 'gutter',
              "class": 'git-line-added'
            };
          }
        } else if (newLines === 0 && oldLines > 0) {
          decorations[newStart - 1] = {
            type: 'gutter',
            "class": 'git-line-removed'
          };
        } else {
          for (row = _k = newStart, _ref2 = newStart + newLines; newStart <= _ref2 ? _k < _ref2 : _k > _ref2; row = newStart <= _ref2 ? ++_k : --_k) {
            decorations[row - 1] = {
              type: 'gutter',
              "class": 'git-line-modified'
            };
          }
        }
      }
      return decorations;
    };

    ReactGitDiffView.prototype.removeDecorations = function(decorations) {
      var bufferRow, decoration;
      if (decorations == null) {
        return;
      }
      for (bufferRow in decorations) {
        decoration = decorations[bufferRow];
        this.editor.removeDecorationFromBufferRow(bufferRow, decoration);
      }
    };

    ReactGitDiffView.prototype.addDecorations = function(decorations) {
      var bufferRow, decoration;
      if (decorations == null) {
        return;
      }
      for (bufferRow in decorations) {
        decoration = decorations[bufferRow];
        this.editor.addDecorationToBufferRow(bufferRow, decoration);
      }
    };

    return ReactGitDiffView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDRCQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQyxhQUFjLE9BQUEsQ0FBUSxVQUFSLEVBQWQsVUFBRCxDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLElBQUEsVUFBVSxDQUFDLFdBQVgsQ0FBdUIsZ0JBQXZCLENBQUEsQ0FBQTs7QUFFYSxJQUFBLDBCQUFFLFVBQUYsR0FBQTtBQUNYLFVBQUEsSUFBQTtBQUFBLE1BRFksSUFBQyxDQUFBLGFBQUEsVUFDYixDQUFBO0FBQUEsNkRBQUEsQ0FBQTtBQUFBLG1FQUFBLENBQUE7QUFBQSx1REFBQSxDQUFBO0FBQUEsbUVBQUEsQ0FBQTtBQUFBLE1BQUEsT0FBcUIsSUFBQyxDQUFBLFVBQXRCLEVBQUMsSUFBQyxDQUFBLGNBQUEsTUFBRixFQUFVLElBQUMsQ0FBQSxjQUFBLE1BQVgsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFdBQUQsR0FBZSxFQURmLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBQyxDQUFBLFVBQVosRUFBd0IscUJBQXhCLEVBQStDLElBQUMsQ0FBQSxpQkFBaEQsQ0FIQSxDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsU0FBRCxDQUFXLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBYixDQUFBLENBQVgsRUFBbUMsa0JBQW5DLEVBQXVELENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQ3JELEtBQUMsQ0FBQSxjQUFELENBQUEsRUFEcUQ7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF2RCxDQUpBLENBQUE7QUFBQSxNQU1BLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFiLENBQUEsQ0FBWCxFQUFtQyxn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
//# sourceURL=/Users/andytlr/.atom/packages/git-diff/lib/react-git-diff-view.coffee