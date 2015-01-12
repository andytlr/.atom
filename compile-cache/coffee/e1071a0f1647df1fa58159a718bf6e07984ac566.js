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

    AutocompleteView.prototype.onSaved = function() {
      return this.cancel();
    };

    AutocompleteView.prototype.onChanged = function(e) {
      var typedText;
      typedText = e.newText.trim();
      if (typedText.length === 1 && atom.config.get("autocomplete-plus.enableAutoActivation")) {
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGtIQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsT0FBMEIsT0FBQSxDQUFRLE1BQVIsQ0FBMUIsRUFBQyxjQUFBLE1BQUQsRUFBUyxTQUFBLENBQVQsRUFBWSxVQUFBLEVBQVosRUFBZ0IsYUFBQSxLQUFoQixDQUFBOztBQUFBLEVBQ0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQURKLENBQUE7O0FBQUEsRUFFQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FGUCxDQUFBOztBQUFBLEVBR0EsU0FBQSxHQUFZLE9BQUEsQ0FBUSxXQUFSLENBSFosQ0FBQTs7QUFBQSxFQUlBLG9CQUFBLEdBQXVCLE9BQUEsQ0FBUSwyQkFBUixDQUp2QixDQUFBOztBQUFBLEVBS0EsYUFBQSxHQUFnQixPQUFBLENBQVEsa0JBQVIsQ0FMaEIsQ0FBQTs7QUFBQSxFQU1BLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUixDQU5QLENBQUE7O0FBQUEsRUFPQSxLQUFBLEdBQVEsT0FBQSxDQUFRLFNBQVIsQ0FQUixDQUFBOztBQUFBLEVBU0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLHVDQUFBLENBQUE7Ozs7Ozs7Ozs7S0FBQTs7QUFBQSwrQkFBQSxhQUFBLEdBQWUsSUFBZixDQUFBOztBQUFBLCtCQUNBLEtBQUEsR0FBTyxLQURQLENBQUE7O0FBQUEsK0JBT0EsVUFBQSxHQUFZLFNBQUUsVUFBRixHQUFBO0FBQ1YsTUFEVyxJQUFDLENBQUEsYUFBQSxVQUNaLENBQUE7QUFBQSxNQUFDLElBQUMsQ0FBQSxTQUFVLElBQUMsQ0FBQSxXQUFYLE1BQUYsQ0FBQTtBQUFBLE1BRUEsa0RBQUEsU0FBQSxDQUZBLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxRQUFELENBQVUsbUJBQVYsQ0FKQSxDQUFB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
//# sourceURL=/Users/andytlr/.atom/packages/autocomplete-plus/lib/autocomplete-view.coffee