(function() {
  var GitDiffView, Subscriber,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Subscriber = require('emissary').Subscriber;

  module.exports = GitDiffView = (function() {
    Subscriber.includeInto(GitDiffView);

    GitDiffView.prototype.classes = ['git-line-added', 'git-line-modified', 'git-line-removed'];

    function GitDiffView(editorView) {
      var _ref;
      this.editorView = editorView;
      this.renderDiffs = __bind(this.renderDiffs, this);
      this.removeDiffs = __bind(this.removeDiffs, this);
      this.updateDiffs = __bind(this.updateDiffs, this);
      this.subscribeToBuffer = __bind(this.subscribeToBuffer, this);
      _ref = this.editorView, this.editor = _ref.editor, this.gutter = _ref.gutter;
      this.diffs = {};
      this.subscribe(this.editorView, 'editor:path-changed', this.subscribeToBuffer);
      this.subscribe(this.editorView, 'editor:display-updated', this.renderDiffs);
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

    GitDiffView.prototype.moveToNextDiff = function() {
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

    GitDiffView.prototype.moveToPreviousDiff = function() {
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

    GitDiffView.prototype.moveToLineNumber = function(lineNumber) {
      if (lineNumber == null) {
        lineNumber = -1;
      }
      if (lineNumber >= 0) {
        this.editor.setCursorBufferPosition([lineNumber, 0]);
        return this.editor.moveCursorToFirstCharacterOfLine();
      }
    };

    GitDiffView.prototype.unsubscribeFromBuffer = function() {
      if (this.buffer != null) {
        this.removeDiffs();
        if (this.buffer.destroyed) {
          delete this.diffs[this.buffer.getPath()];
        }
        this.buffer.off('contents-modified', this.updateDiffs);
        return this.buffer = null;
      }
    };

    GitDiffView.prototype.subscribeToBuffer = function() {
      this.unsubscribeFromBuffer();
      if (this.buffer = this.editor.getBuffer()) {
        if (this.diffs[this.buffer.getPath()] == null) {
          this.scheduleUpdate();
        }
        return this.buffer.on('contents-modified', this.updateDiffs);
      }
    };

    GitDiffView.prototype.scheduleUpdate = function() {
      return setImmediate(this.updateDiffs);
    };

    GitDiffView.prototype.updateDiffs = function() {
      if (this.buffer == null) {
        return;
      }
      this.generateDiffs();
      return this.renderDiffs();
    };

    GitDiffView.prototype.generateDiffs = function() {
      var path, _ref;
      if (path = this.buffer.getPath()) {
        return this.diffs[path] = (_ref = atom.project.getRepo()) != null ? _ref.getLineDiffs(path, this.buffer.getText()) : void 0;
      }
    };

    GitDiffView.prototype.removeDiffs = function() {
      var klass, _i, _len, _ref;
      if (this.gutter.hasGitLineDiffs) {
        _ref = this.classes;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          klass = _ref[_i];
          this.gutter.removeClassFromAllLines(klass);
        }
        return this.gutter.hasGitLineDiffs = false;
      }
    };

    GitDiffView.prototype.renderDiffs = function() {
      var hunks, linesHighlighted, newLines, newStart, oldLines, oldStart, row, _i, _j, _k, _len, _ref, _ref1, _ref2, _ref3;
      if (!this.gutter.isVisible()) {
        return;
      }
      this.removeDiffs();
      hunks = (_ref = this.diffs[this.editor.getPath()]) != null ? _ref : [];
      linesHighlighted = false;
      for (_i = 0, _len = hunks.length; _i < _len; _i++) {
        _ref1 = hunks[_i], oldStart = _ref1.oldStart, newStart = _ref1.newStart, oldLines = _ref1.oldLines, newLines = _ref1.newLines;
        if (oldLines === 0 && newLines > 0) {
          for (row = _j = newStart, _ref2 = newStart + newLines; newStart <= _ref2 ? _j < _ref2 : _j > _ref2; row = newStart <= _ref2 ? ++_j : --_j) {
            linesHighlighted |= this.gutter.addClassToLine(row - 1, 'git-line-added');
          }
        } else if (newLines === 0 && oldLines > 0) {
          linesHighlighted |= this.gutter.addClassToLine(newStart - 1, 'git-line-removed');
        } else {
          for (row = _k = newStart, _ref3 = newStart + newLines; newStart <= _ref3 ? _k < _ref3 : _k > _ref3; row = newStart <= _ref3 ? ++_k : --_k) {
            linesHighlighted |= this.gutter.addClassToLine(row - 1, 'git-line-modified');
          }
        }
      }
      return this.gutter.hasGitLineDiffs = linesHighlighted;
    };

    return GitDiffView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVCQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQyxhQUFjLE9BQUEsQ0FBUSxVQUFSLEVBQWQsVUFBRCxDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLElBQUEsVUFBVSxDQUFDLFdBQVgsQ0FBdUIsV0FBdkIsQ0FBQSxDQUFBOztBQUFBLDBCQUVBLE9BQUEsR0FBUyxDQUFDLGdCQUFELEVBQW1CLG1CQUFuQixFQUF3QyxrQkFBeEMsQ0FGVCxDQUFBOztBQUlhLElBQUEscUJBQUUsVUFBRixHQUFBO0FBQ1gsVUFBQSxJQUFBO0FBQUEsTUFEWSxJQUFDLENBQUEsYUFBQSxVQUNiLENBQUE7QUFBQSx1REFBQSxDQUFBO0FBQUEsdURBQUEsQ0FBQTtBQUFBLHVEQUFBLENBQUE7QUFBQSxtRUFBQSxDQUFBO0FBQUEsTUFBQSxPQUFxQixJQUFDLENBQUEsVUFBdEIsRUFBQyxJQUFDLENBQUEsY0FBQSxNQUFGLEVBQVUsSUFBQyxDQUFBLGNBQUEsTUFBWCxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsS0FBRCxHQUFTLEVBRFQsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFDLENBQUEsVUFBWixFQUF3QixxQkFBeEIsRUFBK0MsSUFBQyxDQUFBLGlCQUFoRCxDQUhBLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBQyxDQUFBLFVBQVosRUFBd0Isd0JBQXhCLEVBQWtELElBQUMsQ0FBQSxXQUFuRCxDQUpBLENBQUE7QUFBQSxNQUtBLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFiLENBQUEsQ0FBWCxFQUFtQyxrQkFBbkMsRUFBdUQsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FB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
//# sourceURL=/Users/andytlr/.atom/packages/git-diff/lib/git-diff-view.coffee