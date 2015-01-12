(function() {
  var AtomColorHighlight, AtomColorHighlightElement, AtomColorHighlightModel, Emitter, deprecate, _ref,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Emitter = require('event-kit').Emitter;

  deprecate = require('grim').deprecate;

  _ref = [], AtomColorHighlightModel = _ref[0], AtomColorHighlightElement = _ref[1];

  AtomColorHighlight = (function() {
    function AtomColorHighlight() {}

    AtomColorHighlight.prototype.config = {
      markersAtEndOfLine: {
        type: 'boolean',
        "default": false
      },
      hideMarkersInComments: {
        type: 'boolean',
        "default": false
      },
      hideMarkersInStrings: {
        type: 'boolean',
        "default": false
      },
      dotMarkersSize: {
        type: 'number',
        "default": 16,
        min: 2
      },
      dotMarkersSpacing: {
        type: 'number',
        "default": 4,
        min: 0
      },
      excludedGrammars: {
        type: 'array',
        "default": [],
        description: "Prevents files matching the specified grammars scopes from having their colors highligted. Changing this setting may need a restart to take effect. This setting takes a list of scope strings separated with commas. Scope for a grammar can be found in the corresponding package description in the settings view.",
        items: {
          type: 'string'
        }
      }
    };

    AtomColorHighlight.prototype.models = {};

    AtomColorHighlight.prototype.activate = function(state) {
      AtomColorHighlightModel || (AtomColorHighlightModel = require('./atom-color-highlight-model'));
      AtomColorHighlightElement || (AtomColorHighlightElement = require('./atom-color-highlight-element'));
      this.Color || (this.Color = require('pigments'));
      AtomColorHighlightElement.registerViewProvider(AtomColorHighlightModel);
      AtomColorHighlightModel.Color = this.Color;
      if (!atom.inSpecMode()) {
        try {
          atom.packages.activatePackage('project-palette-finder').then((function(_this) {
            return function(pack) {
              var finder;
              finder = pack.mainModule;
              if (finder != null) {
                AtomColorHighlightModel.Color = _this.Color = finder.Color;
              }
              return _this.subscriptions.add(finder.onDidUpdatePalette(_this.update));
            };
          })(this));
        } catch (_error) {}
      }
      this.emitter = new Emitter;
      return atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          var editorElement, editorRoot, model, view, _ref1, _ref2;
          if (_ref1 = editor.getGrammar().scopeName, __indexOf.call(atom.config.get('atom-color-highlight.excludedGrammars'), _ref1) >= 0) {
            return;
          }
          model = new AtomColorHighlightModel(editor);
          editorElement = atom.views.getView(editor);
          view = atom.views.getView(model);
          editorRoot = (_ref2 = editorElement.shadowRoot) != null ? _ref2 : editorElement;
          editorRoot.querySelector('.lines').appendChild(view);
          model.init();
          model.onDidDestroy(function() {
            return delete _this.models[editor.id];
          });
          _this.models[editor.id] = model;
          return _this.emitter.emit('did-create-model', model);
        };
      })(this));
    };

    AtomColorHighlight.prototype.eachColorHighlightEditor = function(callback) {
      deprecate('Use ::observeColorHighlightModels instead');
      return this.observeColorHighlightModels(callback);
    };

    AtomColorHighlight.prototype.observeColorHighlightModels = function(callback) {
      var editor, id, _ref1;
      if (callback != null) {
        _ref1 = this.models;
        for (id in _ref1) {
          editor = _ref1[id];
          if (typeof callback === "function") {
            callback(editor);
          }
        }
      }
      return this.onDidCreateModel(callback);
    };

    AtomColorHighlight.prototype.onDidCreateModel = function(callback) {
      return this.emitter.on('did-create-model', callback);
    };

    AtomColorHighlight.prototype.modelForEditor = function(editor) {
      return this.models[editor.id];
    };

    AtomColorHighlight.prototype.deactivate = function() {
      var id, model, _ref1;
      _ref1 = this.models;
      for (id in _ref1) {
        model = _ref1[id];
        model.destroy();
      }
      return this.models = {};
    };

    return AtomColorHighlight;

  })();

  module.exports = new AtomColorHighlight;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGdHQUFBO0lBQUEscUpBQUE7O0FBQUEsRUFBQyxVQUFXLE9BQUEsQ0FBUSxXQUFSLEVBQVgsT0FBRCxDQUFBOztBQUFBLEVBQ0MsWUFBYSxPQUFBLENBQVEsTUFBUixFQUFiLFNBREQsQ0FBQTs7QUFBQSxFQUVBLE9BQXVELEVBQXZELEVBQUMsaUNBQUQsRUFBMEIsbUNBRjFCLENBQUE7O0FBQUEsRUFJTTtvQ0FDSjs7QUFBQSxpQ0FBQSxNQUFBLEdBQ0U7QUFBQSxNQUFBLGtCQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsS0FEVDtPQURGO0FBQUEsTUFHQSxxQkFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLEtBRFQ7T0FKRjtBQUFBLE1BTUEsb0JBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxLQURUO09BUEY7QUFBQSxNQVNBLGNBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxFQURUO0FBQUEsUUFFQSxHQUFBLEVBQUssQ0FGTDtPQVZGO0FBQUEsTUFhQSxpQkFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sUUFBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLENBRFQ7QUFBQSxRQUVBLEdBQUEsRUFBSyxDQUZMO09BZEY7QUFBQSxNQWlCQSxnQkFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sT0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLEVBRFQ7QUFBQSxRQUVBLFdBQUEsRUFBYSx1VEFGYjtBQUFBLFFBR0EsS0FBQSxFQUNFO0FBQUEsVUFBQSxJQUFBLEVBQU0sUUFBTjtTQUpG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
//# sourceURL=/Users/andytlr/.atom/packages/atom-color-highlight/lib/atom-color-highlight.coffee