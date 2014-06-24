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
      this.editor.addDecorationForMarker(marker, {
        type: ['gutter', 'line'],
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