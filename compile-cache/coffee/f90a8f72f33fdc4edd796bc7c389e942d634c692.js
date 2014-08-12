(function() {
  var ReactGitDiffView, Subscriber,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Subscriber = require('emissary').Subscriber;

  module.exports = ReactGitDiffView = (function() {
    Subscriber.includeInto(ReactGitDiffView);

    function ReactGitDiffView(editorView) {
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
      this.removeDecorations();
      if (path = (_ref = this.buffer) != null ? _ref.getPath() : void 0) {
        if (this.diffs = (_ref1 = atom.project.getRepo()) != null ? _ref1.getLineDiffs(path, this.buffer.getText()) : void 0) {
          return this.addDecorations(this.diffs);
        }
      }
    };

    ReactGitDiffView.prototype.addDecorations = function(diffs) {
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

    ReactGitDiffView.prototype.removeDecorations = function() {
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

    ReactGitDiffView.prototype.markRange = function(startRow, endRow, klass) {
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

    return ReactGitDiffView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDRCQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQyxhQUFjLE9BQUEsQ0FBUSxVQUFSLEVBQWQsVUFBRCxDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLElBQUEsVUFBVSxDQUFDLFdBQVgsQ0FBdUIsZ0JBQXZCLENBQUEsQ0FBQTs7QUFFYSxJQUFBLDBCQUFFLFVBQUYsR0FBQTtBQUNYLFVBQUEsSUFBQTtBQUFBLE1BRFksSUFBQyxDQUFBLGFBQUEsVUFDYixDQUFBO0FBQUEsdURBQUEsQ0FBQTtBQUFBLG1FQUFBLENBQUE7QUFBQSxNQUFBLE9BQXFCLElBQUMsQ0FBQSxVQUF0QixFQUFDLElBQUMsQ0FBQSxjQUFBLE1BQUYsRUFBVSxJQUFDLENBQUEsY0FBQSxNQUFYLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxXQUFELEdBQWUsRUFEZixDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsT0FBRCxHQUFXLElBRlgsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFDLENBQUEsVUFBWixFQUF3QixxQkFBeEIsRUFBK0MsSUFBQyxDQUFBLGlCQUFoRCxDQUpBLENBQUE7QUFBQSxNQUtBLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFiLENBQUEsQ0FBWCxFQUFtQyxrQkFBbkMsRUFBdUQsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFDckQsS0FBQyxDQUFBLGNBQUQsQ0FBQSxFQURxRDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXZELENBTEEsQ0FBQTtBQUFBLE1BT0EsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQWIsQ0FBQSxDQUFY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
//# sourceURL=/Users/andytlr/.atom/packages/git-diff/lib/react-git-diff-view.coffee