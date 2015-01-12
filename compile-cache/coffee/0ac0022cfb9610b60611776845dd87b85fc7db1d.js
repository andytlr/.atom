(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  module.exports = function(_arg) {
    var PaletteProvider, Provider, Suggestion, fuzzaldrin;
    Provider = _arg.Provider, Suggestion = _arg.Suggestion;
    fuzzaldrin = require('fuzzaldrin');
    return PaletteProvider = (function(_super) {
      __extends(PaletteProvider, _super);

      function PaletteProvider(editorView, module) {
        this.module = module;
        PaletteProvider.__super__.constructor.call(this, editorView);
      }

      PaletteProvider.prototype.wordRegex = /(@|\$)*\b\w*[a-zA-Z_]\w*\b/g;

      PaletteProvider.prototype.buildSuggestions = function() {
        var allNames, matchedNames, palette, prefix, selection, suggestions, _ref;
        if (_ref = this.editor.getGrammar().scopeName, __indexOf.call(atom.config.get('project-palette-finder.autocompleteScopes'), _ref) < 0) {
          return;
        }
        selection = this.editor.getSelection();
        prefix = this.prefixOfSelection(selection);
        if (!prefix.length) {
          return;
        }
        suggestions = [];
        palette = this.module.palette;
        allNames = palette.items.map(function(i) {
          return i.name;
        });
        matchedNames = fuzzaldrin.filter(allNames, prefix);
        palette.items.forEach((function(_this) {
          return function(item) {
            var _ref1;
            if (_ref1 = item.name, __indexOf.call(matchedNames, _ref1) < 0) {
              return;
            }
            return suggestions.push(new Suggestion(_this, {
              word: item.name,
              label: "<span class='color-suggestion-preview' style='background: " + (item.color.toCSS()) + "'></span>",
              renderLabelAsHtml: true,
              className: 'color-suggestion',
              prefix: prefix
            }));
          };
        })(this));
        return suggestions;
      };

      return PaletteProvider;

    })(Provider);
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBOzt5SkFBQTs7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsSUFBRCxHQUFBO0FBQ2YsUUFBQSxpREFBQTtBQUFBLElBRGlCLGdCQUFBLFVBQVUsa0JBQUEsVUFDM0IsQ0FBQTtBQUFBLElBQUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxZQUFSLENBQWIsQ0FBQTtXQUVNO0FBQ0osd0NBQUEsQ0FBQTs7QUFBYSxNQUFBLHlCQUFDLFVBQUQsRUFBYyxNQUFkLEdBQUE7QUFDWCxRQUR3QixJQUFDLENBQUEsU0FBQSxNQUN6QixDQUFBO0FBQUEsUUFBQSxpREFBTSxVQUFOLENBQUEsQ0FEVztNQUFBLENBQWI7O0FBQUEsZ0NBR0EsU0FBQSxHQUFXLDZCQUhYLENBQUE7O0FBQUEsZ0NBSUEsZ0JBQUEsR0FBa0IsU0FBQSxHQUFBO0FBQ2hCLFlBQUEscUVBQUE7QUFBQSxRQUFBLFdBQWMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFSLENBQUEsQ0FBb0IsQ0FBQyxTQUFyQixFQUFBLGVBQWtDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiwyQ0FBaEIsQ0FBbEMsRUFBQSxJQUFBLEtBQWQ7QUFBQSxnQkFBQSxDQUFBO1NBQUE7QUFBQSxRQUNBLFNBQUEsR0FBWSxJQUFDLENBQUEsTUFBTSxDQUFDLFlBQVIsQ0FBQSxDQURaLENBQUE7QUFBQSxRQUVBLE1BQUEsR0FBUyxJQUFDLENBQUEsaUJBQUQsQ0FBbUIsU0FBbkIsQ0FGVCxDQUFBO0FBR0EsUUFBQSxJQUFBLENBQUEsTUFBb0IsQ0FBQyxNQUFyQjtBQUFBLGdCQUFBLENBQUE7U0FIQTtBQUFBLFFBS0EsV0FBQSxHQUFjLEVBTGQsQ0FBQTtBQUFBLFFBT0EsT0FBQSxHQUFVLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FQbEIsQ0FBQTtBQUFBLFFBUUEsUUFBQSxHQUFXLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBZCxDQUFrQixTQUFDLENBQUQsR0FBQTtpQkFBTyxDQUFDLENBQUMsS0FBVDtRQUFBLENBQWxCLENBUlgsQ0FBQTtBQUFBLFFBU0EsWUFBQSxHQUFlLFVBQVUsQ0FBQyxNQUFYLENBQWtCLFFBQWxCLEVBQTRCLE1BQTVCLENBVGYsQ0FBQTtBQUFBLFFBV0EsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFkLENBQXNCLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQyxJQUFELEdBQUE7QUFDcEIsZ0JBQUEsS0FBQTtBQUFBLFlBQUEsWUFBYyxJQUFJLENBQUMsSUFBTCxFQUFBLGVBQWEsWUFBYixFQUFBLEtBQUEsS0FBZDtBQUFBLG9CQUFBLENBQUE7YUFBQTttQkFDQSxXQUFXLENBQUMsSUFBWixDQUFxQixJQUFBLFVBQUEsQ0FBVyxLQUFYLEVBQWlCO0FBQUEsY0FDcEMsSUFBQSxFQUFNLElBQUksQ0FBQyxJQUR5QjtBQUFBLGNBRXBDLEtBQUEsRUFBUSw0REFBQSxHQUEyRCxDQUFBLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBWCxDQUFBLENBQUEsQ0FBM0QsR0FBK0UsV0FGbkQ7QUFBQSxjQUdwQyxpQkFBQSxFQUFtQixJQUhpQjtBQUFBLGNBSXBDLFNBQUEsRUFBVyxrQkFKeUI7QUFBQSxjQUtwQyxRQUFBLE1BTG9DO2FBQWpCLENBQXJCLEVBRm9CO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEIsQ0FYQSxDQUFBO2VBcUJBLFlBdEJnQjtNQUFBLENBSmxCLENBQUE7OzZCQUFBOztPQUQ0QixVQUhmO0VBQUEsQ0FBakIsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/andytlr/.atom/packages/project-palette-finder/lib/palette-provider.coffee