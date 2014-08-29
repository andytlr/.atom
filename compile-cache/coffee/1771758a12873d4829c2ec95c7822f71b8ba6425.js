(function() {
  var GitDiffView, Subscriber,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Subscriber = require('emissary').Subscriber;

  module.exports = GitDiffView = (function() {
    Subscriber.includeInto(GitDiffView);

    function GitDiffView(editorView) {
      var _ref;
      this.editorView = editorView;
      this.updateDiffs = __bind(this.updateDiffs, this);
      this.subscribeToBuffer = __bind(this.subscribeToBuffer, this);
      _ref = this.editorView, this.editor = _ref.editor, this.gutter = _ref.gutter;
      this.decorations = {};
      this.markers = null;
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
      this.subscribe(atom.config.observe('editor.showLineNumbers', (function(_this) {
        return function() {
          _this.gutter = _this.editorView.gutter;
          if (atom.config.get('editor.showLineNumbers') && atom.config.get('git-diff.showIconsInEditorGutter')) {
            return _this.gutter.addClass('git-diff-icon');
          }
        };
      })(this)));
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
        return this.editor.moveCursorToFirstCharacterOfLine();
      }
    };

    GitDiffView.prototype.unsubscribeFromBuffer = function() {
      if (this.buffer != null) {
        this.removeDecorations();
        this.buffer.off('contents-modified', this.updateDiffs);
        return this.buffer = null;
      }
    };

    GitDiffView.prototype.subscribeToBuffer = function() {
      this.unsubscribeFromBuffer();
      if (this.buffer = this.editor.getBuffer()) {
        this.scheduleUpdate();
        return this.buffer.on('contents-modified', this.updateDiffs);
      }
    };

    GitDiffView.prototype.scheduleUpdate = function() {
      return setImmediate(this.updateDiffs);
    };

    GitDiffView.prototype.updateDiffs = function() {
      var path, _ref, _ref1;
      this.removeDecorations();
      if (path = (_ref = this.buffer) != null ? _ref.getPath() : void 0) {
        if (this.diffs = (_ref1 = atom.project.getRepo()) != null ? _ref1.getLineDiffs(path, this.buffer.getText()) : void 0) {
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
      if (this.markers == null) {
        return;
      }
      _ref = this.markers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        marker = _ref[_i];
        marker.destroy();
      }
      return this.markers = null;
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
      if (this.markers == null) {
        this.markers = [];
      }
      return this.markers.push(marker);
    };

    return GitDiffView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVCQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQyxhQUFjLE9BQUEsQ0FBUSxVQUFSLEVBQWQsVUFBRCxDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLElBQUEsVUFBVSxDQUFDLFdBQVgsQ0FBdUIsV0FBdkIsQ0FBQSxDQUFBOztBQUVhLElBQUEscUJBQUUsVUFBRixHQUFBO0FBQ1gsVUFBQSxJQUFBO0FBQUEsTUFEWSxJQUFDLENBQUEsYUFBQSxVQUNiLENBQUE7QUFBQSx1REFBQSxDQUFBO0FBQUEsbUVBQUEsQ0FBQTtBQUFBLE1BQUEsT0FBcUIsSUFBQyxDQUFBLFVBQXRCLEVBQUMsSUFBQyxDQUFBLGNBQUEsTUFBRixFQUFVLElBQUMsQ0FBQSxjQUFBLE1BQVgsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFdBQUQsR0FBZSxFQURmLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFGWCxDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsU0FBRCxDQUFXLElBQUMsQ0FBQSxVQUFaLEVBQXdCLHFCQUF4QixFQUErQyxJQUFDLENBQUEsaUJBQWhELENBSkEsQ0FBQTtBQUFBLE1BS0EsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQWIsQ0FBQSxDQUFYLEVBQW1DLGtCQUFuQyxFQUF1RCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUNyRCxLQUFDLENBQUEsY0FBRCxDQUFBLEVBRHFEO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdkQsQ0FMQSxDQUFBO0FBQUEsTUFPQSxJQUFDLENBQUEsU0FBRCxDQUFXLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBYixDQUFBLENBQVgs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
//# sourceURL=/Users/andytlr/.atom/packages/git-diff/lib/git-diff-view.coffee