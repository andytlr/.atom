(function() {
  var PropertyAccessors;

  PropertyAccessors = require('property-accessors');

  module.exports = function(Color) {
    var PaletteItem;
    return PaletteItem = (function() {
      PropertyAccessors.includeInto(PaletteItem);

      PaletteItem.prototype.accessor('color', {
        get: function() {
          return this._color || (this._color = new Color(this.colorString));
        }
      });

      function PaletteItem(_arg) {
        this.name = _arg.name, this.filePath = _arg.filePath, this.row = _arg.row, this.lineRange = _arg.lineRange, this.lineText = _arg.lineText, this.colorString = _arg.colorString, this.language = _arg.language, this.extension = _arg.extension;
      }

      PaletteItem.prototype.getRange = function() {
        return [[this.row, this.lineRange[0]], [this.row, this.lineRange[1]]];
      };

      PaletteItem.prototype.serialize = function() {
        return {
          name: this.name,
          filePath: this.filePath,
          row: this.row,
          lineRange: this.lineRange,
          lineText: this.lineText,
          colorString: this.colorString,
          language: this.language
        };
      };

      return PaletteItem;

    })();
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlCQUFBOztBQUFBLEVBQUEsaUJBQUEsR0FBb0IsT0FBQSxDQUFRLG9CQUFSLENBQXBCLENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLEtBQUQsR0FBQTtBQUNmLFFBQUEsV0FBQTtXQUFNO0FBQ0osTUFBQSxpQkFBaUIsQ0FBQyxXQUFsQixDQUE4QixXQUE5QixDQUFBLENBQUE7O0FBQUEsTUFFQSxXQUFDLENBQUEsU0FBRSxDQUFBLFFBQUgsQ0FBWSxPQUFaLEVBQXFCO0FBQUEsUUFBQSxHQUFBLEVBQUssU0FBQSxHQUFBO2lCQUFHLElBQUMsQ0FBQSxXQUFELElBQUMsQ0FBQSxTQUFlLElBQUEsS0FBQSxDQUFNLElBQUMsQ0FBQSxXQUFQLEdBQW5CO1FBQUEsQ0FBTDtPQUFyQixDQUZBLENBQUE7O0FBSWEsTUFBQSxxQkFBQyxJQUFELEdBQUE7QUFBd0YsUUFBdEYsSUFBQyxDQUFBLFlBQUEsTUFBTSxJQUFDLENBQUEsZ0JBQUEsVUFBVSxJQUFDLENBQUEsV0FBQSxLQUFLLElBQUMsQ0FBQSxpQkFBQSxXQUFXLElBQUMsQ0FBQSxnQkFBQSxVQUFVLElBQUMsQ0FBQSxtQkFBQSxhQUFhLElBQUMsQ0FBQSxnQkFBQSxVQUFVLElBQUMsQ0FBQSxpQkFBQSxTQUFhLENBQXhGO01BQUEsQ0FKYjs7QUFBQSw0QkFNQSxRQUFBLEdBQVUsU0FBQSxHQUFBO2VBQ1IsQ0FBQyxDQUFDLElBQUMsQ0FBQSxHQUFGLEVBQU8sSUFBQyxDQUFBLFNBQVUsQ0FBQSxDQUFBLENBQWxCLENBQUQsRUFBd0IsQ0FBQyxJQUFDLENBQUEsR0FBRixFQUFPLElBQUMsQ0FBQSxTQUFVLENBQUEsQ0FBQSxDQUFsQixDQUF4QixFQURRO01BQUEsQ0FOVixDQUFBOztBQUFBLDRCQVNBLFNBQUEsR0FBVyxTQUFBLEdBQUE7ZUFDVDtBQUFBLFVBQUUsTUFBRCxJQUFDLENBQUEsSUFBRjtBQUFBLFVBQVMsVUFBRCxJQUFDLENBQUEsUUFBVDtBQUFBLFVBQW9CLEtBQUQsSUFBQyxDQUFBLEdBQXBCO0FBQUEsVUFBMEIsV0FBRCxJQUFDLENBQUEsU0FBMUI7QUFBQSxVQUFzQyxVQUFELElBQUMsQ0FBQSxRQUF0QztBQUFBLFVBQWlELGFBQUQsSUFBQyxDQUFBLFdBQWpEO0FBQUEsVUFBK0QsVUFBRCxJQUFDLENBQUEsUUFBL0Q7VUFEUztNQUFBLENBVFgsQ0FBQTs7eUJBQUE7O1NBRmE7RUFBQSxDQUZqQixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/andytlr/.atom/packages/project-palette-finder/lib/palette-item.coffee