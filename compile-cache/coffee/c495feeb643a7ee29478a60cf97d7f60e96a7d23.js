(function() {
  var Color, CompositeDisposable, Emitter, EmitterMixin, Palette, PaletteItem, ProjectColorsResultView, ProjectColorsResultsView, ProjectPaletteFinder, ProjectPaletteView, deprecate, path, url, _, _ref, _ref1,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  path = require('path');

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
          return _this.editorSubscription = atom.workspaceView.eachEditorView(function(editorView) {
            var provider;
            provider = new PaletteProvider(editorView, _this);
            _this.autocomplete.registerProviderForEditorView(provider, editorView);
            return _this.providers.push(provider);
          });
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDBNQUFBO0lBQUEscUpBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FBUCxDQUFBOztBQUFBLEVBRUEsWUFBQSxHQUFlLE9BQUEsQ0FBUSxVQUFSLENBQW1CLENBQUMsT0FGbkMsQ0FBQTs7QUFBQSxFQUdBLE9BQWlDLE9BQUEsQ0FBUSxXQUFSLENBQWpDLEVBQUMsZUFBQSxPQUFELEVBQVUsMkJBQUEsbUJBSFYsQ0FBQTs7QUFBQSxFQUtBLFFBQTBILEVBQTFILEVBQUMsa0JBQUQsRUFBVSxzQkFBVixFQUF1Qiw2QkFBdkIsRUFBMkMsbUNBQTNDLEVBQXFFLGtDQUFyRSxFQUE4RixnQkFBOUYsRUFBcUcsb0JBQXJHLEVBQWdILGNBQWhILEVBQXFILFlBTHJILENBQUE7O0FBQUEsRUFPTTtBQUNKLElBQUEsWUFBWSxDQUFDLFdBQWIsQ0FBeUIsb0JBQXpCLENBQUEsQ0FBQTs7QUFBQSxJQUVBLG9CQUFDLENBQUEsUUFBRCxHQUFXLENBQ1Qsd0JBRFMsRUFFVCxzQkFGUyxFQUdULHFCQUhTLENBRlgsQ0FBQTs7QUFBQSxJQVFBLG9CQUFDLENBQUEsWUFBRCxHQUFlLENBQ2IsV0FEYSxFQUViLFdBRmEsRUFHYixXQUhhLEVBSWIsV0FKYSxFQUtiLFVBTGEsQ0FSZixDQUFBOztBQUFBLElBZ0JBLG9CQUFDLENBQUEsb0JBQUQsR0FDRTtBQUFBLE1BQUEsR0FBQSxFQUFLLE1BQUw7QUFBQSxNQUNBLElBQUEsRUFBTSxNQUROO0FBQUEsTUFFQSxJQUFBLEVBQU0sTUFGTjtBQUFBLE1BR0EsSUFBQSxFQUFNLE1BSE47QUFBQSxNQUlBLElBQUEsRUFBTSxRQUpOO0tBakJGLENBQUE7O0FBQUEsbUNBdUJBLFNBQUEsR0FBVyxFQXZCWCxDQUFBOztBQUFBLG1DQXdC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
//# sourceURL=/Users/andytlr/.atom/packages/project-palette-finder/lib/project-palette-finder.coffee