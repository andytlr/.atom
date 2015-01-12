(function() {
  var CoffeeCompileView, CompositeDisposable, ProjectPaletteColorView, ScrollView,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ScrollView = require('atom-space-pen-views').ScrollView;

  ProjectPaletteColorView = require('./project-palette-color-view');

  CompositeDisposable = require('event-kit').CompositeDisposable;

  module.exports = CoffeeCompileView = (function(_super) {
    __extends(CoffeeCompileView, _super);

    function CoffeeCompileView() {
      return CoffeeCompileView.__super__.constructor.apply(this, arguments);
    }

    CoffeeCompileView.content = function() {
      var displayMode, gridClass, listClass;
      gridClass = 'btn';
      listClass = 'btn';
      displayMode = atom.config.get('project-palette-finder.paletteDisplay');
      if (displayMode === 'list') {
        listClass += ' selected';
      } else {
        gridClass += ' selected';
      }
      return this.div({
        "class": 'palette tool-panel padded native-key-bindings',
        tabIndex: -1
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'palette-controls'
          }, function() {
            _this.div({
              "class": 'inline-block btn-group'
            }, function() {
              _this.button({
                outlet: 'gridSwitch',
                "class": gridClass
              }, 'Grid');
              return _this.button({
                outlet: 'listSwitch',
                "class": listClass
              }, 'List');
            });
            _this.div({
              "class": 'inline-block'
            }, function() {
              var inputAttrs;
              inputAttrs = {
                outlet: 'sortColors',
                type: 'checkbox',
                id: 'sort-colors'
              };
              if (atom.config.get('project-palette-finder.paletteSort')) {
                inputAttrs['checked'] = 'checked';
              }
              _this.input(inputAttrs);
              return _this.label({
                "for": 'sort-colors'
              }, 'Sort Colors');
            });
            return _this.div({
              outlet: 'paletteStats',
              "class": 'palette-stats inline-block'
            });
          });
          return _this.div({
            outlet: 'paletteColors',
            "class": 'colors'
          });
        };
      })(this));
    };

    CoffeeCompileView.prototype.initialize = function() {
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.commands.add(this, {
        'core:move-up': (function(_this) {
          return function() {
            return _this.scrollUp();
          };
        })(this),
        'core:move-down': (function(_this) {
          return function() {
            return _this.scrollDown();
          };
        })(this)
      }));
      this.sorted = atom.config.get('project-palette-finder.paletteSort');
      this.subscriptions.add(this.gridSwitch.on('click', (function(_this) {
        return function() {
          atom.config.set('project-palette-finder.paletteDisplay', 'grid');
          _this.gridSwitch.addClass('selected');
          _this.listSwitch.removeClass('selected');
          return _this.paletteColors.addClass('grid');
        };
      })(this)));
      this.subscriptions.add(this.listSwitch.on('click', (function(_this) {
        return function() {
          atom.config.set('project-palette-finder.paletteDisplay', 'list');
          _this.gridSwitch.removeClass('selected');
          _this.listSwitch.addClass('selected');
          return _this.paletteColors.removeClass('grid');
        };
      })(this)));
      return this.subscriptions.add(this.sortColors.on('change', (function(_this) {
        return function() {
          _this.sorted = _this.sortColors[0].checked;
          atom.config.set('project-palette-finder.paletteSort', _this.sorted);
          return _this.buildColors();
        };
      })(this)));
    };

    CoffeeCompileView.prototype.setPalette = function(palette) {
      var files, i, pluralize, _i, _len, _ref;
      this.palette = palette;
      files = {};
      _ref = this.palette.items;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        i = _ref[_i];
        files[i.filePath] = i;
      }
      pluralize = function(n, singular, plural) {
        if (n === 1) {
          return "" + n + " " + singular;
        } else {
          return "" + n + " " + plural;
        }
      };
      this.paletteStats.html("<span class=\"text-info\">" + (pluralize(this.palette.items.length, 'color', 'colors')) + "</span>\nfound accross\n<span class=\"text-info\">" + (pluralize(Object.keys(files).length, 'file', 'files')) + "</span>");
      return this.buildColors();
    };

    CoffeeCompileView.prototype.getTitle = function() {
      return 'Project Palette';
    };

    CoffeeCompileView.prototype.getURI = function() {
      return 'palette://view';
    };

    CoffeeCompileView.prototype.compareColors = function(a, b) {
      a = a._color;
      b = b._color;
      if (a.hue < b.hue) {
        return -1;
      } else if (a.hue > b.hue) {
        return 1;
      } else if (a.saturation < b.saturation) {
        return -1;
      } else if (a.saturation > b.saturation) {
        return 1;
      } else if (a.lightness < b.lightness) {
        return -1;
      } else if (a.lightness > b.lightness) {
        return 1;
      } else {
        return 0;
      }
    };

    CoffeeCompileView.prototype.buildColors = function() {
      var item, items, view, _i, _len, _results;
      this.paletteColors.html('');
      items = this.palette.items.concat();
      if (this.sorted) {
        items.sort((function(_this) {
          return function(a, b) {
            return _this.compareColors(a, b);
          };
        })(this));
      }
      _results = [];
      for (_i = 0, _len = items.length; _i < _len; _i++) {
        item = items[_i];
        view = new ProjectPaletteColorView(item);
        _results.push(this.paletteColors.append(view));
      }
      return _results;
    };

    return CoffeeCompileView;

  })(ScrollView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDJFQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxhQUFjLE9BQUEsQ0FBUSxzQkFBUixFQUFkLFVBQUQsQ0FBQTs7QUFBQSxFQUNBLHVCQUFBLEdBQTBCLE9BQUEsQ0FBUSw4QkFBUixDQUQxQixDQUFBOztBQUFBLEVBRUMsc0JBQXVCLE9BQUEsQ0FBUSxXQUFSLEVBQXZCLG1CQUZELENBQUE7O0FBQUEsRUFJQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osd0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsaUJBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQSxHQUFBO0FBRVIsVUFBQSxpQ0FBQTtBQUFBLE1BQUEsU0FBQSxHQUFZLEtBQVosQ0FBQTtBQUFBLE1BQ0EsU0FBQSxHQUFZLEtBRFosQ0FBQTtBQUFBLE1BR0EsV0FBQSxHQUFjLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix1Q0FBaEIsQ0FIZCxDQUFBO0FBSUEsTUFBQSxJQUFHLFdBQUEsS0FBZSxNQUFsQjtBQUNFLFFBQUEsU0FBQSxJQUFhLFdBQWIsQ0FERjtPQUFBLE1BQUE7QUFHRSxRQUFBLFNBQUEsSUFBYSxXQUFiLENBSEY7T0FKQTthQVNBLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTywrQ0FBUDtBQUFBLFFBQXdELFFBQUEsRUFBVSxDQUFBLENBQWxFO09BQUwsRUFBMkUsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUN6RSxVQUFBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxZQUFBLE9BQUEsRUFBTyxrQkFBUDtXQUFMLEVBQWdDLFNBQUEsR0FBQTtBQUM5QixZQUFBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxjQUFBLE9BQUEsRUFBTyx3QkFBUDth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
//# sourceURL=/Users/andytlr/.atom/packages/project-palette-finder/lib/project-palette-view.coffee