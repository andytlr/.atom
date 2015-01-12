(function() {
  var Color, CompositeDisposable, Emitter, EmitterMixin, Palette, PaletteItem, ProjectColorsResultView, ProjectColorsResultsView, ProjectPaletteFinder, ProjectPaletteView, deprecate, url, _, _ref, _ref1,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  EmitterMixin = require('emissary').Emitter;

  _ref = require('event-kit'), Emitter = _ref.Emitter, CompositeDisposable = _ref.CompositeDisposable;

  _ref1 = [], Palette = _ref1[0], PaletteItem = _ref1[1], ProjectPaletteView = _ref1[2], ProjectColorsResultsView = _ref1[3], ProjectColorsResultView = _ref1[4], Color = _ref1[5], deprecate = _ref1[6], url = _ref1[7], _ = _ref1[8];

  ProjectPaletteFinder = (function() {
    EmitterMixin.includeInto(ProjectPaletteFinder);

    ProjectPaletteFinder.patterns = ['\\$[a-zA-Z0-9-_]+\\s*:', '@[a-zA-Z0-9-_]+\\s*:', '[a-zA-Z0-9-_]+\\s*='];

    ProjectPaletteFinder.filePatterns = ['**/*.sass', '**/*.scss', '**/*.less', '**/*.styl', '**/*.css'];

    ProjectPaletteFinder.grammarForExtensions = {
      css: 'sass',
      sass: 'sass',
      scss: 'scss',
      less: 'less',
      styl: 'stylus'
    };

    ProjectPaletteFinder.prototype.providers = [];

    ProjectPaletteFinder.prototype.autocomplete = null;

    ProjectPaletteFinder.prototype.config = {
      autocompleteScopes: {
        type: 'array',
        "default": ['source.css', 'source.css.less', 'source.sass', 'source.css.scss', 'source.stylus'],
        description: 'The palette provider will only complete color names in editors whose scope is present in this list.',
        items: {
          type: 'string'
        }
      },
      saveWatchersScopes: {
        type: 'array',
        "default": ['source.css.less', 'source.sass', 'source.css.scss', 'source.stylus'],
        description: 'When a buffer matching one of this scope is saved the palette is reloaded',
        items: {
          type: 'string'
        }
      },
      paletteDisplay: {
        type: 'string',
        "default": 'list',
        "enum": ['list', 'grid']
      },
      paletteSort: {
        type: 'boolean',
        "default": false
      }
    };

    function ProjectPaletteFinder() {
      this.Color = Color = require('pigments');
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
    }

    ProjectPaletteFinder.prototype.activate = function(_arg) {
      var palette;
      palette = _arg.palette;
      atom.commands.add('atom-workspace', {
        'palette:refresh': (function(_this) {
          return function() {
            return _this.scanProject();
          };
        })(this),
        'palette:view': (function(_this) {
          return function() {
            return _this.displayView();
          };
        })(this),
        'palette:find-all-colors': (function(_this) {
          return function() {
            return _this.findAllColors();
          };
        })(this)
      });
      atom.workspace.addOpener(function(uriToOpen) {
        var host, protocol, _ref2;
        url || (url = require('url'));
        ProjectPaletteView || (ProjectPaletteView = require('./project-palette-view'));
        _ref2 = url.parse(uriToOpen), protocol = _ref2.protocol, host = _ref2.host;
        if (!(protocol === 'palette:' && host === 'view')) {
          return;
        }
        return new ProjectPaletteView;
      });
      atom.workspace.addOpener(function(uriToOpen) {
        var host, protocol, _ref2;
        url || (url = require('url'));
        ProjectColorsResultsView || (ProjectColorsResultsView = require('./project-colors-results-view'));
        _ref2 = url.parse(uriToOpen), protocol = _ref2.protocol, host = _ref2.host;
        if (!(protocol === 'palette:' && host === 'search')) {
          return;
        }
        return new ProjectColorsResultsView;
      });
      this.initializeWatchers();
      if (!atom.inSpecMode()) {
        try {
          atom.packages.activatePackage("autocomplete-plus").then((function(_this) {
            return function(pkg) {
              _this.autocomplete = pkg.mainModule;
              return _this.registerProviders();
            };
          })(this));
        } catch (_error) {}
      }
      return this.scanProject();
    };

    ProjectPaletteFinder.prototype.onDidUpdatePalette = function(callback) {
      return this.emitter.on('did-update-palette', callback);
    };

    ProjectPaletteFinder.prototype.onDidFindColors = function(callback) {
      return this.emitter.on('did-find-colors', callback);
    };

    ProjectPaletteFinder.prototype.on = function(event, callback) {
      if (deprecate == null) {
        deprecate = require('grim').deprecate;
      }
      switch (event) {
        case 'palette:ready':
          deprecate('Use ProjectPaletteFinder::onDidUpdatePalette instead');
          break;
        case 'palette:search-ready':
          deprecate('Use ProjectPaletteFinder::onDidFindColors instead');
      }
      return EmitterMixin.prototype.on.call(this, event, callback);
    };

    ProjectPaletteFinder.prototype.initializeWatchers = function() {
      this.subscriptions.add(atom.config.observe('project-palette-finder.saveWatchersScopes', (function(_this) {
        return function(saveWatchersScopes) {
          _this.saveWatchersScopes = saveWatchersScopes;
        };
      })(this)));
      return this.subscriptions.add(atom.workspace.observeTextEditors((function(_this) {
        return function(textEditor) {
          var subscriptions;
          subscriptions = new CompositeDisposable;
          subscriptions.add(textEditor.onDidDestroy(function() {
            return subscriptions.dispose();
          }));
          return subscriptions.add(textEditor.onDidSave(function() {
            var _ref2;
            if (_ref2 = textEditor.getGrammar().scopeName, __indexOf.call(_this.saveWatchersScopes, _ref2) < 0) {
              return;
            }
            return _this.scanProject();
          }));
        };
      })(this)));
    };

    ProjectPaletteFinder.prototype.registerProviders = function() {
      return requestAnimationFrame((function(_this) {
        return function() {
          var PaletteProvider;
          PaletteProvider = require('./palette-provider')(_this.autocomplete);
          if (_this.autocomplete.registerProviderForEditor != null) {
            return _this.editorSubscription = atom.workspace.observeTextEditors(function(editor) {
              var provider;
              provider = new PaletteProvider(editor, _this);
              _this.autocomplete.registerProviderForEditor(provider, editor);
              return _this.providers.push(provider);
            });
          } else {
            return _this.editorSubscription = atom.workspaceView.eachEditorView(function(editorView) {
              var provider;
              provider = new PaletteProvider(editorView, _this);
              _this.autocomplete.registerProviderForEditorView(provider, editorView);
              return _this.providers.push(provider);
            });
          }
        };
      })(this));
    };

    ProjectPaletteFinder.prototype.deactivate = function() {
      var _ref2;
      this.subscriptions.dispose();
      if ((_ref2 = this.editorSubscription) != null) {
        _ref2.off();
      }
      this.editorSubscription = null;
      this.providers.forEach((function(_this) {
        return function(provider) {
          return _this.autocomplete.unregisterProvider(provider);
        };
      })(this));
      return this.providers = [];
    };

    ProjectPaletteFinder.prototype.serialize = function() {
      return {};
    };

    ProjectPaletteFinder.prototype.displayView = function() {
      return this.scanProject().then(function(palette) {
        var pane, uri;
        uri = "palette://view";
        pane = atom.workspace.paneForUri(uri);
        pane || (pane = atom.workspace.getActivePane());
        return atom.workspace.openUriInPane(uri, pane, {}).done(function(view) {
          if (view instanceof ProjectPaletteView) {
            return view.setPalette(palette);
          }
        });
      }).fail(function(reason) {
        return console.log(reason);
      });
    };

    ProjectPaletteFinder.prototype.scanProject = function() {
      var filePatterns, promise, results;
      _ || (_ = require('underscore-plus'));
      Palette || (Palette = require('./palette'));
      PaletteItem || (PaletteItem = require('./palette-item')(Color));
      this.palette = new Palette;
      filePatterns = this.constructor.filePatterns;
      results = [];
      promise = atom.project.scan(this.getPatternsRegExp(), {
        paths: filePatterns
      }, function(m) {
        return results.push(m);
      });
      return promise.then((function(_this) {
        return function() {
          var ext, filePath, items, language, lineForMatch, lineText, matchText, matches, paletteRegexp, range, res, row, spaceBefore, spaceEnd, _i, _j, _len, _len1, _ref2, _ref3;
          for (_i = 0, _len = results.length; _i < _len; _i++) {
            _ref2 = results[_i], filePath = _ref2.filePath, matches = _ref2.matches;
            for (_j = 0, _len1 = matches.length; _j < _len1; _j++) {
              _ref3 = matches[_j], lineText = _ref3.lineText, matchText = _ref3.matchText, range = _ref3.range;
              lineForMatch = lineText.replace(/\/\/.+$/, '');
              res = Color.searchColorSync(lineForMatch, matchText.length);
              if (res != null) {
                spaceBefore = lineForMatch.slice(matchText.length, res.range[0]);
                spaceEnd = lineForMatch.slice(res.range[1]);
                if (!spaceBefore.match(/^\s*$/)) {
                  continue;
                }
                if (!spaceEnd.match(/^[\s;]*$/)) {
                  continue;
                }
                row = range[0][0];
                ext = filePath.split('.').slice(-1)[0];
                language = _this.constructor.grammarForExtensions[ext];
                _this.palette.addItem(new PaletteItem({
                  filePath: filePath,
                  row: row,
                  lineText: lineText,
                  language: language,
                  extension: ext,
                  name: matchText.replace(/[\s=:]/g, ''),
                  lineRange: res.range,
                  colorString: res.match
                }));
                items = _this.palette.items.map(function(item) {
                  return _.escapeRegExp(item.name);
                }).sort(function(a, b) {
                  return b.length - a.length;
                });
                paletteRegexp = '(' + items.join('|') + ')(?!\\w|\\d|-|[ \\t]*[\\.:=])\\b';
                Color.removeExpression('palette');
                Color.addExpression('palette', paletteRegexp, function(color, expr) {
                  return color.rgba = _this.palette.getItemByName(expr).color.rgba;
                });
              }
            }
          }
          _this.emit('palette:ready', _this.palette);
          _this.emitter.emit('did-update-palette', _this.palette);
          return _this.palette;
        };
      })(this)).fail(function(reason) {
        return console.log(reason);
      });
    };

    ProjectPaletteFinder.prototype.findAllColors = function() {
      var filePatterns, palette, pane, pendingResults, promise, re, results, uri, view;
      Palette || (Palette = require('./palette'));
      PaletteItem || (PaletteItem = require('./palette-item'));
      palette = new Palette;
      filePatterns = this.constructor.filePatterns.concat();
      results = [];
      pendingResults = [];
      re = new RegExp(Color.colorRegExp(), 'g');
      uri = "palette://search";
      pane = atom.workspace.paneForUri(uri);
      pane || (pane = atom.workspace.getActivePane());
      view = null;
      atom.workspace.openUriInPane(uri, pane, {}).done(function(v) {
        if (v instanceof ProjectColorsResultsView) {
          return view = v;
        }
      });
      promise = atom.project.scan(re, {
        paths: filePatterns
      }, (function(_this) {
        return function(m) {
          var r, result, _i, _j, _len, _len1, _ref2;
          _ref2 = m.matches;
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            result = _ref2[_i];
            result.color = new Color(result.matchText);
            result.range[0][1] += result.matchText.indexOf(result.color.colorExpression);
          }
          if (view != null) {
            if (pendingResults.length > 0) {
              pendingResults.push(m);
              for (_j = 0, _len1 = pendingResults.length; _j < _len1; _j++) {
                r = pendingResults[_j];
                _this.createSearchResultForFile(r, view);
              }
              pendingResults = [];
            } else {
              _this.createSearchResultForFile(m, view);
            }
          } else {
            pendingResults.push(m);
          }
          return results.push(m);
        };
      })(this));
      return promise.then((function(_this) {
        return function() {
          var ext, filePath, lineText, matchText, matches, range, _i, _j, _len, _len1, _ref2, _ref3;
          for (_i = 0, _len = results.length; _i < _len; _i++) {
            _ref2 = results[_i], filePath = _ref2.filePath, matches = _ref2.matches;
            for (_j = 0, _len1 = matches.length; _j < _len1; _j++) {
              _ref3 = matches[_j], lineText = _ref3.lineText, matchText = _ref3.matchText, range = _ref3.range;
              ext = filePath.split('.').slice(-1)[0];
              palette.addItem(new PaletteItem({
                filePath: filePath,
                row: range[0][0],
                lineText: lineText,
                language: _this.constructor.grammarForExtensions[ext],
                extension: ext,
                name: matchText,
                lineRange: range,
                colorString: matchText
              }));
            }
          }
          view.searchComplete();
          _this.emit('palette:search-ready', palette);
          _this.emitter.emit('did-find-colors', palette);
          return palette;
        };
      })(this));
    };

    ProjectPaletteFinder.prototype.createSearchResultForFile = function(m, parentView) {
      var filePath, matches;
      ProjectColorsResultView || (ProjectColorsResultView = require('./project-colors-result-view'));
      filePath = m.filePath, matches = m.matches;
      return parentView.appendResult(new ProjectColorsResultView(filePath, matches));
    };

    ProjectPaletteFinder.prototype.getPatternsRegExp = function() {
      return new RegExp('(' + this.constructor.patterns.join('|') + ')', 'gi');
    };

    return ProjectPaletteFinder;

  })();

  module.exports = new ProjectPaletteFinder;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG9NQUFBO0lBQUEscUpBQUE7O0FBQUEsRUFBQSxZQUFBLEdBQWUsT0FBQSxDQUFRLFVBQVIsQ0FBbUIsQ0FBQyxPQUFuQyxDQUFBOztBQUFBLEVBQ0EsT0FBaUMsT0FBQSxDQUFRLFdBQVIsQ0FBakMsRUFBQyxlQUFBLE9BQUQsRUFBVSwyQkFBQSxtQkFEVixDQUFBOztBQUFBLEVBR0EsUUFBMEgsRUFBMUgsRUFBQyxrQkFBRCxFQUFVLHNCQUFWLEVBQXVCLDZCQUF2QixFQUEyQyxtQ0FBM0MsRUFBcUUsa0NBQXJFLEVBQThGLGdCQUE5RixFQUFxRyxvQkFBckcsRUFBZ0gsY0FBaEgsRUFBcUgsWUFIckgsQ0FBQTs7QUFBQSxFQUtNO0FBQ0osSUFBQSxZQUFZLENBQUMsV0FBYixDQUF5QixvQkFBekIsQ0FBQSxDQUFBOztBQUFBLElBRUEsb0JBQUMsQ0FBQSxRQUFELEdBQVcsQ0FDVCx3QkFEUyxFQUVULHNCQUZTLEVBR1QscUJBSFMsQ0FGWCxDQUFBOztBQUFBLElBUUEsb0JBQUMsQ0FBQSxZQUFELEdBQWUsQ0FDYixXQURhLEVBRWIsV0FGYSxFQUdiLFdBSGEsRUFJYixXQUphLEVBS2IsVUFMYSxDQVJmLENBQUE7O0FBQUEsSUFnQkEsb0JBQUMsQ0FBQSxvQkFBRCxHQUNFO0FBQUEsTUFBQSxHQUFBLEVBQUssTUFBTDtBQUFBLE1BQ0EsSUFBQSxFQUFNLE1BRE47QUFBQSxNQUVBLElBQUEsRUFBTSxNQUZOO0FBQUEsTUFHQSxJQUFBLEVBQU0sTUFITjtBQUFBLE1BSUEsSUFBQSxFQUFNLFFBSk47S0FqQkYsQ0FBQTs7QUFBQSxtQ0F1QkEsU0FBQSxHQUFXLEVBdkJYLENBQUE7O0FBQUEsbUNBd0JBLFlBQUEsR0FBYyxJQXhCZCxDQUFBOztBQUFBLG1DQTBCQSxNQUFBLEdBQ0U7QUFBQSxNQUFBLGtCQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxPQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsQ0FDUCxZQURPLEVBRVAsaUJBRk8sRUFHUCxhQUhPLEVBSVAsaUJBSk8sRUFLUCxlQUxPLENBRFQ7QUFBQSxRQVFBLFdBQUEsRUFBYSxxR0FSYjtBQUFBLFFBU0EsS0FBQSxFQUNFO0FBQUEsVUFBQSxJQUFBLEVBQU0sUUFBTjtTQVZGO09BREY7QUFBQSxNQWFBLGtCQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxPQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsQ0FDUCxpQkFETyxFQUVQLGFBRk8sRUFHUCxpQkFITyxFQUlQLGVBSk8sQ0FEVDtBQUFBLFFBT0EsV0FBQSxFQUFhLDJFQVBiO0FBQUEsUUFRQSxLQUFBLEVBQ0U7QUFBQSxVQUFBLElBQUEsRUFBTSxRQUFOO1NBVEY7T0FkRjtBQUFBLE1BeUJBLGNBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxNQURUO0FBQUEsUUFFQSxNQUFBLEVBQU0sQ0FBQyxNQUFELEVBQVMsTUFBVCxDQUZOO09BMUJGO0FBQUEsTUE4QkEsV0FBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLEtBRFQ7T0EvQkY7S0EzQkYsQ0FBQTs7QUE2RGEsSUFBQSw4QkFBQSxHQUFBO0FBQ1gsTUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTLEtBQUEsR0FBUSxPQUFBLENBQVEsVUFBUixDQUFqQixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsT0FBRCxHQUFXLEdBQUEsQ0FBQSxPQURYLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxhQUFELEdBQWlCLEdBQUEsQ0FBQSxtQkFGakIsQ0FEVztJQUFBLENBN0RiOztBQUFBLG1DQWtFQSxRQUFBLEdBQVUsU0FBQyxJQUFELEdBQUE7QUFDUixVQUFBLE9BQUE7QUFBQSxNQURVLFVBQUQsS0FBQyxPQUNWLENBQUE7QUFBQSxNQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFBb0M7QUFBQSxRQUNsQyxpQkFBQSxFQUFtQixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFBRyxLQUFDLENBQUEsV0FBRCxDQUFBLEVBQUg7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQURlO0FBQUEsUUFFbEMsY0FBQSxFQUFnQixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFBRyxLQUFDLENBQUEsV0FBRCxDQUFBLEVBQUg7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUZrQjtBQUFBLFFBR2xDLHlCQUFBLEVBQTJCLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO21CQUFHLEtBQUMsQ0FBQSxhQUFELENBQUEsRUFBSDtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBSE87T0FBcEMsQ0FBQSxDQUFBO0FBQUEsTUFNQSxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQWYsQ0FBeUIsU0FBQyxTQUFELEdBQUE7QUFDdkIsWUFBQSxxQkFBQTtBQUFBLFFBQUEsUUFBQSxNQUFRLE9BQUEsQ0FBUSxLQUFSLEVBQVIsQ0FBQTtBQUFBLFFBQ0EsdUJBQUEscUJBQXVCLE9BQUEsQ0FBUSx3QkFBUixFQUR2QixDQUFBO0FBQUEsUUFHQSxRQUFtQixHQUFHLENBQUMsS0FBSixDQUFVLFNBQVYsQ0FBbkIsRUFBQyxpQkFBQSxRQUFELEVBQVcsYUFBQSxJQUhYLENBQUE7QUFJQSxRQUFBLElBQUEsQ0FBQSxDQUFjLFFBQUEsS0FBWSxVQUFaLElBQTJCLElBQUEsS0FBUSxNQUFqRCxDQUFBO0FBQUEsZ0JBQUEsQ0FBQTtTQUpBO2VBTUEsR0FBQSxDQUFBLG1CQVB1QjtNQUFBLENBQXpCLENBTkEsQ0FBQTtBQUFBLE1BZUEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFmLENBQXlCLFNBQUMsU0FBRCxHQUFBO0FBQ3ZCLFlBQUEscUJBQUE7QUFBQSxRQUFBLFFBQUEsTUFBUSxPQUFBLENBQVEsS0FBUixFQUFSLENBQUE7QUFBQSxRQUNBLDZCQUFBLDJCQUE2QixPQUFBLENBQVEsK0JBQVIsRUFEN0IsQ0FBQTtBQUFBLFFBR0EsUUFBbUIsR0FBRyxDQUFDLEtBQUosQ0FBVSxTQUFWLENBQW5CLEVBQUMsaUJBQUEsUUFBRCxFQUFXLGFBQUEsSUFIWCxDQUFBO0FBSUEsUUFBQSxJQUFBLENBQUEsQ0FBYyxRQUFBLEtBQVksVUFBWixJQUEyQixJQUFBLEtBQVEsUUFBakQsQ0FBQTtBQUFBLGdCQUFBLENBQUE7U0FKQTtlQU1BLEdBQUEsQ0FBQSx5QkFQdUI7TUFBQSxDQUF6QixDQWZBLENBQUE7QUFBQSxNQXdCQSxJQUFDLENBQUEsa0JBQUQsQ0FBQSxDQXhCQSxDQUFBO0FBMEJBLE1BQUEsSUFBQSxDQUFBLElBQVcsQ0FBQyxVQUFMLENBQUEsQ0FBUDtBQUNFO0FBQUksVUFBQSxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsbUJBQTlCLENBQWtELENBQUMsSUFBbkQsQ0FBd0QsQ0FBQSxTQUFBLEtBQUEsR0FBQTttQkFBQSxTQUFDLEdBQUQsR0FBQTtBQUMxRCxjQUFBLEtBQUMsQ0FBQSxZQUFELEdBQWdCLEdBQUcsQ0FBQyxVQUFwQixDQUFBO3FCQUNBLEtBQUMsQ0FBQSxpQkFBRCxDQUFBLEVBRjBEO1lBQUEsRUFBQTtVQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBeEQsQ0FBQSxDQUFKO1NBQUEsa0JBREY7T0ExQkE7YUErQkEsSUFBQyxDQUFBLFdBQUQsQ0FBQSxFQWhDUTtJQUFBLENBbEVWLENBQUE7O0FBQUEsbUNBb0dBLGtCQUFBLEdBQW9CLFNBQUMsUUFBRCxHQUFBO2FBQ2xCLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLG9CQUFaLEVBQWtDLFFBQWxDLEVBRGtCO0lBQUEsQ0FwR3BCLENBQUE7O0FBQUEsbUNBdUdBLGVBQUEsR0FBaUIsU0FBQyxRQUFELEdBQUE7YUFDZixJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxpQkFBWixFQUErQixRQUEvQixFQURlO0lBQUEsQ0F2R2pCLENBQUE7O0FBQUEsbUNBMEdBLEVBQUEsR0FBSSxTQUFDLEtBQUQsRUFBUSxRQUFSLEdBQUE7O1FBQ0YsWUFBYSxPQUFBLENBQVEsTUFBUixDQUFlLENBQUM7T0FBN0I7QUFDQSxjQUFPLEtBQVA7QUFBQSxhQUNPLGVBRFA7QUFFSSxVQUFBLFNBQUEsQ0FBVSxzREFBVixDQUFBLENBRko7QUFDTztBQURQLGFBR08sc0JBSFA7QUFJSSxVQUFBLFNBQUEsQ0FBVSxtREFBVixDQUFBLENBSko7QUFBQSxPQURBO2FBT0EsWUFBWSxDQUFBLFNBQUUsQ0FBQSxFQUFFLENBQUMsSUFBakIsQ0FBc0IsSUFBdEIsRUFBNEIsS0FBNUIsRUFBbUMsUUFBbkMsRUFSRTtJQUFBLENBMUdKLENBQUE7O0FBQUEsbUNBb0hBLGtCQUFBLEdBQW9CLFNBQUEsR0FBQTtBQUNsQixNQUFBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0IsMkNBQXBCLEVBQWlFLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFFLGtCQUFGLEdBQUE7QUFBdUIsVUFBdEIsS0FBQyxDQUFBLHFCQUFBLGtCQUFxQixDQUF2QjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpFLENBQW5CLENBQUEsQ0FBQTthQUVBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFmLENBQWtDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLFVBQUQsR0FBQTtBQUNuRCxjQUFBLGFBQUE7QUFBQSxVQUFBLGFBQUEsR0FBZ0IsR0FBQSxDQUFBLG1CQUFoQixDQUFBO0FBQUEsVUFDQSxhQUFhLENBQUMsR0FBZCxDQUFrQixVQUFVLENBQUMsWUFBWCxDQUF3QixTQUFBLEdBQUE7bUJBQUcsYUFBYSxDQUFDLE9BQWQsQ0FBQSxFQUFIO1VBQUEsQ0FBeEIsQ0FBbEIsQ0FEQSxDQUFBO2lCQUVBLGFBQWEsQ0FBQyxHQUFkLENBQWtCLFVBQVUsQ0FBQyxTQUFYLENBQXFCLFNBQUEsR0FBQTtBQUNyQyxnQkFBQSxLQUFBO0FBQUEsWUFBQSxZQUFjLFVBQVUsQ0FBQyxVQUFYLENBQUEsQ0FBdUIsQ0FBQyxTQUF4QixFQUFBLGVBQXFDLEtBQUMsQ0FBQSxrQkFBdEMsRUFBQSxLQUFBLEtBQWQ7QUFBQSxvQkFBQSxDQUFBO2FBQUE7bUJBQ0EsS0FBQyxDQUFBLFdBQUQsQ0FBQSxFQUZxQztVQUFBLENBQXJCLENBQWxCLEVBSG1EO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEMsQ0FBbkIsRUFIa0I7SUFBQSxDQXBIcEIsQ0FBQTs7QUFBQSxtQ0E4SEEsaUJBQUEsR0FBbUIsU0FBQSxHQUFBO2FBQ2pCLHFCQUFBLENBQXNCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDcEIsY0FBQSxlQUFBO0FBQUEsVUFBQSxlQUFBLEdBQWtCLE9BQUEsQ0FBUSxvQkFBUixDQUFBLENBQThCLEtBQUMsQ0FBQSxZQUEvQixDQUFsQixDQUFBO0FBRUEsVUFBQSxJQUFHLG9EQUFIO21CQUNFLEtBQUMsQ0FBQSxrQkFBRCxHQUFzQixJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFmLENBQWtDLFNBQUMsTUFBRCxHQUFBO0FBQ3RELGtCQUFBLFFBQUE7QUFBQSxjQUFBLFFBQUEsR0FBZSxJQUFBLGVBQUEsQ0FBZ0IsTUFBaEIsRUFBd0IsS0FBeEIsQ0FBZixDQUFBO0FBQUEsY0FDQSxLQUFDLENBQUEsWUFBWSxDQUFDLHlCQUFkLENBQXdDLFFBQXhDLEVBQWtELE1BQWxELENBREEsQ0FBQTtxQkFHQSxLQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBZ0IsUUFBaEIsRUFKc0Q7WUFBQSxDQUFsQyxFQUR4QjtXQUFBLE1BQUE7bUJBUUUsS0FBQyxDQUFBLGtCQUFELEdBQXNCLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBbkIsQ0FBa0MsU0FBQyxVQUFELEdBQUE7QUFDdEQsa0JBQUEsUUFBQTtBQUFBLGNBQUEsUUFBQSxHQUFlLElBQUEsZUFBQSxDQUFnQixVQUFoQixFQUE0QixLQUE1QixDQUFmLENBQUE7QUFBQSxjQUNBLEtBQUMsQ0FBQSxZQUFZLENBQUMsNkJBQWQsQ0FBNEMsUUFBNUMsRUFBc0QsVUFBdEQsQ0FEQSxDQUFBO3FCQUdBLEtBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFnQixRQUFoQixFQUpzRDtZQUFBLENBQWxDLEVBUnhCO1dBSG9CO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEIsRUFEaUI7SUFBQSxDQTlIbkIsQ0FBQTs7QUFBQSxtQ0FnSkEsVUFBQSxHQUFZLFNBQUEsR0FBQTtBQUNWLFVBQUEsS0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUEsQ0FBQSxDQUFBOzthQUNtQixDQUFFLEdBQXJCLENBQUE7T0FEQTtBQUFBLE1BRUEsSUFBQyxDQUFBLGtCQUFELEdBQXNCLElBRnRCLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxTQUFTLENBQUMsT0FBWCxDQUFtQixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxRQUFELEdBQUE7aUJBQWMsS0FBQyxDQUFBLFlBQVksQ0FBQyxrQkFBZCxDQUFpQyxRQUFqQyxFQUFkO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkIsQ0FKQSxDQUFBO2FBTUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxHQVBIO0lBQUEsQ0FoSlosQ0FBQTs7QUFBQSxtQ0F5SkEsU0FBQSxHQUFXLFNBQUEsR0FBQTthQUNULEdBRFM7SUFBQSxDQXpKWCxDQUFBOztBQUFBLG1DQThKQSxXQUFBLEdBQWEsU0FBQSxHQUFBO2FBQ1gsSUFBQyxDQUFBLFdBQUQsQ0FBQSxDQUFjLENBQUMsSUFBZixDQUFvQixTQUFDLE9BQUQsR0FBQTtBQUNsQixZQUFBLFNBQUE7QUFBQSxRQUFBLEdBQUEsR0FBTSxnQkFBTixDQUFBO0FBQUEsUUFFQSxJQUFBLEdBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFmLENBQTBCLEdBQTFCLENBRlAsQ0FBQTtBQUFBLFFBR0EsU0FBQSxPQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUFBLEVBSFQsQ0FBQTtlQUtBLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUE2QixHQUE3QixFQUFrQyxJQUFsQyxFQUF3QyxFQUF4QyxDQUEyQyxDQUFDLElBQTVDLENBQWlELFNBQUMsSUFBRCxHQUFBO0FBQy9DLFVBQUEsSUFBRyxJQUFBLFlBQWdCLGtCQUFuQjttQkFDRSxJQUFJLENBQUMsVUFBTCxDQUFnQixPQUFoQixFQURGO1dBRCtDO1FBQUEsQ0FBakQsRUFOa0I7TUFBQSxDQUFwQixDQVNBLENBQUMsSUFURCxDQVNNLFNBQUMsTUFBRCxHQUFBO2VBQ0osT0FBTyxDQUFDLEdBQVIsQ0FBWSxNQUFaLEVBREk7TUFBQSxDQVROLEVBRFc7SUFBQSxDQTlKYixDQUFBOztBQUFBLG1DQTJLQSxXQUFBLEdBQWEsU0FBQSxHQUFBO0FBQ1gsVUFBQSw4QkFBQTtBQUFBLE1BQUEsTUFBQSxJQUFNLE9BQUEsQ0FBUSxpQkFBUixFQUFOLENBQUE7QUFBQSxNQUNBLFlBQUEsVUFBWSxPQUFBLENBQVEsV0FBUixFQURaLENBQUE7QUFBQSxNQUVBLGdCQUFBLGNBQWdCLE9BQUEsQ0FBUSxnQkFBUixDQUFBLENBQTBCLEtBQTFCLEVBRmhCLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxPQUFELEdBQVcsR0FBQSxDQUFBLE9BSlgsQ0FBQTtBQUFBLE1BTUEsWUFBQSxHQUFlLElBQUMsQ0FBQSxXQUFXLENBQUMsWUFONUIsQ0FBQTtBQUFBLE1BT0EsT0FBQSxHQUFVLEVBUFYsQ0FBQTtBQUFBLE1BU0EsT0FBQSxHQUFVLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBYixDQUFrQixJQUFDLENBQUEsaUJBQUQsQ0FBQSxDQUFsQixFQUF3QztBQUFBLFFBQUEsS0FBQSxFQUFPLFlBQVA7T0FBeEMsRUFBNkQsU0FBQyxDQUFELEdBQUE7ZUFDckUsT0FBTyxDQUFDLElBQVIsQ0FBYSxDQUFiLEVBRHFFO01BQUEsQ0FBN0QsQ0FUVixDQUFBO2FBWUEsT0FBTyxDQUFDLElBQVIsQ0FBYSxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQ1gsY0FBQSxvS0FBQTtBQUFBLGVBQUEsOENBQUEsR0FBQTtBQUNFLGlDQURHLGlCQUFBLFVBQVUsZ0JBQUEsT0FDYixDQUFBO0FBQUEsaUJBQUEsZ0RBQUEsR0FBQTtBQUNFLG1DQURHLGlCQUFBLFVBQVUsa0JBQUEsV0FBVyxjQUFBLEtBQ3hCLENBQUE7QUFBQSxjQUFBLFlBQUEsR0FBZSxRQUFRLENBQUMsT0FBVCxDQUFpQixTQUFqQixFQUE0QixFQUE1QixDQUFmLENBQUE7QUFBQSxjQUNBLEdBQUEsR0FBTSxLQUFLLENBQUMsZUFBTixDQUFzQixZQUF0QixFQUFvQyxTQUFTLENBQUMsTUFBOUMsQ0FETixDQUFBO0FBRUEsY0FBQSxJQUFHLFdBQUg7QUFDRSxnQkFBQSxXQUFBLEdBQWMsWUFBYSxzQ0FBM0IsQ0FBQTtBQUFBLGdCQUNBLFFBQUEsR0FBVyxZQUFhLG9CQUR4QixDQUFBO0FBRUEsZ0JBQUEsSUFBQSxDQUFBLFdBQTJCLENBQUMsS0FBWixDQUFrQixPQUFsQixDQUFoQjtBQUFBLDJCQUFBO2lCQUZBO0FBR0EsZ0JBQUEsSUFBQSxDQUFBLFFBQXdCLENBQUMsS0FBVCxDQUFlLFVBQWYsQ0FBaEI7QUFBQSwyQkFBQTtpQkFIQTtBQUFBLGdCQUtBLEdBQUEsR0FBTSxLQUFNLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUxmLENBQUE7QUFBQSxnQkFNQSxHQUFBLEdBQU0sUUFBUSxDQUFDLEtBQVQsQ0FBZSxHQUFmLENBQW9CLFVBQU0sQ0FBQSxDQUFBLENBTmhDLENBQUE7QUFBQSxnQkFPQSxRQUFBLEdBQVcsS0FBQyxDQUFBLFdBQVcsQ0FBQyxvQkFBcUIsQ0FBQSxHQUFBLENBUDdDLENBQUE7QUFBQSxnQkFRQSxLQUFDLENBQUEsT0FBTyxDQUFDLE9BQVQsQ0FBcUIsSUFBQSxXQUFBLENBQVk7QUFBQSxrQkFDL0IsVUFBQSxRQUQrQjtBQUFBLGtCQUUvQixLQUFBLEdBRitCO0FBQUEsa0JBRy9CLFVBQUEsUUFIK0I7QUFBQSxrQkFJL0IsVUFBQSxRQUorQjtBQUFBLGtCQUsvQixTQUFBLEVBQVcsR0FMb0I7QUFBQSxrQkFNL0IsSUFBQSxFQUFNLFNBQVMsQ0FBQyxPQUFWLENBQWtCLFNBQWxCLEVBQTZCLEVBQTdCLENBTnlCO0FBQUEsa0JBTy9CLFNBQUEsRUFBVyxHQUFHLENBQUMsS0FQZ0I7QUFBQSxrQkFRL0IsV0FBQSxFQUFhLEdBQUcsQ0FBQyxLQVJjO2lCQUFaLENBQXJCLENBUkEsQ0FBQTtBQUFBLGdCQW1CQSxLQUFBLEdBQVEsS0FBQyxDQUFBLE9BQU8sQ0FBQyxLQUNqQixDQUFDLEdBRE8sQ0FDSCxTQUFDLElBQUQsR0FBQTt5QkFDSCxDQUFDLENBQUMsWUFBRixDQUFlLElBQUksQ0FBQyxJQUFwQixFQURHO2dCQUFBLENBREcsQ0FHUixDQUFDLElBSE8sQ0FHRixTQUFDLENBQUQsRUFBRyxDQUFILEdBQUE7eUJBQ0osQ0FBQyxDQUFDLE1BQUYsR0FBVyxDQUFDLENBQUMsT0FEVDtnQkFBQSxDQUhFLENBbkJSLENBQUE7QUFBQSxnQkF5QkEsYUFBQSxHQUFnQixHQUFBLEdBQU0sS0FBSyxDQUFDLElBQU4sQ0FBVyxHQUFYLENBQU4sR0FBd0Isa0NBekJ4QyxDQUFBO0FBQUEsZ0JBMEJBLEtBQUssQ0FBQyxnQkFBTixDQUF1QixTQUF2QixDQTFCQSxDQUFBO0FBQUEsZ0JBNEJBLEtBQUssQ0FBQyxhQUFOLENBQW9CLFNBQXBCLEVBQStCLGFBQS9CLEVBQThDLFNBQUMsS0FBRCxFQUFRLElBQVIsR0FBQTt5QkFDNUMsS0FBSyxDQUFDLElBQU4sR0FBYSxLQUFDLENBQUEsT0FBTyxDQUFDLGFBQVQsQ0FBdUIsSUFBdkIsQ0FBNEIsQ0FBQyxLQUFLLENBQUMsS0FESjtnQkFBQSxDQUE5QyxDQTVCQSxDQURGO2VBSEY7QUFBQSxhQURGO0FBQUEsV0FBQTtBQUFBLFVBb0NBLEtBQUMsQ0FBQSxJQUFELENBQU0sZUFBTixFQUF1QixLQUFDLENBQUEsT0FBeEIsQ0FwQ0EsQ0FBQTtBQUFBLFVBcUNBLEtBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLG9CQUFkLEVBQW9DLEtBQUMsQ0FBQSxPQUFyQyxDQXJDQSxDQUFBO2lCQXNDQSxLQUFDLENBQUEsUUF2Q1U7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFiLENBeUNBLENBQUMsSUF6Q0QsQ0F5Q00sU0FBQyxNQUFELEdBQUE7ZUFDSixPQUFPLENBQUMsR0FBUixDQUFZLE1BQVosRUFESTtNQUFBLENBekNOLEVBYlc7SUFBQSxDQTNLYixDQUFBOztBQUFBLG1DQW9PQSxhQUFBLEdBQWUsU0FBQSxHQUFBO0FBQ2IsVUFBQSw0RUFBQTtBQUFBLE1BQUEsWUFBQSxVQUFZLE9BQUEsQ0FBUSxXQUFSLEVBQVosQ0FBQTtBQUFBLE1BQ0EsZ0JBQUEsY0FBZ0IsT0FBQSxDQUFRLGdCQUFSLEVBRGhCLENBQUE7QUFBQSxNQUdBLE9BQUEsR0FBVSxHQUFBLENBQUEsT0FIVixDQUFBO0FBQUEsTUFLQSxZQUFBLEdBQWUsSUFBQyxDQUFBLFdBQVcsQ0FBQyxZQUFZLENBQUMsTUFBMUIsQ0FBQSxDQUxmLENBQUE7QUFBQSxNQU9BLE9BQUEsR0FBVSxFQVBWLENBQUE7QUFBQSxNQVFBLGNBQUEsR0FBaUIsRUFSakIsQ0FBQTtBQUFBLE1BVUEsRUFBQSxHQUFTLElBQUEsTUFBQSxDQUFPLEtBQUssQ0FBQyxXQUFOLENBQUEsQ0FBUCxFQUE0QixHQUE1QixDQVZULENBQUE7QUFBQSxNQVlBLEdBQUEsR0FBTSxrQkFaTixDQUFBO0FBQUEsTUFjQSxJQUFBLEdBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFmLENBQTBCLEdBQTFCLENBZFAsQ0FBQTtBQUFBLE1BZUEsU0FBQSxPQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUFBLEVBZlQsQ0FBQTtBQUFBLE1BaUJBLElBQUEsR0FBTyxJQWpCUCxDQUFBO0FBQUEsTUFtQkEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQTZCLEdBQTdCLEVBQWtDLElBQWxDLEVBQXdDLEVBQXhDLENBQTJDLENBQUMsSUFBNUMsQ0FBaUQsU0FBQyxDQUFELEdBQUE7QUFDL0MsUUFBQSxJQUFZLENBQUEsWUFBYSx3QkFBekI7aUJBQUEsSUFBQSxHQUFPLEVBQVA7U0FEK0M7TUFBQSxDQUFqRCxDQW5CQSxDQUFBO0FBQUEsTUFzQkEsT0FBQSxHQUFVLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBYixDQUFrQixFQUFsQixFQUFzQjtBQUFBLFFBQUEsS0FBQSxFQUFPLFlBQVA7T0FBdEIsRUFBMkMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsQ0FBRCxHQUFBO0FBQ25ELGNBQUEscUNBQUE7QUFBQTtBQUFBLGVBQUEsNENBQUE7K0JBQUE7QUFDRSxZQUFBLE1BQU0sQ0FBQyxLQUFQLEdBQW1CLElBQUEsS0FBQSxDQUFNLE1BQU0sQ0FBQyxTQUFiLENBQW5CLENBQUE7QUFBQSxZQUNBLE1BQU0sQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFoQixJQUFzQixNQUFNLENBQUMsU0FBUyxDQUFDLE9BQWpCLENBQXlCLE1BQU0sQ0FBQyxLQUFLLENBQUMsZUFBdEMsQ0FEdEIsQ0FERjtBQUFBLFdBQUE7QUFJQSxVQUFBLElBQUcsWUFBSDtBQUNFLFlBQUEsSUFBRyxjQUFjLENBQUMsTUFBZixHQUF3QixDQUEzQjtBQUNFLGNBQUEsY0FBYyxDQUFDLElBQWYsQ0FBb0IsQ0FBcEIsQ0FBQSxDQUFBO0FBQ0EsbUJBQUEsdURBQUE7dUNBQUE7QUFBQSxnQkFBQSxLQUFDLENBQUEseUJBQUQsQ0FBMkIsQ0FBM0IsRUFBNkIsSUFBN0IsQ0FBQSxDQUFBO0FBQUEsZUFEQTtBQUFBLGNBRUEsY0FBQSxHQUFpQixFQUZqQixDQURGO2FBQUEsTUFBQTtBQUtFLGNBQUEsS0FBQyxDQUFBLHlCQUFELENBQTJCLENBQTNCLEVBQTZCLElBQTdCLENBQUEsQ0FMRjthQURGO1dBQUEsTUFBQTtBQVNFLFlBQUEsY0FBYyxDQUFDLElBQWYsQ0FBb0IsQ0FBcEIsQ0FBQSxDQVRGO1dBSkE7aUJBZUEsT0FBTyxDQUFDLElBQVIsQ0FBYSxDQUFiLEVBaEJtRDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTNDLENBdEJWLENBQUE7YUF3Q0EsT0FBTyxDQUFDLElBQVIsQ0FBYSxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQ1gsY0FBQSxxRkFBQTtBQUFBLGVBQUEsOENBQUEsR0FBQTtBQUNFLGlDQURHLGlCQUFBLFVBQVUsZ0JBQUEsT0FDYixDQUFBO0FBQUEsaUJBQUEsZ0RBQUEsR0FBQTtBQUNFLG1DQURHLGlCQUFBLFVBQVUsa0JBQUEsV0FBVyxjQUFBLEtBQ3hCLENBQUE7QUFBQSxjQUFBLEdBQUEsR0FBTSxRQUFRLENBQUMsS0FBVCxDQUFlLEdBQWYsQ0FBb0IsVUFBTSxDQUFBLENBQUEsQ0FBaEMsQ0FBQTtBQUFBLGNBQ0EsT0FBTyxDQUFDLE9BQVIsQ0FBb0IsSUFBQSxXQUFBLENBQVk7QUFBQSxnQkFDOUIsVUFBQSxRQUQ4QjtBQUFBLGdCQUU5QixHQUFBLEVBQUssS0FBTSxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FGZ0I7QUFBQSxnQkFHOUIsVUFBQSxRQUg4QjtBQUFBLGdCQUk5QixRQUFBLEVBQVUsS0FBQyxDQUFBLFdBQVcsQ0FBQyxvQkFBcUIsQ0FBQSxHQUFBLENBSmQ7QUFBQSxnQkFLOUIsU0FBQSxFQUFXLEdBTG1CO0FBQUEsZ0JBTTlCLElBQUEsRUFBTSxTQU53QjtBQUFBLGdCQU85QixTQUFBLEVBQVcsS0FQbUI7QUFBQSxnQkFROUIsV0FBQSxFQUFhLFNBUmlCO2VBQVosQ0FBcEIsQ0FEQSxDQURGO0FBQUEsYUFERjtBQUFBLFdBQUE7QUFBQSxVQWNBLElBQUksQ0FBQyxjQUFMLENBQUEsQ0FkQSxDQUFBO0FBQUEsVUFlQSxLQUFDLENBQUEsSUFBRCxDQUFNLHNCQUFOLEVBQThCLE9BQTlCLENBZkEsQ0FBQTtBQUFBLFVBZ0JBLEtBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLGlCQUFkLEVBQWlDLE9BQWpDLENBaEJBLENBQUE7aUJBaUJBLFFBbEJXO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBYixFQXpDYTtJQUFBLENBcE9mLENBQUE7O0FBQUEsbUNBaVNBLHlCQUFBLEdBQTJCLFNBQUMsQ0FBRCxFQUFJLFVBQUosR0FBQTtBQUN6QixVQUFBLGlCQUFBO0FBQUEsTUFBQSw0QkFBQSwwQkFBNEIsT0FBQSxDQUFRLDhCQUFSLEVBQTVCLENBQUE7QUFBQSxNQUVDLGFBQUEsUUFBRCxFQUFXLFlBQUEsT0FGWCxDQUFBO2FBSUEsVUFBVSxDQUFDLFlBQVgsQ0FBNEIsSUFBQSx1QkFBQSxDQUF3QixRQUF4QixFQUFrQyxPQUFsQyxDQUE1QixFQUx5QjtJQUFBLENBalMzQixDQUFBOztBQUFBLG1DQXdTQSxpQkFBQSxHQUFtQixTQUFBLEdBQUE7YUFDYixJQUFBLE1BQUEsQ0FBTyxHQUFBLEdBQU0sSUFBQyxDQUFBLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBdEIsQ0FBMkIsR0FBM0IsQ0FBTixHQUF3QyxHQUEvQyxFQUFvRCxJQUFwRCxFQURhO0lBQUEsQ0F4U25CLENBQUE7O2dDQUFBOztNQU5GLENBQUE7O0FBQUEsRUFpVEEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsR0FBQSxDQUFBLG9CQWpUakIsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/andytlr/.atom/packages/project-palette-finder/lib/project-palette-finder.coffee