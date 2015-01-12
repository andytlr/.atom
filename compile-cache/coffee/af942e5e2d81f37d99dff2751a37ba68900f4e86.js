(function() {
  var AutocompleteManager, CompositeDisposable, Emitter, FuzzyProvider, Range, minimatch, path, _, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Range = require('atom').Range;

  _ref = require('event-kit'), Emitter = _ref.Emitter, CompositeDisposable = _ref.CompositeDisposable;

  _ = require('underscore-plus');

  path = require('path');

  minimatch = require('minimatch');

  FuzzyProvider = require('./fuzzy-provider');

  module.exports = AutocompleteManager = (function() {
    AutocompleteManager.prototype.currentBuffer = null;

    AutocompleteManager.prototype.debug = false;

    function AutocompleteManager(editor) {
      this.editor = editor;
      this.editorChanged = __bind(this.editorChanged, this);
      this.editorSaved = __bind(this.editorSaved, this);
      this.editorHasFocus = __bind(this.editorHasFocus, this);
      this.cursorMoved = __bind(this.cursorMoved, this);
      this.contentsModified = __bind(this.contentsModified, this);
      this.runAutocompletion = __bind(this.runAutocompletion, this);
      this.cancel = __bind(this.cancel, this);
      this.selectPrevious = __bind(this.selectPrevious, this);
      this.selectNext = __bind(this.selectNext, this);
      this.confirmSelection = __bind(this.confirmSelection, this);
      this.updateCurrentEditor = __bind(this.updateCurrentEditor, this);
      this.editorView = atom.views.getView(this.editor);
      this.compositeDisposable = new CompositeDisposable;
      this.emitter = new Emitter;
      this.providers = [];
      if (this.currentFileBlacklisted()) {
        return;
      }
      this.registerProvider(new FuzzyProvider(this.editor));
      this.handleEvents();
      this.setCurrentBuffer(this.editor.getBuffer());
      this.compositeDisposable.add(atom.workspace.observeActivePaneItem(this.updateCurrentEditor));
      this.compositeDisposable.add(atom.commands.add('atom-text-editor', {
        "autocomplete-plus:activate": this.runAutocompletion
      }));
      this.compositeDisposable.add(atom.commands.add('.autocomplete-plus', {
        "autocomplete-plus:confirm": this.confirmSelection,
        "autocomplete-plus:select-next": this.selectNext,
        "autocomplete-plus:select-previous": this.selectPrevious,
        "autocomplete-plus:cancel": this.cancel
      }));
    }

    AutocompleteManager.prototype.updateCurrentEditor = function(currentPaneItem) {
      if (currentPaneItem !== this.editor) {
        return this.cancel();
      }
    };

    AutocompleteManager.prototype.confirmSelection = function() {
      return this.emitter.emit('do-confirm-selection');
    };

    AutocompleteManager.prototype.onDoConfirmSelection = function(cb) {
      return this.emitter.on('do-confirm-selection', cb);
    };

    AutocompleteManager.prototype.selectNext = function() {
      return this.emitter.emit('do-select-next');
    };

    AutocompleteManager.prototype.onDoSelectNext = function(cb) {
      return this.emitter.on('do-select-next', cb);
    };

    AutocompleteManager.prototype.selectPrevious = function() {
      return this.emitter.emit('do-select-previous');
    };

    AutocompleteManager.prototype.onDoSelectPrevious = function(cb) {
      return this.emitter.on('do-select-previous', cb);
    };

    AutocompleteManager.prototype.currentFileBlacklisted = function() {
      var blacklist, blacklistGlob, fileName, _i, _len;
      blacklist = (atom.config.get("autocomplete-plus.fileBlacklist") || "").split(",").map(function(s) {
        return s.trim();
      });
      fileName = path.basename(this.editor.getBuffer().getPath());
      for (_i = 0, _len = blacklist.length; _i < _len; _i++) {
        blacklistGlob = blacklist[_i];
        if (minimatch(fileName, blacklistGlob)) {
          return true;
        }
      }
      return false;
    };

    AutocompleteManager.prototype.handleEvents = function() {
      this.compositeDisposable.add(this.editor.onDidChangeCursorPosition(this.cursorMoved));
      return this.compositeDisposable.add(this.editor.onDidChangeTitle(this.cancel));
    };

    AutocompleteManager.prototype.registerProvider = function(provider) {
      if (_.findWhere(this.providers, provider) == null) {
        this.providers.push(provider);
        if (provider.dispose != null) {
          return this.compositeDisposable.add(provider);
        }
      }
    };

    AutocompleteManager.prototype.unregisterProvider = function(provider) {
      _.remove(this.providers, provider);
      return this.compositeDisposable.remove(provider);
    };

    AutocompleteManager.prototype.confirm = function(match) {
      var replace, _ref1, _ref2;
      if (!this.editorHasFocus()) {
        return;
      }
      if ((match != null ? match.provider : void 0) == null) {
        return;
      }
      if (this.editor == null) {
        return;
      }
      replace = match.provider.confirm(match);
      if ((_ref1 = this.editor.getSelections()) != null) {
        _ref1.forEach(function(selection) {
          return selection != null ? selection.clear() : void 0;
        });
      }
      this.cancel();
      if (!replace) {
        return;
      }
      this.replaceTextWithMatch(match);
      return (_ref2 = this.editor.getCursors()) != null ? _ref2.forEach(function(cursor) {
        var position;
        position = cursor != null ? cursor.getBufferPosition() : void 0;
        if (position != null) {
          return cursor.setBufferPosition([position.row, position.column]);
        }
      }) : void 0;
    };

    AutocompleteManager.prototype.cancel = function() {
      var _ref1;
      if (!this.active) {
        return;
      }
      if ((_ref1 = this.overlayDecoration) != null) {
        _ref1.destroy();
      }
      this.overlayDecoration = void 0;
      this.editorView.focus();
      return this.active = false;
    };

    AutocompleteManager.prototype.runAutocompletion = function() {
      var buffer, marker, options, provider, providerSuggestions, suggestions, _i, _len, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6;
      if (this.compositionInProgress) {
        return;
      }
      this.cancel();
      this.originalSelectionBufferRanges = this.editor.getSelections().map(function(selection) {
        return selection.getBufferRange();
      });
      this.originalCursorPosition = this.editor.getCursorScreenPosition();
      if (this.originalCursorPosition == null) {
        return;
      }
      buffer = (_ref1 = this.editor) != null ? _ref1.getBuffer() : void 0;
      if (buffer == null) {
        return;
      }
      options = {
        path: buffer.getPath(),
        text: buffer.getText(),
        pos: this.originalCursorPosition
      };
      suggestions = [];
      _ref4 = (_ref2 = this.providers) != null ? (_ref3 = _ref2.slice()) != null ? _ref3.reverse() : void 0 : void 0;
      for (_i = 0, _len = _ref4.length; _i < _len; _i++) {
        provider = _ref4[_i];
        providerSuggestions = provider != null ? provider.buildSuggestions(options) : void 0;
        if (!(providerSuggestions != null ? providerSuggestions.length : void 0)) {
          continue;
        }
        if (provider.exclusive) {
          suggestions = providerSuggestions;
          break;
        } else {
          suggestions = suggestions.concat(providerSuggestions);
        }
      }
      if (!suggestions.length) {
        return;
      }
      if (this.overlayDecoration == null) {
        marker = (_ref5 = this.editor.getLastCursor()) != null ? _ref5.getMarker() : void 0;
        this.overlayDecoration = (_ref6 = this.editor) != null ? _ref6.decorateMarker(marker, {
          type: 'overlay',
          item: this
        }) : void 0;
      }
      this.changeItems(suggestions);
      return this.setActive();
    };

    AutocompleteManager.prototype.changeItems = function(items) {
      this.items = items;
      return this.emitter.emit('did-change-items', items);
    };

    AutocompleteManager.prototype.onDidChangeItems = function(cb) {
      return this.emitter.on('did-change-items', cb);
    };

    AutocompleteManager.prototype.setActive = function() {
      return this.active = true;
    };

    AutocompleteManager.prototype.contentsModified = function() {
      var delay;
      delay = parseInt(atom.config.get("autocomplete-plus.autoActivationDelay"));
      if (this.delayTimeout) {
        clearTimeout(this.delayTimeout);
      }
      return this.delayTimeout = setTimeout(this.runAutocompletion, delay);
    };

    AutocompleteManager.prototype.cursorMoved = function(data) {
      if (!data.textChanged) {
        return this.cancel();
      }
    };

    AutocompleteManager.prototype.editorHasFocus = function() {
      var editorView;
      editorView = this.editorView;
      if (editorView.jquery) {
        editorView = editorView[0];
      }
      return editorView.hasFocus();
    };

    AutocompleteManager.prototype.editorSaved = function() {
      if (!this.editorHasFocus()) {
        return;
      }
      return this.cancel();
    };

    AutocompleteManager.prototype.editorChanged = function(e) {
      if (!this.editorHasFocus()) {
        return;
      }
      if (atom.config.get("autocomplete-plus.enableAutoActivation") && (e.newText.trim().length === 1 || e.oldText.trim().length === 1)) {
        return this.contentsModified();
      } else {
        return this.cancel();
      }
    };

    AutocompleteManager.prototype.replaceTextWithMatch = function(match) {
      var buffer, newSelectedBufferRanges, selections;
      if (this.editor == null) {
        return;
      }
      newSelectedBufferRanges = [];
      buffer = this.editor.getBuffer();
      if (buffer == null) {
        return;
      }
      selections = this.editor.getSelections();
      if (selections == null) {
        return;
      }
      selections.forEach((function(_this) {
        return function(selection, i) {
          var cursorPosition, infixLength, startPosition, _ref1, _ref2, _ref3;
          if (selection != null) {
            startPosition = (_ref1 = selection.getBufferRange()) != null ? _ref1.start : void 0;
            selection.deleteSelectedText();
            cursorPosition = (_ref2 = _this.editor.getCursors()) != null ? (_ref3 = _ref2[i]) != null ? _ref3.getBufferPosition() : void 0 : void 0;
            buffer["delete"](Range.fromPointWithDelta(cursorPosition, 0, -match.prefix.length));
            infixLength = match.word.length - match.prefix.length;
            return newSelectedBufferRanges.push([startPosition, [startPosition.row, startPosition.column + infixLength]]);
          }
        };
      })(this));
      this.editor.insertText(match.word);
      return this.editor.setSelectedBufferRanges(newSelectedBufferRanges);
    };

    AutocompleteManager.prototype.setCurrentBuffer = function(currentBuffer) {
      this.currentBuffer = currentBuffer;
      this.compositeDisposable.add(this.currentBuffer.onDidSave(this.editorSaved));
      return this.compositeDisposable.add(this.currentBuffer.onDidChange(this.editorChanged));
    };

    AutocompleteManager.prototype.dispose = function() {
      this.compositeDisposable.dispose();
      return this.emitter.emit('did-dispose');
    };

    AutocompleteManager.prototype.onDidDispose = function(cb) {
      return this.emitter.on('did-dispose', cb);
    };

    return AutocompleteManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlHQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQyxRQUFVLE9BQUEsQ0FBUSxNQUFSLEVBQVYsS0FBRCxDQUFBOztBQUFBLEVBQ0EsT0FBaUMsT0FBQSxDQUFRLFdBQVIsQ0FBakMsRUFBQyxlQUFBLE9BQUQsRUFBVSwyQkFBQSxtQkFEVixDQUFBOztBQUFBLEVBRUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUZKLENBQUE7O0FBQUEsRUFHQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FIUCxDQUFBOztBQUFBLEVBSUEsU0FBQSxHQUFZLE9BQUEsQ0FBUSxXQUFSLENBSlosQ0FBQTs7QUFBQSxFQUtBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGtCQUFSLENBTGhCLENBQUE7O0FBQUEsRUFPQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osa0NBQUEsYUFBQSxHQUFlLElBQWYsQ0FBQTs7QUFBQSxrQ0FDQSxLQUFBLEdBQU8sS0FEUCxDQUFBOztBQU9hLElBQUEsNkJBQUUsTUFBRixHQUFBO0FBQ1gsTUFEWSxJQUFDLENBQUEsU0FBQSxNQUNiLENBQUE7QUFBQSwyREFBQSxDQUFBO0FBQUEsdURBQUEsQ0FBQTtBQUFBLDZEQUFBLENBQUE7QUFBQSx1REFBQSxDQUFBO0FBQUEsaUVBQUEsQ0FBQTtBQUFBLG1FQUFBLENBQUE7QUFBQSw2Q0FBQSxDQUFBO0FBQUEsNkRBQUEsQ0FBQTtBQUFBLHFEQUFBLENBQUE7QUFBQSxpRUFBQSxDQUFBO0FBQUEsdUVBQUEsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsSUFBQyxDQUFBLE1BQXBCLENBQWQsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLG1CQUFELEdBQXVC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
//# sourceURL=/Users/andytlr/.atom/packages/autocomplete-plus/lib/autocomplete-manager.coffee