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


    /*
     * Makes sure we're listening to editor and buffer events, sets
     * the current buffer
     * @param  {EditorView} @editorView
     * @private
     */

    AutocompleteView.prototype.initialize = function(editorView) {
      this.editorView = editorView;
      this.editor = this.editorView.editor;
      AutocompleteView.__super__.initialize.apply(this, arguments);
      this.addClass("autocomplete-plus");
      this.providers = [];
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


    /*
     * Checks whether the current file is blacklisted
     * @return {Boolean}
     * @private
     */

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


    /*
     * Creates a view for the given item
     * @return {jQuery}
     * @private
     */

    AutocompleteView.prototype.viewForItem = function(_arg) {
      var label, word;
      word = _arg.word, label = _arg.label;
      return $$(function() {
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
    };


    /*
     * Handles editor events
     * @private
     */

    AutocompleteView.prototype.handleEvents = function() {
      this.list.on("mousewheel", function(event) {
        return event.stopPropagation();
      });
      this.editor.on("title-changed-subscription-removed", this.cancel);
      return this.editor.on("cursor-moved", this.cursorMoved);
    };


    /*
     * Registers the given provider
     * @param  {Provider} provider
     * @public
     */

    AutocompleteView.prototype.registerProvider = function(provider) {
      if (_.findWhere(this.providers, provider) == null) {
        return this.providers.push(provider);
      }
    };


    /*
     * Unregisters the given provider
     * @param  {Provider} provider
     * @public
     */

    AutocompleteView.prototype.unregisterProvider = function(provider) {
      return _.remove(this.providers, provider);
    };


    /*
     * Gets called when the user successfully confirms a suggestion
     * @private
     */

    AutocompleteView.prototype.confirmed = function(match) {
      var position, replace;
      replace = match.provider.confirm(match);
      this.editor.getSelection().clear();
      this.cancel();
      if (!match) {
        return;
      }
      if (replace) {
        this.replaceTextWithMatch(match);
        position = this.editor.getCursorBufferPosition();
        return this.editor.setCursorBufferPosition([position.row, position.column]);
      }
    };


    /*
     * Focuses the editor again
     * @param {Boolean} focus
     * @private
     */

    AutocompleteView.prototype.cancel = function(focus) {
      if (focus == null) {
        focus = true;
      }
      AutocompleteView.__super__.cancel.apply(this, arguments);
      if (focus) {
        return this.editorView.focus();
      }
    };


    /*
     * Finds suggestions for the current prefix, sets the list items,
     * positions the overlay and shows it
     * @private
     */

    AutocompleteView.prototype.runAutocompletion = function() {
      var provider, providerSuggestions, suggestions, _i, _len, _ref1;
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
        return;
      }
      this.setItems(suggestions);
      this.editorView.appendToLinesView(this);
      this.setPosition();
      return this.setActive();
    };


    /*
     * Gets called when the content has been modified
     * @private
     */

    AutocompleteView.prototype.contentsModified = function() {
      var delay;
      delay = parseInt(atom.config.get("autocomplete-plus.autoActivationDelay"));
      if (this.delayTimeout) {
        clearTimeout(this.delayTimeout);
      }
      return this.delayTimeout = setTimeout(this.runAutocompletion, delay);
    };


    /*
     * Gets called when the cursor has moved. Cancels the autocompletion if
     * the text has not been changed and the autocompletion is
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */

    AutocompleteView.prototype.cursorMoved = function(data) {
      if (!data.textChanged) {
        return this.cancel();
      }
    };


    /*
     * Gets called when the user saves the document. Rebuilds the word
     * list and cancels the autocompletion
     * @private
     */

    AutocompleteView.prototype.onSaved = function() {
      return this.cancel();
    };


    /*
     * Cancels the autocompletion if the user entered more than one character
     * with a single keystroke. (= pasting)
     * @param  {Event} e
     * @private
     */

    AutocompleteView.prototype.onChanged = function(e) {
      var focus;
      if (e.newText.length === 1 && atom.config.get("autocomplete-plus.enableAutoActivation")) {
        return this.contentsModified();
      } else {
        return this.cancel(focus = false);
      }
    };


    /*
     * Repositions the list view. Checks for boundaries and moves the view
     * above or below the cursor if needed.
     * @private
     */

    AutocompleteView.prototype.setPosition = function() {
      var abovePosition, belowLowerPosition, belowPosition, cursorLeft, cursorTop, left, top, _ref1;
      _ref1 = this.editorView.pixelPositionForScreenPosition(this.editor.getCursorScreenPosition()), left = _ref1.left, top = _ref1.top;
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


    /*
     * Replaces the current prefix with the given match
     * @param {Object} match
     * @private
     */

    AutocompleteView.prototype.replaceTextWithMatch = function(match) {
      var buffer, cursorPosition, selection, startPosition, suffixLength;
      selection = this.editor.getSelection();
      startPosition = selection.getBufferRange().start;
      buffer = this.editor.getBuffer();
      cursorPosition = this.editor.getCursorBufferPosition();
      buffer["delete"](Range.fromPointWithDelta(cursorPosition, 0, -match.prefix.length));
      this.editor.insertText(match.word);
      suffixLength = match.word.length - match.prefix.length;
      return this.editor.setSelectedBufferRange([startPosition, [startPosition.row, startPosition.column + suffixLength]]);
    };


    /*
     * As soon as the list is in the DOM tree, it calculates the maximum width of
     * all list items and resizes the list so that all items fit
     * @param {Boolean} onDom
     *
     */

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


    /*
     * Updates the list's position when populating results
     * @private
     */

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


    /*
     * Sets the current buffer, starts listening to change events and delegates
     * them to #onChanged()
     * @param {TextBuffer}
     * @private
     */

    AutocompleteView.prototype.setCurrentBuffer = function(currentBuffer) {
      this.currentBuffer = currentBuffer;
      this.currentBuffer.on("saved", this.onSaved);
      return this.currentBuffer.on("changed", this.onChanged);
    };


    /*
     * Why are we doing this again...?
     * Might be because of autosave:
     * http://git.io/iF32wA
     * @private
     */

    AutocompleteView.prototype.getModel = function() {
      return null;
    };


    /*
     * Clean up, stop listening to events
     * @public
     */

    AutocompleteView.prototype.dispose = function() {
      var _ref1, _ref2;
      if ((_ref1 = this.currentBuffer) != null) {
        _ref1.off("changed", this.onChanged);
      }
      if ((_ref2 = this.currentBuffer) != null) {
        _ref2.off("saved", this.onSaved);
      }
      this.editor.off("title-changed-subscription-removed", this.cancel);
      return this.editor.off("cursor-moved", this.cursorMoved);
    };

    return AutocompleteView;

  })(SimpleSelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGtIQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsT0FBMEIsT0FBQSxDQUFRLE1BQVIsQ0FBMUIsRUFBQyxjQUFBLE1BQUQsRUFBUyxTQUFBLENBQVQsRUFBWSxVQUFBLEVBQVosRUFBZ0IsYUFBQSxLQUFoQixDQUFBOztBQUFBLEVBQ0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQURKLENBQUE7O0FBQUEsRUFFQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FGUCxDQUFBOztBQUFBLEVBR0EsU0FBQSxHQUFZLE9BQUEsQ0FBUSxXQUFSLENBSFosQ0FBQTs7QUFBQSxFQUlBLG9CQUFBLEdBQXVCLE9BQUEsQ0FBUSwyQkFBUixDQUp2QixDQUFBOztBQUFBLEVBS0EsYUFBQSxHQUFnQixPQUFBLENBQVEsa0JBQVIsQ0FMaEIsQ0FBQTs7QUFBQSxFQU1BLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUixDQU5QLENBQUE7O0FBQUEsRUFPQSxLQUFBLEdBQVEsT0FBQSxDQUFRLFNBQVIsQ0FQUixDQUFBOztBQUFBLEVBU0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLHVDQUFBLENBQUE7Ozs7Ozs7Ozs7S0FBQTs7QUFBQSwrQkFBQSxhQUFBLEdBQWUsSUFBZixDQUFBOztBQUFBLCtCQUNBLEtBQUEsR0FBTyxLQURQLENBQUE7O0FBR0E7QUFBQTs7Ozs7T0FIQTs7QUFBQSwrQkFTQSxVQUFBLEdBQVksU0FBRSxVQUFGLEdBQUE7QUFDVixNQURXLElBQUMsQ0FBQSxhQUFBLFVBQ1osQ0FBQTtBQUFBLE1BQUMsSUFBQyxDQUFBLFNBQVUsSUFBQyxDQUFBLFdBQVgsTUFBRixDQUFBO0FBQUEsTUFFQSxrREFBQSxTQUFBLENBRkEsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLFFBQUQs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
//# sourceURL=/Users/andytlr/.atom/packages/autocomplete-plus/lib/autocomplete-view.coffee