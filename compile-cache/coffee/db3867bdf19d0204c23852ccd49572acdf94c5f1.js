(function() {
  var FuzzyProvider, Perf, Provider, Suggestion, Utils, fuzzaldrin, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require("underscore-plus");

  Suggestion = require("./suggestion");

  Utils = require("./utils");

  fuzzaldrin = require("fuzzaldrin");

  Provider = require("./provider");

  Perf = require("./perf");

  module.exports = FuzzyProvider = (function(_super) {
    __extends(FuzzyProvider, _super);

    function FuzzyProvider() {
      this.onChanged = __bind(this.onChanged, this);
      this.onSaved = __bind(this.onSaved, this);
      return FuzzyProvider.__super__.constructor.apply(this, arguments);
    }

    FuzzyProvider.prototype.wordList = null;

    FuzzyProvider.prototype.debug = false;

    FuzzyProvider.prototype.initialize = function() {
      this.buildWordList();
      this.currentBuffer = this.editor.getBuffer();
      return this.disposableEvents = [this.currentBuffer.onDidSave(this.onSaved), this.currentBuffer.onDidChange(this.onChanged)];
    };

    FuzzyProvider.prototype.buildSuggestions = function() {
      var prefix, selection, suggestions;
      selection = this.editor.getLastSelection();
      prefix = this.prefixOfSelection(selection);
      if (!prefix.length) {
        return;
      }
      suggestions = this.findSuggestionsForWord(prefix);
      if (!suggestions.length) {
        return;
      }
      return suggestions;
    };

    FuzzyProvider.prototype.confirm = function(item) {
      return true;
    };

    FuzzyProvider.prototype.onSaved = function() {
      return this.buildWordList();
    };

    FuzzyProvider.prototype.onChanged = function(e) {
      var newline, wordChars;
      wordChars = "ąàáäâãåæăćęèéëêìíïîłńòóöôõøśșțùúüûñçżź" + "abcdefghijklmnopqrstuvwxyz1234567890";
      if (wordChars.indexOf(e.newText.toLowerCase()) === -1) {
        newline = e.newText === "\n";
        return this.addLastWordToList(e.newRange.start.row, e.newRange.start.column, newline);
      }
    };

    FuzzyProvider.prototype.addLastWordToList = function(row, column, newline) {
      var lastWord;
      lastWord = this.lastTypedWord(row, column, newline);
      if (!lastWord) {
        return;
      }
      if (this.wordList.indexOf(lastWord) < 0) {
        return this.wordList.push(lastWord);
      }
    };

    FuzzyProvider.prototype.lastTypedWord = function(row, column, newline) {
      var lastWord, lineRange, maxColumn;
      if (newline) {
        if (!(column = 0)) {
          maxColumn = column - 1;
        }
      } else {
        maxColumn = column;
      }
      lineRange = [[row, 0], [row, column]];
      lastWord = null;
      this.currentBuffer.scanInRange(this.wordRegex, lineRange, function(_arg) {
        var match, range, stop;
        match = _arg.match, range = _arg.range, stop = _arg.stop;
        return lastWord = match[0];
      });
      return lastWord;
    };

    FuzzyProvider.prototype.buildWordList = function() {
      var buffer, buffers, matches, minimumWordLength, p, wordList, _i, _len;
      wordList = [];
      if (atom.config.get("autocomplete-plus.includeCompletionsFromAllBuffers")) {
        buffers = atom.project.getBuffers();
      } else {
        buffers = [this.editor.getBuffer()];
      }
      p = new Perf("Building word list", {
        debug: this.debug
      });
      p.start();
      matches = [];
      for (_i = 0, _len = buffers.length; _i < _len; _i++) {
        buffer = buffers[_i];
        matches.push(buffer.getText().match(this.wordRegex));
      }
      wordList = _.flatten(matches);
      wordList = Utils.unique(wordList);
      minimumWordLength = atom.config.get("autocomplete-plus.minimumWordLength");
      if (minimumWordLength) {
        wordList = wordList.filter(function(word) {
          return (word != null ? word.length : void 0) >= minimumWordLength;
        });
      }
      this.wordList = wordList;
      return p.stop();
    };

    FuzzyProvider.prototype.findSuggestionsForWord = function(prefix) {
      var p, results, word, wordList, words;
      p = new Perf("Finding matches for '" + prefix + "'", {
        debug: this.debug
      });
      p.start();
      wordList = this.wordList.concat(this.getCompletionsForCursorScope());
      words = atom.config.get("autocomplete-plus.strictMatching") ? this.wordList.filter(function(word) {
        return word.indexOf(prefix) === 0;
      }) : fuzzaldrin.filter(wordList, prefix);
      results = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = words.length; _i < _len; _i++) {
          word = words[_i];
          if (word !== prefix) {
            _results.push(new Suggestion(this, {
              word: word,
              prefix: prefix
            }));
          }
        }
        return _results;
      }).call(this);
      p.stop();
      return results;
    };

    FuzzyProvider.prototype.getCompletionsForCursorScope = function() {
      var completions, cursorScope;
      cursorScope = this.editor.scopeDescriptorForBufferPosition(this.editor.getCursorBufferPosition());
      completions = atom.config.settingsForScopeDescriptor(cursorScope.getScopesArray(), "editor.completions");
      completions = completions.map(function(properties) {
        return _.valueForKeyPath(properties, "editor.completions");
      });
      return Utils.unique(_.flatten(completions));
    };

    FuzzyProvider.prototype.dispose = function() {
      var disposable, _i, _len, _ref, _results;
      _ref = this.disposableEvents;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        disposable = _ref[_i];
        _results.push(disposable.dispose());
      }
      return _results;
    };

    return FuzzyProvider;

  })(Provider);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtEQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVIsQ0FEYixDQUFBOztBQUFBLEVBRUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSLENBRlIsQ0FBQTs7QUFBQSxFQUdBLFVBQUEsR0FBYSxPQUFBLENBQVEsWUFBUixDQUhiLENBQUE7O0FBQUEsRUFJQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVIsQ0FKWCxDQUFBOztBQUFBLEVBS0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSLENBTFAsQ0FBQTs7QUFBQSxFQU9BLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixvQ0FBQSxDQUFBOzs7Ozs7S0FBQTs7QUFBQSw0QkFBQSxRQUFBLEdBQVUsSUFBVixDQUFBOztBQUFBLDRCQUNBLEtBQUEsR0FBTyxLQURQLENBQUE7O0FBQUEsNEJBR0EsVUFBQSxHQUFZLFNBQUEsR0FBQTtBQUNWLE1BQUEsSUFBQyxDQUFBLGFBQUQsQ0FBQSxDQUFBLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBUixDQUFBLENBRmpCLENBQUE7YUFHQSxJQUFDLENBQUEsZ0JBQUQsR0FBb0IsQ0FDbEIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxTQUFmLENBQXlCLElBQUMsQ0FBQSxPQUExQixDQURrQixFQUVsQixJQUFDLENBQUEsYUFBYSxDQUFDLFdBQWYsQ0FBMkIsSUFBQyxDQUFBLFNBQTVCLENBRmtCLEVBSlY7SUFBQSxDQUhaLENBQUE7O0FBQUEsNEJBaUJBLGdCQUFBLEdBQWtCLFNBQUEsR0FBQTtBQUNoQixVQUFBLDhCQUFB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
//# sourceURL=/Users/andytlr/.atom/packages/autocomplete-plus/lib/fuzzy-provider.coffee