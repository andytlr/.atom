(function() {
  var AutocompleteManager, Provider, SelectListElement, Suggestion, deprecate, _;

  _ = require('underscore-plus');

  AutocompleteManager = require('./autocomplete-manager');

  SelectListElement = require('./select-list-element');

  Provider = require('./provider');

  Suggestion = require('./suggestion');

  deprecate = require('grim').deprecate;

  module.exports = {
    config: {
      includeCompletionsFromAllBuffers: {
        type: "boolean",
        "default": false
      },
      fileBlacklist: {
        type: "string",
        "default": ".*, *.md"
      },
      enableAutoActivation: {
        type: "boolean",
        "default": true
      },
      autoActivationDelay: {
        type: "integer",
        "default": 100
      },
      maxSuggestions: {
        type: "integer",
        "default": 10
      }
    },
    autocompleteManagers: [],
    editorSubscription: null,
    activate: function() {
      atom.views.addViewProvider(AutocompleteManager, (function(_this) {
        return function(model) {
          var element;
          element = new SelectListElement();
          element.setModel(model);
          return element;
        };
      })(this));
      return this.editorSubscription = atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          var autocompleteManager;
          autocompleteManager = new AutocompleteManager(editor);
          editor.onDidDestroy(function() {
            autocompleteManager.dispose();
            return _.remove(_this.autocompleteManagers, autocompleteManager);
          });
          return _this.autocompleteManagers.push(autocompleteManager);
        };
      })(this));
    },
    deactivate: function() {
      var _ref;
      if ((_ref = this.editorSubscription) != null) {
        _ref.dispose();
      }
      this.editorSubscription = null;
      this.autocompleteManagers.forEach(function(autocompleteManager) {
        return autocompleteManager.dispose();
      });
      return this.autocompleteManagers = [];
    },
    registerProviderForEditorView: function(provider, editorView) {
      deprecate('Use of editorView is deprecated, use registerProviderForEditor instead');
      return this.registerProviderForEditor(provider, editorView != null ? editorView.getModel() : void 0);
    },
    registerProviderForEditor: function(provider, editor) {
      var autocompleteManager;
      if (provider == null) {
        return;
      }
      if (editor == null) {
        return;
      }
      autocompleteManager = _.findWhere(this.autocompleteManagers, {
        editor: editor
      });
      if (autocompleteManager == null) {
        throw new Error("Could not register provider", provider.constructor.name);
      }
      return autocompleteManager.registerProvider(provider);
    },
    unregisterProvider: function(provider) {
      var autocompleteManager, _i, _len, _ref, _results;
      _ref = this.autocompleteManagers;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        autocompleteManager = _ref[_i];
        _results.push(autocompleteManager.unregisterProvider(provider));
      }
      return _results;
    },
    Provider: Provider,
    Suggestion: Suggestion
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDBFQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQSxtQkFBQSxHQUFzQixPQUFBLENBQVEsd0JBQVIsQ0FEdEIsQ0FBQTs7QUFBQSxFQUVBLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSx1QkFBUixDQUZwQixDQUFBOztBQUFBLEVBR0EsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSLENBSFgsQ0FBQTs7QUFBQSxFQUlBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUixDQUpiLENBQUE7O0FBQUEsRUFLQyxZQUFhLE9BQUEsQ0FBUSxNQUFSLEVBQWIsU0FMRCxDQUFBOztBQUFBLEVBT0EsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsTUFBQSxFQUNFO0FBQUEsTUFBQSxnQ0FBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLEtBRFQ7T0FERjtBQUFBLE1BR0EsYUFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sUUFBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLFVBRFQ7T0FKRjtBQUFBLE1BTUEsb0JBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxJQURUO09BUEY7QUFBQSxNQVNBLG1CQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsR0FEVDtPQVZGO0FBQUEsTUFZQSxjQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsRUFEVDtPQWJGO0tBREY7QUFBQSxJQWlCQSxvQkFBQSxFQUFzQixFQWpCdEI7QUFBQSxJQWtCQSxrQkFBQSxFQUFvQixJQWxCcEI7QUFBQSxJQXFCQSxRQUFBLEVBQVUsU0FBQSxHQUFBO0FBRVIsTUFBQSxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQVgsQ0FBMkIsbUJBQTNCLEVBQWdELENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLEtBQUQsR0FBQTtBQUM5QyxjQUFBLE9BQUE7QUFBQSxVQUFBLE9BQUEsR0FBYyxJQUFBLGlCQUFBLENBQUEsQ0FBZCxDQUFBO0FBQUEsVUFDQSxPQUFPLENBQUMsUUFBUixDQUFpQixLQUFqQixDQURBLENBQUE7aUJBRUEsUUFIOEM7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFoRCxDQUFBLENBQUE7YUFNQSxJQUFDLENBQUEsa0JBQUQsR0FBc0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBZixDQUFrQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxNQUFELEdBQUE7QUFDdEQsY0FBQSxtQkFBQTtBQUFBLFVBQUEsbUJBQUEsR0FBMEIsSUFBQSxtQkFBQSxDQUFvQixNQUFwQixDQUExQixDQUFBO0FBQUEsVUFFQSxNQUFNLENBQUMsWUFBUCxDQUFvQixTQUFBLEdBQUE7QUFDbEIsWUFBQSxtQkFBbUIsQ0FBQyxPQUFwQixDQUFBLENBQUEsQ0FBQTttQkFDQSxDQUFDLENBQUMsTUFBRixDQUFTLEtBQUMsQ0FBQSxvQkFBVixFQUFnQyxtQkFBaEMsRUFGa0I7VUFBQSxDQUFwQixDQUZBLENBQUE7aUJBTUEsS0FBQyxDQUFBLG9CQUFvQixDQUFDLElBQXRCLENBQTJCLG1CQUEzQixFQVBzRDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxDLEVBUmQ7SUFBQSxDQXJCVjtBQUFBLElBdUNBLFVBQUEsRUFBWSxTQUFBLEdBQUE7QUFDVixVQUFBLElBQUE7O1lBQW1CLENBQUUsT0FBckIsQ0FBQTtPQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsa0JBQUQsR0FBc0IsSUFEdEIsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLG9CQUFvQixDQUFDLE9BQXRCLENBQThCLFNBQUMsbUJBQUQsR0FBQTtlQUF5QixtQkFBbUIsQ0FBQyxPQUFwQixDQUFBLEVBQXpCO01BQUEsQ0FBOUIsQ0FGQSxDQUFBO2FBR0EsSUFBQyxDQUFBLG9CQUFELEdBQXdCLEdBSmQ7SUFBQSxDQXZDWjtBQUFBLElBNkNBLDZCQUFBLEVBQStCLFNBQUMsUUFBRCxFQUFXLFVBQVgsR0FBQTtBQUM3QixNQUFBLFNBQUEsQ0FBVSx3RUFBVixDQUFBLENBQUE7YUFDQSxJQUFDLENBQUEseUJBQUQsQ0FBMkIsUUFBM0IsdUJBQXFDLFVBQVUsQ0FBRSxRQUFaLENBQUEsVUFBckMsRUFGNkI7SUFBQSxDQTdDL0I7QUFBQSxJQXNEQSx5QkFBQSxFQUEyQixTQUFDLFFBQUQsRUFBVyxNQUFYLEdBQUE7QUFDekIsVUFBQSxtQkFBQTtBQUFBLE1BQUEsSUFBYyxnQkFBZDtBQUFBLGNBQUEsQ0FBQTtPQUFBO0FBQ0EsTUFBQSxJQUFjLGNBQWQ7QUFBQSxjQUFBLENBQUE7T0FEQTtBQUFBLE1BRUEsbUJBQUEsR0FBc0IsQ0FBQyxDQUFDLFNBQUYsQ0FBWSxJQUFDLENBQUEsb0JBQWIsRUFBbUM7QUFBQSxRQUFBLE1BQUEsRUFBUSxNQUFSO09BQW5DLENBRnRCLENBQUE7QUFHQSxNQUFBLElBQU8sMkJBQVA7QUFDRSxjQUFVLElBQUEsS0FBQSxDQUFNLDZCQUFOLEVBQXFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBMUQsQ0FBVixDQURGO09BSEE7YUFNQSxtQkFBbUIsQ0FBQyxnQkFBcEIsQ0FBcUMsUUFBckMsRUFQeUI7SUFBQSxDQXREM0I7QUFBQSxJQWtFQSxrQkFBQSxFQUFvQixTQUFDLFFBQUQsR0FBQTtBQUNsQixVQUFBLDZDQUFBO0FBQUE7QUFBQTtXQUFBLDJDQUFBO3VDQUFBO0FBQUEsc0JBQUEsbUJBQW1CLENBQUMsa0JBQXBCLENBQXVDLFFBQXZDLEVBQUEsQ0FBQTtBQUFBO3NCQURrQjtJQUFBLENBbEVwQjtBQUFBLElBcUVBLFFBQUEsRUFBVSxRQXJFVjtBQUFBLElBc0VBLFVBQUEsRUFBWSxVQXRFWjtHQVJGLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/andytlr/.atom/packages/autocomplete-plus/lib/main.coffee