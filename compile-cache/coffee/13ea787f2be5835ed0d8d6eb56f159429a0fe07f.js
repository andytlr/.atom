(function() {
  var CoffeeCompileView, ProjectPaletteColorView, ScrollView,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ScrollView = require('atom').ScrollView;

  ProjectPaletteColorView = require('./project-palette-color-view');

  module.exports = CoffeeCompileView = (function(_super) {
    __extends(CoffeeCompileView, _super);

    function CoffeeCompileView() {
      return CoffeeCompileView.__super__.constructor.apply(this, arguments);
    }

    CoffeeCompileView.content = function() {
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
                "class": 'btn'
              }, 'Grid');
              return _this.button({
                outlet: 'listSwitch',
                "class": 'btn selected'
              }, 'List');
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
      this.subscribe(this, 'core:move-up', (function(_this) {
        return function() {
          return _this.scrollUp();
        };
      })(this));
      this.subscribe(this, 'core:move-down', (function(_this) {
        return function() {
          return _this.scrollDown();
        };
      })(this));
      this.subscribe(this.gridSwitch, 'click', (function(_this) {
        return function() {
          _this.gridSwitch.addClass('selected');
          _this.listSwitch.removeClass('selected');
          return _this.paletteColors.addClass('grid');
        };
      })(this));
      return this.subscribe(this.listSwitch, 'click', (function(_this) {
        return function() {
          _this.gridSwitch.removeClass('selected');
          _this.listSwitch.addClass('selected');
          return _this.paletteColors.removeClass('grid');
        };
      })(this));
    };

    CoffeeCompileView.prototype.setPalette = function(palette) {
      var files, i, item, pluralize, view, _i, _j, _len, _len1, _ref, _ref1, _results;
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
      _ref1 = this.palette.items;
      _results = [];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        item = _ref1[_j];
        view = new ProjectPaletteColorView(item);
        _results.push(this.paletteColors.append(view));
      }
      return _results;
    };

    CoffeeCompileView.prototype.getTitle = function() {
      return 'Project Palette';
    };

    CoffeeCompileView.prototype.getURI = function() {
      return 'palette://view';
    };

    return CoffeeCompileView;

  })(ScrollView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHNEQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxhQUFjLE9BQUEsQ0FBUSxNQUFSLEVBQWQsVUFBRCxDQUFBOztBQUFBLEVBQ0EsdUJBQUEsR0FBMEIsT0FBQSxDQUFRLDhCQUFSLENBRDFCLENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osd0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsaUJBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsT0FBQSxFQUFPLCtDQUFQO0FBQUEsUUFBd0QsUUFBQSxFQUFVLENBQUEsQ0FBbEU7T0FBTCxFQUEyRSxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQ3pFLFVBQUEsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsT0FBQSxFQUFPLGtCQUFQO1dBQUwsRUFBZ0MsU0FBQSxHQUFBO0FBQzlCLFlBQUEsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLGNBQUEsT0FBQSxFQUFPLHdCQUFQO2FBQUwsRUFBc0MsU0FBQSxHQUFBO0FBQ3BDLGNBQUEsS0FBQyxDQUFBLE1BQUQsQ0FBUTtBQUFBLGdCQUFBLE1BQUEsRUFBUSxZQUFSO0FBQUEsZ0JBQXNCLE9BQUEsRUFBTyxLQUE3QjtlQUFSLEVBQTRDLE1BQTVDLENBQUEsQ0FBQTtxQkFDQSxLQUFDLENBQUEsTUFBRCxDQUFRO0FBQUEsZ0JBQUEsTUFBQSxFQUFRLFlBQVI7QUFBQSxnQkFBc0IsT0FBQSxFQUFPLGNBQTdCO2VBQVIsRUFBcUQsTUFBckQsRUFGb0M7WUFBQSxDQUF0QyxDQUFBLENBQUE7bUJBR0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLGNBQUEsTUFBQSxFQUFR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
//# sourceURL=/Users/andytlr/.atom/packages/project-palette-finder/lib/project-palette-view.coffee