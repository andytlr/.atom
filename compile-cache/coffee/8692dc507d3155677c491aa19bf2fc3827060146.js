(function() {
  var CompositeDisposable, GitDiffView,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = GitDiffView = (function() {
    function GitDiffView(editor) {
      var editorView;
      this.editor = editor;
      this.updateDiffs = __bind(this.updateDiffs, this);
      this.subscriptions = new CompositeDisposable();
      this.decorations = {};
      this.markers = [];
      this.subscriptions.add(this.editor.onDidStopChanging(this.updateDiffs));
      this.subscriptions.add(this.editor.onDidChangePath(this.updateDiffs));
      atom.project.getRepositories().forEach((function(_this) {
        return function(repository) {
          _this.subscriptions.add(repository.onDidChangeStatuses(function() {
            return _this.scheduleUpdate();
          }));
          return _this.subscriptions.add(repository.onDidChangeStatus(function(changedPath) {
            if (changedPath === _this.editor.getPath()) {
              return _this.scheduleUpdate();
            }
          }));
        };
      })(this));
      this.subscriptions.add(this.editor.onDidDestroy((function(_this) {
        return function() {
          _this.cancelUpdate();
          _this.removeDecorations();
          return _this.subscriptions.dispose();
        };
      })(this)));
      editorView = atom.views.getView(this.editor);
      this.subscriptions.add(atom.commands.add(editorView, 'git-diff:move-to-next-diff', (function(_this) {
        return function() {
          return _this.moveToNextDiff();
        };
      })(this)));
      this.subscriptions.add(atom.commands.add(editorView, 'git-diff:move-to-previous-diff', (function(_this) {
        return function() {
          return _this.moveToPreviousDiff();
        };
      })(this)));
      this.subscriptions.add(atom.config.onDidChange('git-diff.showIconsInEditorGutter', (function(_this) {
        return function() {
          return _this.updateIconDecoration();
        };
      })(this)));
      this.subscriptions.add(atom.config.onDidChange('editor.showLineNumbers', (function(_this) {
        return function() {
          return _this.updateIconDecoration();
        };
      })(this)));
      this.updateIconDecoration();
      this.scheduleUpdate();
    }

    GitDiffView.prototype.moveToNextDiff = function() {
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

    GitDiffView.prototype.updateIconDecoration = function() {
      var gutter, _ref;
      gutter = (_ref = atom.views.getView(this.editor).rootElement) != null ? _ref.querySelector('.gutter') : void 0;
      if (atom.config.get('editor.showLineNumbers') && atom.config.get('git-diff.showIconsInEditorGutter')) {
        return gutter != null ? gutter.classList.add('git-diff-icon') : void 0;
      } else {
        return gutter != null ? gutter.classList.remove('git-diff-icon') : void 0;
      }
    };

    GitDiffView.prototype.moveToPreviousDiff = function() {
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

    GitDiffView.prototype.moveToLineNumber = function(lineNumber) {
      if (lineNumber == null) {
        lineNumber = -1;
      }
      if (lineNumber >= 0) {
        this.editor.setCursorBufferPosition([lineNumber, 0]);
        return this.editor.moveToFirstCharacterOfLine();
      }
    };

    GitDiffView.prototype.cancelUpdate = function() {
      return clearImmediate(this.immediateId);
    };

    GitDiffView.prototype.scheduleUpdate = function() {
      this.cancelUpdate();
      return this.immediateId = setImmediate(this.updateDiffs);
    };

    GitDiffView.prototype.updateDiffs = function() {
      var path, _ref, _ref1;
      if (this.editor.isDestroyed()) {
        return;
      }
      this.removeDecorations();
      if (path = (_ref = this.editor) != null ? _ref.getPath() : void 0) {
        if (this.diffs = (_ref1 = atom.project.getRepositories()[0]) != null ? _ref1.getLineDiffs(path, this.editor.getText()) : void 0) {
          return this.addDecorations(this.diffs);
        }
      }
    };

    GitDiffView.prototype.addDecorations = function(diffs) {
      var endRow, newLines, newStart, oldLines, oldStart, startRow, _i, _len, _ref;
      for (_i = 0, _len = diffs.length; _i < _len; _i++) {
        _ref = diffs[_i], oldStart = _ref.oldStart, newStart = _ref.newStart, oldLines = _ref.oldLines, newLines = _ref.newLines;
        startRow = newStart - 1;
        endRow = newStart + newLines - 2;
        if (oldLines === 0 && newLines > 0) {
          this.markRange(startRow, endRow, 'git-line-added');
        } else if (newLines === 0 && oldLines > 0) {
          this.markRange(startRow, startRow, 'git-line-removed');
        } else {
          this.markRange(startRow, endRow, 'git-line-modified');
        }
      }
    };

    GitDiffView.prototype.removeDecorations = function() {
      var marker, _i, _len, _ref;
      _ref = this.markers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        marker = _ref[_i];
        marker.destroy();
      }
      return this.markers = [];
    };

    GitDiffView.prototype.markRange = function(startRow, endRow, klass) {
      var marker;
      marker = this.editor.markBufferRange([[startRow, 0], [endRow, Infinity]], {
        invalidate: 'never'
      });
      this.editor.decorateMarker(marker, {
        type: 'gutter',
        "class": klass
      });
      return this.markers.push(marker);
    };

    return GitDiffView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGdDQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDUyxJQUFBLHFCQUFFLE1BQUYsR0FBQTtBQUNYLFVBQUEsVUFBQTtBQUFBLE1BRFksSUFBQyxDQUFBLFNBQUEsTUFDYixDQUFBO0FBQUEsdURBQUEsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLGFBQUQsR0FBcUIsSUFBQSxtQkFBQSxDQUFBLENBQXJCLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxXQUFELEdBQWUsRUFEZixDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsT0FBRCxHQUFXLEVBRlgsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxNQUFNLENBQUMsaUJBQVIsQ0FBMEIsSUFBQyxDQUFBLFdBQTNCLENBQW5CLENBSkEsQ0FBQTtBQUFBLE1BS0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxNQUFNLENBQUMsZUFBUixDQUF3QixJQUFDLENBQUEsV0FBekIsQ0FBbkIsQ0FMQSxDQUFBO0FBQUEsTUFPQSxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWIsQ0FBQSxDQUE4QixDQUFDLE9BQS9CLENBQXVDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLFVBQUQsR0FBQTtBQUNyQyxVQUFBLEtBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixVQUFVLENBQUMsbUJBQVgsQ0FBK0IsU0FBQSxHQUFBO21CQUNoRCxLQUFDLENBQUEsY0FBRCxDQUFBLEVBRGdEO1VBQUEsQ0FBL0IsQ0FBbkIsQ0FBQSxDQUFBO2lC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
//# sourceURL=/Users/andytlr/.atom/packages/git-diff/lib/git-diff-view.coffee