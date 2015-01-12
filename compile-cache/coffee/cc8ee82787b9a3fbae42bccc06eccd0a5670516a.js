(function() {
  var AutocompleteView, Provider, Suggestion, semver, _;

  _ = require("underscore-plus");

  AutocompleteView = require("./autocomplete-view");

  Provider = require("./provider");

  Suggestion = require("./suggestion");

  semver = require("semver");

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
      }
    },
    autocompleteViews: [],
    editorSubscription: null,
    activate: function() {
      if (atom.packages.isPackageLoaded("autosave") && semver.lt(atom.packages.getLoadedPackage("autosave").metadata.version, "0.17.0") && atom.config.get("autosave.enabled") && atom.config.get("autocomplete-plus.enableAutoActivation")) {
        atom.config.set("autocomplete-plus.enableAutoActivation", false);
        console.log(atom.packages);
        alert("Warning from autocomplete+:\n\nautocomplete+ is not compatible with the autosave package when the auto-activation feature is enabled. Therefore, auto-activation has been disabled.\n\nautocomplete+ can now only be triggered using the keyboard shortcut `ctrl+space`.");
      }
      return this.editorSubscription = atom.workspaceView.eachEditorView((function(_this) {
        return function(editor) {
          var autocompleteView;
          if (editor.attached && !editor.mini) {
            autocompleteView = new AutocompleteView(editor);
            editor.getModel().onDidDestroy(function() {
              if (!autocompleteView.hasParent()) {
                autocompleteView.remove();
              }
              autocompleteView.dispose();
              return _.remove(_this.autocompleteViews, autocompleteView);
            });
            return _this.autocompleteViews.push(autocompleteView);
          }
        };
      })(this));
    },
    deactivate: function() {
      var _ref;
      if ((_ref = this.editorSubscription) != null) {
        _ref.off();
      }
      this.editorSubscription = null;
      this.autocompleteViews.forEach(function(autocompleteView) {
        return autocompleteView.remove();
      });
      return this.autocompleteViews = [];
    },
    registerProviderForEditorView: function(provider, editorView) {
      var autocompleteView;
      autocompleteView = _.findWhere(this.autocompleteViews, {
        editorView: editorView
      });
      if (autocompleteView == null) {
        throw new Error("Could not register provider", provider.constructor.name);
      }
      return autocompleteView.registerProvider(provider);
    },
    unregisterProvider: function(provider) {
      var view, _i, _len, _ref, _results;
      _ref = this.autocompleteViews;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        view = _ref[_i];
        _results.push(view.unregisterProvider);
      }
      return _results;
    },
    Provider: Provider,
    Suggestion: Suggestion
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlEQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQSxnQkFBQSxHQUFtQixPQUFBLENBQVEscUJBQVIsQ0FEbkIsQ0FBQTs7QUFBQSxFQUVBLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUixDQUZYLENBQUE7O0FBQUEsRUFHQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVIsQ0FIYixDQUFBOztBQUFBLEVBSUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSLENBSlQsQ0FBQTs7QUFBQSxFQU1BLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLE1BQUEsRUFDRTtBQUFBLE1BQUEsZ0NBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxLQURUO09BREY7QUFBQSxNQUdBLGFBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxVQURUO09BSkY7QUFBQSxNQU1BLG9CQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsSUFEVDtPQVBGO0FBQUEsTUFTQSxtQkFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLEdBRFQ7T0FWRjtLQURGO0FBQUEsSUFjQSxpQkFBQSxFQUFtQixFQWRuQjtBQUFBLElBZUEsa0JBQUEsRUFBb0IsSUFmcEI7QUFBQSxJQWtCQSxRQUFBLEVBQVUsU0FBQSxHQUFBO0FBR1IsTUFBQSxJQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixVQUE5QixDQUFBLElBQ0QsTUFBTSxDQUFDLEVBQVAsQ0FBVSxJQUFJLENB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
//# sourceURL=/Users/andytlr/.atom/packages/autocomplete-plus/lib/autocomplete.coffee