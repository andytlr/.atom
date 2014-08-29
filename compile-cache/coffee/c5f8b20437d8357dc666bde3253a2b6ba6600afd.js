(function() {
  var EditorView, ProjectPaletteColorView, View, path, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  path = require('path');

  _ref = require('atom'), View = _ref.View, EditorView = _ref.EditorView;

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
      var attributes, grammar, tokens, _i, _len, _ref1;
      ProjectPaletteColorView.__super__.constructor.apply(this, arguments);
      this.colorPreview.css({
        backgroundColor: paletteItem.color.toCSS()
      });
      this.colorPreview.setTooltip(paletteItem.name);
      this.colorName.text(paletteItem.name);
      this.colorPath.text(path.relative(atom.project.getPath(), paletteItem.filePath) + ':' + (paletteItem.row + 1));
      grammar = atom.syntax.selectGrammar("hello." + paletteItem.extension, paletteItem.lineText);
      this.colorLine.empty();
      _ref1 = grammar.tokenizeLines(paletteItem.lineText);
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        tokens = _ref1[_i];
        attributes = {
          "class": "line"
        };
        this.colorLine.append(EditorView.buildLineHtml({
          tokens: tokens,
          text: paletteItem.lineText,
          attributes: attributes
        }));
      }
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFEQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FBUCxDQUFBOztBQUFBLEVBQ0EsT0FBcUIsT0FBQSxDQUFRLE1BQVIsQ0FBckIsRUFBQyxZQUFBLElBQUQsRUFBTyxrQkFBQSxVQURQLENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osOENBQUEsQ0FBQTs7QUFBQSxJQUFBLHVCQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTywwQkFBUDtPQUFMLEVBQXdDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDdEMsVUFBQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsWUFBQSxNQUFBLEVBQVEsY0FBUjtBQUFBLFlBQXdCLE9BQUEsRUFBTyxlQUEvQjtXQUFMLENBQUEsQ0FBQTtBQUFBLFVBQ0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsT0FBQSxFQUFPLGVBQVA7V0FBTCxFQUE2QixTQUFBLEdBQUE7QUFDM0IsWUFBQSxLQUFDLENBQUEsSUFBRCxDQUFNO0FBQUEsY0FBQSxNQUFBLEVBQVEsV0FBUjtBQUFBLGNBQXFCLE9BQUEsRUFBTyxZQUE1QjthQUFOLENBQUEsQ0FBQTttQkFDQSxLQUFDLENBQUEsSUFBRCxDQUFNO0FBQUEsY0FBQSxNQUFBLEVBQVEsV0FBUjtBQUFBLGNBQXFCLE9BQUEsRUFBTyxZQUE1QjthQUFOLEVBRjJCO1VBQUEsQ0FBN0IsQ0FEQSxDQUFBO2lCQUlBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxZQUFBLE1BQUEsRUFBUSxXQUFSO0FBQUEsWUFBcUIsT0FBQSxFQUFPLGlDQUE1QjtXQUFMLEVBQW9FLFNBQUEsR0FBQSxDQUFwRSxFQUxzQztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXhDLEVBRFE7SUFBQSxDQUFWLENBQUE7O0FBUWEsSUFBQSxpQ0FBQyxXQUFELEdBQUE7QUFDWCxVQUFBLDRDQUFBO0FBQUEsTUFBQSwwREFBQSxTQUFBLENBQUEsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLFlBQVksQ0FBQyxHQUFkLENBQWtCO0FBQUEsUUFBQSxlQUFBLEVBQWlCLFdBQVcsQ0FBQyxLQUFLLENBQUMsS0FBbEIsQ0FBQSxDQUFqQjtPQUFsQixDQUZBLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxZQUFZLENBQUMsVUFBZCxDQUF5QixXQUFXLENBQUMsSUFBckMsQ0FIQSxDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBZ0IsV0FBVyxDQUFDLElBQTVCLENBSkEsQ0FBQTtBQUFBLE1BS0EsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQWdCLElBQUksQ0FBQyxRQUFMLENBQWMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFiLENBQUEsQ0FBZCxFQUFzQyxXQUFXLENBQUMsUUFBbEQsQ0FBQSxHQUE4RCxHQUE5RCxHQUFvRSxDQUFDLFdBQVcsQ0FBQyxHQUFaLEdBQWtCLENBQW5CLENBQXBGLENBTEEsQ0FBQTtBQUFBLE1BT0EsT0FBQSxHQUFVLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBWixDQUEyQixRQUFBLEdBQU8sV0FBVyxDQUFDLFNBQTlDLEVBQTRELFdBQVcsQ0FBQyxRQUF4RSxDQVBWLENBQUE7QUFBQSxNQVNBLElBQUMsQ0FBQSxTQUFTLENBQUMsS0FBWCxDQUFBLENBVEEsQ0FBQTtBQVVBO0FBQUEsV0FBQSw0Q0FBQTsyQkFBQTtBQUNFLFFBQUEsVUFBQSxHQUFhO0FBQUEsVUFBQSxPQUFBLEVBQU8sTUFBUDtTQUFiLENBQUE7QUFBQSxRQUNBLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBWCxDQUFrQixVQUFVLENBQUMsYUFBWCxDQUF5QjtBQUFBLFVBQUMsUUFBQSxNQUFEO0FBQUEsVUFBUyxJQUFBLEVBQU0sV0FBVyxDQUFDLFFBQTNCO0FBQUEsVUFBcUMsWUFBQSxVQUFyQztTQUF6QixDQUFsQixDQURBLENBREY7QUFBQSxPQVZBO0FBQUEsTUFjQSxJQUFDLENBQUEsU0FBUyxDQUFDLEVBQVgsQ0FBYyxPQUFkLEVBQXVCLFNBQUEsR0FBQTtlQUNyQixJQUFJLENBQUMsYUFBYSxDQUFDLElBQW5CLENBQXdCLFdBQVcsQ0FBQyxRQUFwQyxFQUE4QztBQUFBLFVBQUEsS0FBQSxFQUFPLE1BQVA7U0FBOUMsQ0FBNEQsQ0FBQyxJQUE3RCxDQUFrRSxTQUFDLE1BQUQsR0FBQTtpQkFDaEUsTUFBTSxDQUFDLHNCQUFQLENBQThCLFdBQVcsQ0FBQyxRQUFaLENBQUEsQ0FBOUIsRUFBc0Q7QUFBQSxZQUFBLFVBQUEsRUFBWSxJQUFaO1dBQXRELEVBRGdFO1FBQUEsQ0FBbEUsRUFEcUI7TUFBQSxDQUF2QixDQWRBLENBRFc7SUFBQSxDQVJiOzttQ0FBQTs7S0FEb0MsS0FKdEMsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/andytlr/.atom/packages/project-palette-finder/lib/project-palette-color-view.coffee