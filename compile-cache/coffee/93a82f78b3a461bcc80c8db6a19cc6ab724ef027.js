(function() {
  var AutocompleteView, Provider, Suggestion, _;

  _ = require("underscore-plus");

  AutocompleteView = require("./autocomplete-view");

  Provider = require("./provider");

  Suggestion = require("./suggestion");

  module.exports = {
    configDefaults: {
      includeCompletionsFromAllBuffers: false,
      fileBlacklist: ".*, *.md",
      enableAutoActivation: true,
      autoActivationDelay: 100
    },
    autocompleteViews: [],
    editorSubscription: null,

    /*
     * Creates AutocompleteView instances for all active and future editors
     */
    activate: function() {
      if (atom.packages.isPackageLoaded("autosave") && atom.config.get("autosave.enabled") && atom.config.get("autocomplete-plus.enableAutoActivation")) {
        atom.config.set("autocomplete-plus.enableAutoActivation", false);
        alert("Warning from autocomplete+:\n\nautocomplete+ is not compatible with the autosave package when the auto-activation feature is enabled. Therefore, auto-activation has been disabled.\n\nautocomplete+ can now only be triggered using the keyboard shortcut `ctrl+space`.");
      }
      return this.editorSubscription = atom.workspaceView.eachEditorView((function(_this) {
        return function(editor) {
          var autocompleteView;
          if (editor.attached && !editor.mini) {
            autocompleteView = new AutocompleteView(editor);
            editor.on("editor:will-be-removed", function() {
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

    /*
     * Cleans everything up, removes all AutocompleteView instances
     */
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

    /*
     * Finds the autocomplete view for the given EditorView
     * and registers the given provider
     * @param  {Provider} provider
     * @param  {EditorView} editorView
     */
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

    /*
     * Finds the autocomplete view for the given EditorView
     * and unregisters the given provider
     * @param  {Provider} provider
     * @param  {EditorView} editorView
     */
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHlDQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQSxnQkFBQSxHQUFtQixPQUFBLENBQVEscUJBQVIsQ0FEbkIsQ0FBQTs7QUFBQSxFQUVBLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUixDQUZYLENBQUE7O0FBQUEsRUFHQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVIsQ0FIYixDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsY0FBQSxFQUNFO0FBQUEsTUFBQSxnQ0FBQSxFQUFrQyxLQUFsQztBQUFBLE1BQ0EsYUFBQSxFQUFlLFVBRGY7QUFBQSxNQUVBLG9CQUFBLEVBQXNCLElBRnRCO0FBQUEsTUFHQSxtQkFBQSxFQUFxQixHQUhyQjtLQURGO0FBQUEsSUFNQSxpQkFBQSxFQUFtQixFQU5uQjtBQUFBLElBT0Esa0JBQUEsRUFBb0IsSUFQcEI7QUFTQTtBQUFBOztPQVRBO0FBQUEsSUFZQSxRQUFBLEVBQVUsU0FBQSxHQUFBO0FBR1IsTUFBQSxJQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixVQUE5QixDQUFBLElBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGtCQUFoQixDQURDLElBRUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHdDQUFoQixDQUZGO0FBR0ksUUFBQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isd0NBQWhCLEVBQTBELEtBQTFELENBQUEsQ0FBQTtBQUFBLFFBRUEsS0FBQSxDQUFNLDBRQUFOLENBRkEsQ0FISjtPQUFBO2FBV0EsSUFBQyxDQUFBLGtCQUFELEdBQXNCLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBbkIsQ0FBa0MsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsTUFBRCxHQUFBO0FBQ3RELGNBQUEsZ0JBQUE7QUFBQSxVQUFBLElBQUcsTUFBTSxDQUFDLFFBQVAsSUFBb0IsQ0FBQSxNQUFVLENBQUMsSUFBbEM7QUFDRSxZQUFBLGdCQUFBLEdBQXVCLElBQUEsZ0JBQUEsQ0FBaUIsTUFBakIsQ0FBdkIsQ0FBQTtBQUFBLFlBQ0EsTUFBTSxDQUFDLEVBQVAsQ0FBVSx3QkFBVixFQUFvQyxTQUFBLEdBQUE7QUFDbEMsY0FBQSxJQUFBLENBQUEsZ0JBQWlELENBQUMsU0FBakIsQ0FBQSxDQUFqQztBQUFBLGdCQUFBLGdCQUFnQixDQUFDLE1BQWpCLENBQUEsQ0FBQSxDQUFBO2VBQUE7QUFBQSxjQUNBLGdCQUFnQixDQUFDLE9BQWpCLENBQUEsQ0FEQSxDQUFBO3FCQUVBLENBQUMsQ0FBQyxNQUFGLENBQVMsS0FBQyxDQUFBLGlCQUFWLEVBQTZCLGdCQUE3QixFQUhrQztZQUFBLENBQXBDLENBREEsQ0FBQTttQkFLQSxLQUFDLENBQUEsaUJBQWlCLENBQUMsSUFBbkIsQ0FBd0IsZ0JBQXhCLEVBTkY7V0FEc0Q7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsQyxFQWRkO0lBQUEsQ0FaVjtBQW1DQTtBQUFBOztPQW5DQTtBQUFBLElBc0NBLFVBQUEsRUFBWSxTQUFBLEdBQUE7QUFDVixVQUFBLElBQUE7O1lBQW1CLENBQUUsR0FBckIsQ0FBQTtPQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsa0JBQUQsR0FBc0IsSUFEdEIsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLGlCQUFpQixDQUFDLE9BQW5CLENBQTJCLFNBQUMsZ0JBQUQsR0FBQTtlQUFzQixnQkFBZ0IsQ0FBQyxNQUFqQixDQUFBLEVBQXRCO01BQUEsQ0FBM0IsQ0FGQSxDQUFBO2FBR0EsSUFBQyxDQUFBLGlCQUFELEdBQXFCLEdBSlg7SUFBQSxDQXRDWjtBQTRDQTtBQUFBOzs7OztPQTVDQTtBQUFBLElBa0RBLDZCQUFBLEVBQStCLFNBQUMsUUFBRCxFQUFXLFVBQVgsR0FBQTtBQUM3QixVQUFBLGdCQUFBO0FBQUEsTUFBQSxnQkFBQSxHQUFtQixDQUFDLENBQUMsU0FBRixDQUFZLElBQUMsQ0FBQSxpQkFBYixFQUFnQztBQUFBLFFBQUEsVUFBQSxFQUFZLFVBQVo7T0FBaEMsQ0FBbkIsQ0FBQTtBQUNBLE1BQUEsSUFBTyx3QkFBUDtBQUNFLGNBQVUsSUFBQSxLQUFBLENBQU0sNkJBQU4sRUFBcUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUExRCxDQUFWLENBREY7T0FEQTthQUlBLGdCQUFnQixDQUFDLGdCQUFqQixDQUFrQyxRQUFsQyxFQUw2QjtJQUFBLENBbEQvQjtBQXlEQTtBQUFBOzs7OztPQXpEQTtBQUFBLElBK0RBLGtCQUFBLEVBQW9CLFNBQUMsUUFBRCxHQUFBO0FBQ2xCLFVBQUEsOEJBQUE7QUFBQTtBQUFBO1dBQUEsMkNBQUE7d0JBQUE7QUFBQSxzQkFBQSxJQUFJLENBQUMsbUJBQUwsQ0FBQTtBQUFBO3NCQURrQjtJQUFBLENBL0RwQjtBQUFBLElBa0VBLFFBQUEsRUFBVSxRQWxFVjtBQUFBLElBbUVBLFVBQUEsRUFBWSxVQW5FWjtHQU5GLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/andytlr/.atom/packages/autocomplete-plus/lib/autocomplete.coffee