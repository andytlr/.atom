(function() {
  var ReactGitDiffView, Subscriber,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Subscriber = require('emissary').Subscriber;

  module.exports = ReactGitDiffView = (function() {
    Subscriber.includeInto(ReactGitDiffView);

    function ReactGitDiffView(editorView) {
      var _ref;
      this.editorView = editorView;
      this.addDiffs = __bind(this.addDiffs, this);
      this.removeDiffs = __bind(this.removeDiffs, this);
      this.updateDiffs = __bind(this.updateDiffs, this);
      this.subscribeToBuffer = __bind(this.subscribeToBuffer, this);
      _ref = this.editorView, this.editor = _ref.editor, this.gutter = _ref.gutter;
      this.diffs = {};
      this.subscribe(this.editorView, 'editor:path-changed', this.subscribeToBuffer);
      this.subscribe(atom.project.getRepo(), 'statuses-changed', (function(_this) {
        return function() {
          _this.diffs = {};
          return _this.scheduleUpdate();
        };
      })(this));
      this.subscribe(atom.project.getRepo(), 'status-changed', (function(_this) {
        return function(path) {
          delete _this.diffs[path];
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
      var cursorLineNumber, firstDiffLineNumber, hunks, newStart, nextDiffLineNumber, _i, _len, _ref;
      cursorLineNumber = this.editor.getCursorBufferPosition().row + 1;
      nextDiffLineNumber = null;
      firstDiffLineNumber = null;
      hunks = (_ref = this.diffs[this.editor.getPath()]) != null ? _ref : [];
      for (_i = 0, _len = hunks.length; _i < _len; _i++) {
        newStart = hunks[_i].newStart;
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
      var cursorLineNumber, hunks, lastDiffLineNumber, newStart, previousDiffLineNumber, _i, _len, _ref;
      cursorLineNumber = this.editor.getCursorBufferPosition().row + 1;
      previousDiffLineNumber = -1;
      lastDiffLineNumber = -1;
      hunks = (_ref = this.diffs[this.editor.getPath()]) != null ? _ref : [];
      for (_i = 0, _len = hunks.length; _i < _len; _i++) {
        newStart = hunks[_i].newStart;
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
        this.removeDiffs();
        if (this.buffer.destroyed) {
          delete this.diffs[this.buffer.getPath()];
        }
        this.buffer.off('contents-modified', this.updateDiffs);
        return this.buffer = null;
      }
    };

    ReactGitDiffView.prototype.subscribeToBuffer = function() {
      this.unsubscribeFromBuffer();
      if (this.buffer = this.editor.getBuffer()) {
        if (this.diffs[this.buffer.getPath()] == null) {
          this.scheduleUpdate();
        }
        return this.buffer.on('contents-modified', this.updateDiffs);
      }
    };

    ReactGitDiffView.prototype.scheduleUpdate = function() {
      return setImmediate(this.updateDiffs);
    };

    ReactGitDiffView.prototype.updateDiffs = function() {
      if (this.buffer == null) {
        return;
      }
      this.removeDiffs(this.diffs);
      this.diffs = this.generateDiffs();
      return this.addDiffs(this.diffs);
    };

    ReactGitDiffView.prototype.generateDiffs = function() {
      var diffs, newLines, newStart, oldLines, oldStart, path, rawHunks, row, _i, _j, _k, _len, _ref, _ref1, _ref2, _ref3;
      path = this.buffer.getPath();
      if (!path) {
        return;
      }
      rawHunks = (_ref = atom.project.getRepo()) != null ? _ref.getLineDiffs(path, this.buffer.getText()) : void 0;
      diffs = {};
      for (_i = 0, _len = rawHunks.length; _i < _len; _i++) {
        _ref1 = rawHunks[_i], oldStart = _ref1.oldStart, newStart = _ref1.newStart, oldLines = _ref1.oldLines, newLines = _ref1.newLines;
        if (oldLines === 0 && newLines > 0) {
          for (row = _j = newStart, _ref2 = newStart + newLines; newStart <= _ref2 ? _j < _ref2 : _j > _ref2; row = newStart <= _ref2 ? ++_j : --_j) {
            diffs[row - 1] = {
              type: 'gutter',
              "class": 'git-line-added'
            };
          }
        } else if (newLines === 0 && oldLines > 0) {
          diffs[newStart - 1] = {
            type: 'gutter',
            "class": 'git-line-removed'
          };
        } else {
          for (row = _k = newStart, _ref3 = newStart + newLines; newStart <= _ref3 ? _k < _ref3 : _k > _ref3; row = newStart <= _ref3 ? ++_k : --_k) {
            diffs[row - 1] = {
              type: 'gutter',
              "class": 'git-line-modified'
            };
          }
        }
      }
      return diffs;
    };

    ReactGitDiffView.prototype.removeDiffs = function(diffs) {
      var bufferRow, decoration;
      if (diffs == null) {
        return;
      }
      for (bufferRow in diffs) {
        decoration = diffs[bufferRow];
        this.editor.removeDecorationFromBufferRow(bufferRow, decoration);
      }
    };

    ReactGitDiffView.prototype.addDiffs = function(diffs) {
      var bufferRow, decoration;
      if (diffs == null) {
        return;
      }
      for (bufferRow in diffs) {
        decoration = diffs[bufferRow];
        this.editor.addDecorationToBufferRow(bufferRow, decoration);
      }
    };

    return ReactGitDiffView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDRCQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQyxhQUFjLE9BQUEsQ0FBUSxVQUFSLEVBQWQsVUFBRCxDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLElBQUEsVUFBVSxDQUFDLFdBQVgsQ0FBdUIsZ0JBQXZCLENBQUEsQ0FBQTs7QUFFYSxJQUFBLDBCQUFFLFVBQUYsR0FBQTtBQUNYLFVBQUEsSUFBQTtBQUFBLE1BRFksSUFBQyxDQUFBLGFBQUEsVUFDYixDQUFBO0FBQUEsaURBQUEsQ0FBQTtBQUFBLHVEQUFBLENBQUE7QUFBQSx1REFBQSxDQUFBO0FBQUEsbUVBQUEsQ0FBQTtBQUFBLE1BQUEsT0FBcUIsSUFBQyxDQUFBLFVBQXRCLEVBQUMsSUFBQyxDQUFBLGNBQUEsTUFBRixFQUFVLElBQUMsQ0FBQSxjQUFBLE1BQVgsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLEtBQUQsR0FBUyxFQURULENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBQyxDQUFBLFVBQVosRUFBd0IscUJBQXhCLEVBQStDLElBQUMsQ0FBQSxpQkFBaEQsQ0FIQSxDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsU0FBRCxDQUFXLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBYixDQUFBLENBQVgsRUFBbUMsa0JBQW5DLEVBQXVELENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDckQsVUFBQSxLQUFDLENBQUEsS0FBRCxHQUFTLEVBQVQsQ0FBQTtpQkFDQSxLQUFDLENBQUEsY0FBRCxDQUFBLEVBRnFEO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdkQsQ0FKQSxDQUFBO0FBQUEsTUFPQSxJQUFDLENBQUEsU0FBRCxDQUFXLElB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
//# sourceURL=/Users/andytlr/.atom/packages/git-diff/lib/react-git-diff-view.coffee