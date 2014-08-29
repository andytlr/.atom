(function() {
  var Color, Emitter, Palette, PaletteItem, ProjectPaletteFinder, ProjectPaletteView, fs, path, querystring, url, _;

  _ = require('underscore-plus');

  fs = require('fs');

  url = require('url');

  path = require('path');

  Color = require('pigments');

  querystring = require('querystring');

  Emitter = require('emissary').Emitter;

  Palette = require('./palette');

  PaletteItem = require('./palette-item');

  ProjectPaletteView = require('./project-palette-view');

  ProjectPaletteFinder = (function() {
    ProjectPaletteFinder.Color = Color;

    Emitter.includeInto(ProjectPaletteFinder);

    ProjectPaletteFinder.patterns = ['\\$[a-zA-Z0-9-_]+\\s*:', '@[a-zA-Z0-9-_]+\\s*:', '[a-zA-Z0-9-_]+\\s*='];

    ProjectPaletteFinder.filePatterns = ['**/*.sass', '**/*.scss', '**/*.less', '**/*.styl'];

    ProjectPaletteFinder.grammarForExtensions = {
      sass: 'sass',
      scss: 'scss',
      less: 'less',
      styl: 'stylus'
    };

    function ProjectPaletteFinder() {
      this.Color = Color;
    }

    ProjectPaletteFinder.prototype.activate = function(_arg) {
      var palette;
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
      return atom.workspace.registerOpener(function(uriToOpen) {
        var host, pathname, protocol, _ref;
        _ref = url.parse(uriToOpen), protocol = _ref.protocol, host = _ref.host, pathname = _ref.pathname;
        if (pathname) {
          pathname = querystring.unescape(pathname);
        }
        if (protocol !== 'palette:') {
          return;
        }
        return new ProjectPaletteView;
      });
    };

    ProjectPaletteFinder.prototype.deactivate = function() {};

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
          var ext, filePath, items, language, lineForMatch, lineText, matchText, matches, paletteRegexp, range, res, row, spaceBefore, spaceEnd, _i, _j, _len, _len1, _ref, _ref1;
          for (_i = 0, _len = results.length; _i < _len; _i++) {
            _ref = results[_i], filePath = _ref.filePath, matches = _ref.matches;
            for (_j = 0, _len1 = matches.length; _j < _len1; _j++) {
              _ref1 = matches[_j], lineText = _ref1.lineText, matchText = _ref1.matchText, range = _ref1.range;
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

    ProjectPaletteFinder.prototype.getPatternsRegExp = function() {
      return new RegExp('(' + this.constructor.patterns.join('|') + ')', 'gi');
    };

    return ProjectPaletteFinder;

  })();

  module.exports = new ProjectPaletteFinder;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDZHQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FETCxDQUFBOztBQUFBLEVBRUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxLQUFSLENBRk4sQ0FBQTs7QUFBQSxFQUdBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUhQLENBQUE7O0FBQUEsRUFJQSxLQUFBLEdBQVEsT0FBQSxDQUFRLFVBQVIsQ0FKUixDQUFBOztBQUFBLEVBS0EsV0FBQSxHQUFjLE9BQUEsQ0FBUSxhQUFSLENBTGQsQ0FBQTs7QUFBQSxFQU1DLFVBQVcsT0FBQSxDQUFRLFVBQVIsRUFBWCxPQU5ELENBQUE7O0FBQUEsRUFRQSxPQUFBLEdBQVUsT0FBQSxDQUFRLFdBQVIsQ0FSVixDQUFBOztBQUFBLEVBU0EsV0FBQSxHQUFjLE9BQUEsQ0FBUSxnQkFBUixDQVRkLENBQUE7O0FBQUEsRUFVQSxrQkFBQSxHQUFxQixPQUFBLENBQVEsd0JBQVIsQ0FWckIsQ0FBQTs7QUFBQSxFQVlNO0FBQ0osSUFBQSxvQkFBQyxDQUFBLEtBQUQsR0FBUSxLQUFSLENBQUE7O0FBQUEsSUFDQSxPQUFPLENBQUMsV0FBUixDQUFvQixvQkFBcEIsQ0FEQSxDQUFBOztBQUFBLElBR0Esb0JBQUMsQ0FBQSxRQUFELEdBQVcsQ0FDVCx3QkFEUyxFQUVULHNCQUZTLEVBR1QscUJBSFMsQ0FIWCxDQUFBOztBQUFBLElBU0Esb0JBQUMsQ0FBQSxZQUFELEdBQWUsQ0FDYixXQURhLEVBRWIsV0FGYSxFQUdiLFdBSGEsRUFJYixXQUphLENBVGYsQ0FBQTs7QUFBQSxJQWdCQSxvQkFBQyxDQUFBLG9CQUFELEdBQ0U7QUFBQSxNQUFBLElB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
//# sourceURL=/Users/andytlr/.atom/packages/project-palette-finder/lib/project-palette-finder.coffee