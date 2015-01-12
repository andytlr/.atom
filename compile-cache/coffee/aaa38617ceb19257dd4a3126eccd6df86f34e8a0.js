(function() {
  var $, $$, AutocompleteView, Editor, FuzzyProvider, Perf, Range, SimpleSelectListView, Utils, minimatch, path, _, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require("atom"), Editor = _ref.Editor, $ = _ref.$, $$ = _ref.$$, Range = _ref.Range;

  _ = require("underscore-plus");

  path = require("path");

  minimatch = require("minimatch");

  SimpleSelectListView = require("./simple-select-list-view");

  FuzzyProvider = require("./fuzzy-provider");

  Perf = require("./perf");

  Utils = require("./utils");

  module.exports = AutocompleteView = (function(_super) {
    __extends(AutocompleteView, _super);

    function AutocompleteView() {
      this.onChanged = __bind(this.onChanged, this);
      this.onSaved = __bind(this.onSaved, this);
      this.editorHasFocus = __bind(this.editorHasFocus, this);
      this.cursorMoved = __bind(this.cursorMoved, this);
      this.contentsModified = __bind(this.contentsModified, this);
      this.runAutocompletion = __bind(this.runAutocompletion, this);
      this.cancel = __bind(this.cancel, this);
      return AutocompleteView.__super__.constructor.apply(this, arguments);
    }

    AutocompleteView.prototype.currentBuffer = null;

    AutocompleteView.prototype.debug = false;

    AutocompleteView.prototype.initialize = function(editorView) {
      this.editorView = editorView;
      this.editor = this.editorView.editor;
      AutocompleteView.__super__.initialize.apply(this, arguments);
      this.addClass("autocomplete-plus");
      this.providers = [];
      this.disposableEvents = [];
      if (this.currentFileBlacklisted()) {
        return;
      }
      this.registerProvider(new FuzzyProvider(this.editorView));
      this.handleEvents();
      this.setCurrentBuffer(this.editor.getBuffer());
      this.subscribeToCommand(this.editorView, "autocomplete-plus:activate", this.runAutocompletion);
      this.on("autocomplete-plus:select-next", (function(_this) {
        return function() {
          return _this.selectNextItemView();
        };
      })(this));
      this.on("autocomplete-plus:select-previous", (function(_this) {
        return function() {
          return _this.selectPreviousItemView();
        };
      })(this));
      return this.on("autocomplete-plus:cancel", (function(_this) {
        return function() {
          return _this.cancel();
        };
      })(this));
    };

    AutocompleteView.prototype.currentFileBlacklisted = function() {
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

    AutocompleteView.prototype.viewForItem = function(_arg) {
      var className, item, label, renderLabelAsHtml, word;
      word = _arg.word, label = _arg.label, renderLabelAsHtml = _arg.renderLabelAsHtml, className = _arg.className;
      item = $$(function() {
        return this.li((function(_this) {
          return function() {
            _this.span(word, {
              "class": "word"
            });
            if (label != null) {
              return _this.span(label, {
                "class": "label"
              });
            }
          };
        })(this));
      });
      if (renderLabelAsHtml) {
        item.find(".label").html(label);
      }
      if (className != null) {
        item.addClass(className);
      }
      return item;
    };

    AutocompleteView.prototype.escapeHtml = function(string) {
      var escapedString;
      escapedString = string.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return escapedString;
    };

    AutocompleteView.prototype.handleEvents = function() {
      this.disposableEvents = [this.editor.onDidChangeCursorPosition(this.cursorMoved), this.editor.onDidChangeTitle(this.cancel)];
      this.list.on("mousewheel", function(event) {
        return event.stopPropagation();
      });
      this.hiddenInput.on('compositionstart', (function(_this) {
        return function() {
          _this.compositionInProgress = true;
          return null;
        };
      })(this));
      return this.hiddenInput.on('compositionend', (function(_this) {
        return function() {
          _this.compositionInProgress = false;
          return null;
        };
      })(this));
    };

    AutocompleteView.prototype.registerProvider = function(provider) {
      if (_.findWhere(this.providers, provider) == null) {
        return this.providers.push(provider);
      }
    };

    AutocompleteView.prototype.unregisterProvider = function(provider) {
      return _.remove(this.providers, provider);
    };

    AutocompleteView.prototype.confirmed = function(match) {
      var replace;
      replace = match.provider.confirm(match);
      this.editor.getSelections().forEach(function(selection) {
        return selection.clear();
      });
      this.cancel();
      if (!replace) {
        return;
      }
      this.replaceTextWithMatch(match);
      return this.editor.getCursors().forEach(function(cursor) {
        var position;
        position = cursor.getBufferPosition();
        return cursor.setBufferPosition([position.row, position.column]);
      });
    };

    AutocompleteView.prototype.cancel = function() {
      if (!this.active) {
        return;
      }
      AutocompleteView.__super__.cancel.apply(this, arguments);
      if (!this.editorView.hasFocus()) {
        return this.editorView.focus();
      }
    };

    AutocompleteView.prototype.runAutocompletion = function() {
      var error, provider, providerSuggestions, suggestions, _i, _len, _ref1;
      if (this.compositionInProgress) {
        return;
      }
      suggestions = [];
      _ref1 = this.providers.slice().reverse();
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        provider = _ref1[_i];
        providerSuggestions = provider.buildSuggestions();
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
        return this.cancel();
      }
      this.setItems(suggestions);
      try {
        this.editorView.appendToLinesView(this);
        this.setPosition();
      } catch (_error) {
        error = _error;
      }
      return this.setActive();
    };

    AutocompleteView.prototype.contentsModified = function() {
      var delay;
      delay = parseInt(atom.config.get("autocomplete-plus.autoActivationDelay"));
      if (this.delayTimeout) {
        clearTimeout(this.delayTimeout);
      }
      return this.delayTimeout = setTimeout(this.runAutocompletion, delay);
    };

    AutocompleteView.prototype.cursorMoved = function(data) {
      if (!data.textChanged) {
        return this.cancel();
      }
    };

    AutocompleteView.prototype.editorHasFocus = function() {
      var editorView;
      editorView = this.editorView;
      if (editorView.jquery) {
        editorView = editorView[0];
      }
      return editorView.hasFocus();
    };

    AutocompleteView.prototype.onSaved = function() {
      if (!this.editorHasFocus()) {
        return;
      }
      return this.cancel();
    };

    AutocompleteView.prototype.onChanged = function(e) {
      if (!this.editorHasFocus()) {
        return;
      }
      if (atom.config.get("autocomplete-plus.enableAutoActivation") && (e.newText.trim().length === 1 || e.oldText.trim().length === 1)) {
        return this.contentsModified();
      } else {
        return this.cancel();
      }
    };

    AutocompleteView.prototype.setPosition = function() {
      var abovePosition, belowLowerPosition, belowPosition, cursorLeft, cursorTop, left, top, _ref1;
      _ref1 = this.editor.pixelPositionForScreenPosition(this.editor.getCursorScreenPosition()), left = _ref1.left, top = _ref1.top;
      cursorLeft = left;
      cursorTop = top;
      belowPosition = cursorTop + this.editorView.lineHeight;
      belowLowerPosition = belowPosition + this.outerHeight();
      abovePosition = cursorTop;
      if (belowLowerPosition > this.editorView.outerHeight() + this.editorView.scrollTop()) {
        this.css({
          left: cursorLeft,
          top: abovePosition
        });
        return this.css("-webkit-transform", "translateY(-100%)");
      } else {
        this.css({
          left: cursorLeft,
          top: belowPosition
        });
        return this.css("-webkit-transform", "");
      }
    };

    AutocompleteView.prototype.replaceTextWithMatch = function(match) {
      var newSelectedBufferRanges, selections;
      newSelectedBufferRanges = [];
      selections = this.editor.getSelections();
      selections.forEach((function(_this) {
        return function(selection, i) {
          var buffer, cursorPosition, infixLength, startPosition;
          startPosition = selection.getBufferRange().start;
          buffer = _this.editor.getBuffer();
          selection.deleteSelectedText();
          cursorPosition = _this.editor.getCursors()[i].getBufferPosition();
          buffer["delete"](Range.fromPointWithDelta(cursorPosition, 0, -match.prefix.length));
          infixLength = match.word.length - match.prefix.length;
          return newSelectedBufferRanges.push([startPosition, [startPosition.row, startPosition.column + infixLength]]);
        };
      })(this));
      this.editor.insertText(match.word);
      return this.editor.setSelectedBufferRanges(newSelectedBufferRanges);
    };

    AutocompleteView.prototype.afterAttach = function(onDom) {
      var widestCompletion;
      if (!onDom) {
        return;
      }
      widestCompletion = parseInt(this.css("min-width")) || 0;
      this.list.find("li").each(function() {
        var labelWidth, totalWidth, wordWidth;
        wordWidth = $(this).find("span.word").outerWidth();
        labelWidth = $(this).find("span.label").outerWidth();
        totalWidth = wordWidth + labelWidth + 40;
        return widestCompletion = Math.max(widestCompletion, totalWidth);
      });
      this.list.width(widestCompletion);
      return this.width(this.list.outerWidth());
    };

    AutocompleteView.prototype.populateList = function() {
      var p;
      p = new Perf("Populating list", {
        debug: this.debug
      });
      p.start();
      AutocompleteView.__super__.populateList.apply(this, arguments);
      p.stop();
      return this.setPosition();
    };

    AutocompleteView.prototype.setCurrentBuffer = function(currentBuffer) {
      this.currentBuffer = currentBuffer;
      this.disposableEvents.push(this.currentBuffer.onDidSave(this.onSaved));
      return this.disposableEvents.push(this.currentBuffer.onDidChange(this.onChanged));
    };

    AutocompleteView.prototype.getModel = function() {
      return null;
    };

    AutocompleteView.prototype.dispose = function() {
      var disposable, provider, _i, _j, _len, _len1, _ref1, _ref2, _results;
      _ref1 = this.providers;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        provider = _ref1[_i];
        if (provider.dispose != null) {
          provider.dispose();
        }
      }
      _ref2 = this.disposableEvents;
      _results = [];
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        disposable = _ref2[_j];
        _results.push(disposable.dispose());
      }
      return _results;
    };

    return AutocompleteView;

  })(SimpleSelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGtIQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsT0FBMEIsT0FBQSxDQUFRLE1BQVIsQ0FBMUIsRUFBQyxjQUFBLE1BQUQsRUFBUyxTQUFBLENBQVQsRUFBWSxVQUFBLEVBQVosRUFBZ0IsYUFBQSxLQUFoQixDQUFBOztBQUFBLEVBQ0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQURKLENBQUE7O0FBQUEsRUFFQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FGUCxDQUFBOztBQUFBLEVBR0EsU0FBQSxHQUFZLE9BQUEsQ0FBUSxXQUFSLENBSFosQ0FBQTs7QUFBQSxFQUlBLG9CQUFBLEdBQXVCLE9BQUEsQ0FBUSwyQkFBUixDQUp2QixDQUFBOztBQUFBLEVBS0EsYUFBQSxHQUFnQixPQUFBLENBQVEsa0JBQVIsQ0FMaEIsQ0FBQTs7QUFBQSxFQU1BLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUixDQU5QLENBQUE7O0FBQUEsRUFPQSxLQUFBLEdBQVEsT0FBQSxDQUFRLFNBQVIsQ0FQUixDQUFBOztBQUFBLEVBU0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLHVDQUFBLENBQUE7Ozs7Ozs7Ozs7O0tBQUE7O0FBQUEsK0JBQUEsYUFBQSxHQUFlLElBQWYsQ0FBQTs7QUFBQSwrQkFDQSxLQUFBLEdBQU8sS0FEUCxDQUFBOztBQUFBLCtCQU9BLFVBQUEsR0FBWSxTQUFFLFVBQUYsR0FBQTtBQUNWLE1BRFcsSUFBQyxDQUFBLGFBQUEsVUFDWixDQUFBO0FBQUEsTUFBQyxJQUFDLENBQUEsU0FBVSxJQUFDLENBQUEsV0FBWCxNQUFGLENBQUE7QUFBQSxNQUVBLGtEQUFBLFNBQUEsQ0FGQSxDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsUUFBRCxDQUFVLG1CQUFWLENBSkEsQ0FB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
//# sourceURL=/Users/andytlr/.atom/packages/autocomplete-plus/lib/autocomplete-view.coffee