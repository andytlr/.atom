(function() {
  var ProjectPaletteColorView, View, path,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom-space-pen-views').View;

  path = require('path');

  module.exports = ProjectPaletteColorView = (function(_super) {
    __extends(ProjectPaletteColorView, _super);

    ProjectPaletteColorView.content = function() {
      return this.div({
        "class": 'color inset-panel padded'
      }, (function(_this) {
        return function() {
          _this.div({
            outlet: 'colorPreview',
            "class": 'color-preview'
          });
          _this.div({
            "class": 'color-details'
          }, function() {
            _this.span({
              outlet: 'colorName',
              "class": 'color-name'
            });
            return _this.span({
              outlet: 'colorPath',
              "class": 'color-path'
            });
          });
          return _this.div({
            outlet: 'colorLine',
            "class": 'color-line editor editor-colors'
          }, function() {});
        };
      })(this));
    };

    function ProjectPaletteColorView(paletteItem) {
      var grammar;
      ProjectPaletteColorView.__super__.constructor.apply(this, arguments);
      this.colorPreview.css({
        backgroundColor: paletteItem.color.toCSS()
      });
      this.tooltipSubscription = atom.tooltips.add(this.colorPreview, {
        title: paletteItem.name
      });
      this.colorName.text(paletteItem.name);
      this.colorPath.text(path.relative(atom.project.getPath(), paletteItem.filePath) + ':' + (paletteItem.row + 1));
      grammar = atom.syntax.selectGrammar("hello." + paletteItem.extension, paletteItem.lineText);
      this.colorLine.empty();
      this.colorLine.append(paletteItem.lineText);
      this.colorPath.on('click', function() {
        return atom.workspaceView.open(paletteItem.filePath, {
          split: 'left'
        }).then(function(editor) {
          return editor.setSelectedBufferRange(paletteItem.getRange(), {
            autoscroll: true
          });
        });
      });
    }

    return ProjectPaletteColorView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1DQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxPQUFRLE9BQUEsQ0FBUSxzQkFBUixFQUFSLElBQUQsQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQURQLENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osOENBQUEsQ0FBQTs7QUFBQSxJQUFBLHVCQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTywwQkFBUDtPQUFMLEVBQXdDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDdEMsVUFBQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsWUFBQSxNQUFBLEVBQVEsY0FBUjtBQUFBLFlBQXdCLE9BQUEsRUFBTyxlQUEvQjtXQUFMLENBQUEsQ0FBQTtBQUFBLFVBQ0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsT0FBQSxFQUFPLGVBQVA7V0FBTCxFQUE2QixTQUFBLEdBQUE7QUFDM0IsWUFBQSxLQUFDLENBQUEsSUFBRCxDQUFNO0FBQUEsY0FBQSxNQUFBLEVBQVEsV0FBUjtBQUFBLGNBQXFCLE9BQUEsRUFBTyxZQUE1QjthQUFOLENBQUEsQ0FBQTttQkFDQSxLQUFDLENBQUEsSUFBRCxDQUFNO0FBQUEsY0FBQSxNQUFBLEVBQVEsV0FBUjtBQUFBLGNBQXFCLE9BQUEsRUFBTyxZQUE1QjthQUFOLEVBRjJCO1VBQUEsQ0FBN0IsQ0FEQSxDQUFBO2lCQUlBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxZQUFBLE1BQUEsRUFBUSxXQUFSO0FBQUEsWUFBcUIsT0FBQSxFQUFPLGlDQUE1QjtXQUFMLEVBQW9FLFNBQUEsR0FBQSxDQUFwRSxFQUxzQztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXhDLEVBRFE7SUFBQSxDQUFWLENBQUE7O0FBUWEsSUFBQSxpQ0FBQyxXQUFELEdBQUE7QUFDWCxVQUFBLE9BQUE7QUFBQSxNQUFBLDBEQUFBLFNBQUEsQ0FBQSxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsWUFBWSxDQUFDLEdBQWQsQ0FBa0I7QUFBQSxRQUFBLGVBQUEsRUFBaUIsV0FBVyxDQUFDLEtBQUssQ0FBQyxLQUFsQixDQUFBLENBQWpCO09BQWxCLENBRkEsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLG1CQUFELEdBQXVCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixJQUFDLENBQUEsWUFBbkIsRUFBaUM7QUFBQSxRQUFBLEtBQUEsRUFBTyxXQUFXLENBQUMsSUFBbkI7T0FBakMsQ0FIdkIsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQWdCLFdBQVcsQ0FBQyxJQUE1QixDQUpBLENBQUE7QUFBQSxNQUtBLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFnQixJQUFJLENBQUMsUUFBTCxDQUFjLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBYixDQUFBLENBQWQsRUFBc0MsV0FBVyxDQUFDLFFBQWxELENBQUEsR0FBOEQsR0FBOUQsR0FBb0UsQ0FBQyxXQUFXLENBQUMsR0FBWixHQUFrQixDQUFuQixDQUFwRixDQUxBLENBQUE7QUFBQSxNQU9BLE9BQUEsR0FBVSxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQVosQ0FBMkIsUUFBQSxHQUFPLFdBQVcsQ0FBQyxTQUE5QyxFQUE0RCxXQUFXLENBQUMsUUFBeEUsQ0FQVixDQUFBO0FBQUEsTUFTQSxJQUFDLENBQUEsU0FBUyxDQUFDLEtBQVgsQ0FBQSxDQVRBLENBQUE7QUFBQSxNQVVBLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBWCxDQUFrQixXQUFXLENBQUMsUUFBOUIsQ0FWQSxDQUFBO0FBQUEsTUFZQSxJQUFDLENBQUEsU0FBUyxDQUFDLEVBQVgsQ0FBYyxPQUFkLEVBQXVCLFNBQUEsR0FBQTtlQUNyQixJQUFJLENBQUMsYUFBYSxDQUFDLElBQW5CLENBQXdCLFdBQVcsQ0FBQyxRQUFwQyxFQUE4QztBQUFBLFVBQUEsS0FBQSxFQUFPLE1BQVA7U0FBOUMsQ0FBNEQsQ0FBQyxJQUE3RCxDQUFrRSxTQUFDLE1BQUQsR0FBQTtpQkFDaEUsTUFBTSxDQUFDLHNCQUFQLENBQThCLFdBQVcsQ0FBQyxRQUFaLENBQUEsQ0FBOUIsRUFBc0Q7QUFBQSxZQUFBLFVBQUEsRUFBWSxJQUFaO1dBQXRELEVBRGdFO1FBQUEsQ0FBbEUsRUFEcUI7TUFBQSxDQUF2QixDQVpBLENBRFc7SUFBQSxDQVJiOzttQ0FBQTs7S0FEb0MsS0FKdEMsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/andytlr/.atom/packages/project-palette-finder/lib/project-palette-color-view.coffee