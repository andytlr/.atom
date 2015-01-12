(function() {
  var Color, Emitter, Palette, PaletteItem, ProjectColorsResultView, ProjectColorsResultsView, ProjectPaletteFinder, ProjectPaletteView, fs, path, querystring, url, _, _ref;

  _ = require('underscore-plus');

  fs = require('fs');

  url = require('url');

  path = require('path');

  Color = require('pigments');

  querystring = require('querystring');

  Emitter = require('emissary').Emitter;

  _ref = [], Palette = _ref[0], PaletteItem = _ref[1], ProjectPaletteView = _ref[2], ProjectColorsResultsView = _ref[3], ProjectColorsResultView = _ref[4];

  ProjectPaletteFinder = (function() {
    ProjectPaletteFinder.Color = Color;

    Emitter.includeInto(ProjectPaletteFinder);

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
      }
    };

    function ProjectPaletteFinder() {
      this.Color = Color;
    }

    ProjectPaletteFinder.prototype.activate = function(_arg) {
      var palette, pkg;
      palette = _arg.palette;
      this.scanProject();
      atom.workspaceView.command('palette:refresh', (function(_this) {
        return function() {
          return _this.scanProject();
        };
      })(this));
      atom.workspaceView.command('palette:view', (function(_this) {
        return function() {
          return _this.displayView();
        };
      })(this));
      atom.workspaceView.command('palette:find-all-colors', (function(_this) {
        return function() {
          return _this.findAllColors();
        };
      })(this));
      atom.workspace.addOpener(function(uriToOpen) {
        var host, protocol, _ref1;
        ProjectPaletteView || (ProjectPaletteView = require('./project-palette-view'));
        _ref1 = url.parse(uriToOpen), protocol = _ref1.protocol, host = _ref1.host;
        if (!(protocol === 'palette:' && host === 'view')) {
          return;
        }
        return new ProjectPaletteView;
      });
      atom.workspace.addOpener(function(uriToOpen) {
        var host, protocol, _ref1;
        ProjectColorsResultsView || (ProjectColorsResultsView = require('./project-colors-results-view'));
        _ref1 = url.parse(uriToOpen), protocol = _ref1.protocol, host = _ref1.host;
        if (!(protocol === 'palette:' && host === 'search')) {
          return;
        }
        return new ProjectColorsResultsView;
      });
      pkg = atom.packages.getLoadedPackage("autocomplete-plus");
      if (pkg != null) {
        this.autocomplete = pkg.mainModule;
        return this.registerProviders();
      }
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
      var _ref1;
      if ((_ref1 = this.editorSubscription) != null) {
        _ref1.off();
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
        pane = atom.workspace.paneContainer.paneForUri(uri);
        pane || (pane = atom.workspaceView.getActivePaneView().model);
        return atom.workspace.openUriInPane(uri, pane, {}).done(function(view) {
          if (view instanceof ProjectPaletteView) {
            return view.setPalette(palette);
          }
        });
      });
    };

    ProjectPaletteFinder.prototype.scanProject = function() {
      var filePatterns, promise, results;
      Palette || (Palette = require('./palette'));
      PaletteItem || (PaletteItem = require('./palette-item'));
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
          var ext, filePath, items, language, lineForMatch, lineText, matchText, matches, paletteRegexp, range, res, row, spaceBefore, spaceEnd, _i, _j, _len, _len1, _ref1, _ref2;
          for (_i = 0, _len = results.length; _i < _len; _i++) {
            _ref1 = results[_i], filePath = _ref1.filePath, matches = _ref1.matches;
            for (_j = 0, _len1 = matches.length; _j < _len1; _j++) {
              _ref2 = matches[_j], lineText = _ref2.lineText, matchText = _ref2.matchText, range = _ref2.range;
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
                paletteRegexp = '(' + items.join('|') + ')(?!-|[ \\t]*[\\.:=])\\b';
                Color.removeExpression('palette');
                Color.addExpression('palette', paletteRegexp, function(color, expr) {
                  return color.rgba = _this.palette.getItemByName(expr).color.rgba;
                });
              }
            }
          }
          _this.emit('palette:ready', _this.palette);
          return _this.palette;
        };
      })(this));
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
      pane = atom.workspace.paneContainer.paneForUri(uri);
      pane || (pane = atom.workspaceView.getActivePaneView().model);
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
          var r, result, _i, _j, _len, _len1, _ref1;
          _ref1 = m.matches;
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            result = _ref1[_i];
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
          var ext, filePath, lineText, matchText, matches, range, _i, _j, _len, _len1, _ref1, _ref2;
          for (_i = 0, _len = results.length; _i < _len; _i++) {
            _ref1 = results[_i], filePath = _ref1.filePath, matches = _ref1.matches;
            for (_j = 0, _len1 = matches.length; _j < _len1; _j++) {
              _ref2 = matches[_j], lineText = _ref2.lineText, matchText = _ref2.matchText, range = _ref2.range;
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHNLQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FETCxDQUFBOztBQUFBLEVBRUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxLQUFSLENBRk4sQ0FBQTs7QUFBQSxFQUdBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUhQLENBQUE7O0FBQUEsRUFJQSxLQUFBLEdBQVEsT0FBQSxDQUFRLFVBQVIsQ0FKUixDQUFBOztBQUFBLEVBS0EsV0FBQSxHQUFjLE9BQUEsQ0FBUSxhQUFSLENBTGQsQ0FBQTs7QUFBQSxFQU1DLFVBQVcsT0FBQSxDQUFRLFVBQVIsRUFBWCxPQU5ELENBQUE7O0FBQUEsRUFRQSxPQUFnRyxFQUFoRyxFQUFDLGlCQUFELEVBQVUscUJBQVYsRUFBdUIsNEJBQXZCLEVBQTJDLGtDQUEzQyxFQUFxRSxpQ0FSckUsQ0FBQTs7QUFBQSxFQVVNO0FBQ0osSUFBQSxvQkFBQyxDQUFBLEtBQUQsR0FBUSxLQUFSLENBQUE7O0FBQUEsSUFDQSxPQUFPLENBQUMsV0FBUixDQUFvQixvQkFBcEIsQ0FEQSxDQUFBOztBQUFBLElBR0Esb0JBQUMsQ0FBQSxRQUFELEdBQVcsQ0FDVCx3QkFEUyxFQUVULHNCQUZTLEVBR1QscUJBSFMsQ0FIWCxDQUFBOztBQUFBLElBU0Esb0JBQUMsQ0FBQSxZQUFELEdBQWUsQ0FDYixXQURhLEVBRWIsV0FGYSxFQUdiLFdBSGEsRUFJYixXQUphLEVBS2IsVUFMYSxDQVRmLENBQUE7O0FBQUEsSUFpQkEsb0JBQUMsQ0FBQSxvQkFBRCxHQUNFO0FBQUEsTUFBQSxHQUFBLEVBQUssTUFBTDtBQUFBLE1BQ0EsSUFBQSxFQUFNLE1BRE47QUFBQSxN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
//# sourceURL=/Users/andytlr/.atom/packages/project-palette-finder/lib/project-palette-finder.coffee