(function() {
  var Color, PaletteItem, PropertyAccessors;

  PropertyAccessors = require('property-accessors');

  Color = require('pigments');

  module.exports = PaletteItem = (function() {
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

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFDQUFBOztBQUFBLEVBQUEsaUJBQUEsR0FBb0IsT0FBQSxDQUFRLG9CQUFSLENBQXBCLENBQUE7O0FBQUEsRUFDQSxLQUFBLEdBQVEsT0FBQSxDQUFRLFVBQVIsQ0FEUixDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLElBQUEsaUJBQWlCLENBQUMsV0FBbEIsQ0FBOEIsV0FBOUIsQ0FBQSxDQUFBOztBQUFBLElBRUEsV0FBQyxDQUFBLFNBQUUsQ0FBQSxRQUFILENBQVksT0FBWixFQUFxQjtBQUFBLE1BQUEsR0FBQSxFQUFLLFNBQUEsR0FBQTtlQUFHLElBQUMsQ0FBQSxXQUFELElBQUMsQ0FBQSxTQUFlLElBQUEsS0FBQSxDQUFNLElBQUMsQ0FBQSxXQUFQLEdBQW5CO01BQUEsQ0FBTDtLQUFyQixDQUZBLENBQUE7O0FBSWEsSUFBQSxxQkFBQyxJQUFELEdBQUE7QUFBd0YsTUFBdEYsSUFBQyxDQUFBLFlBQUEsTUFBTSxJQUFDLENBQUEsZ0JBQUEsVUFBVSxJQUFDLENBQUEsV0FBQSxLQUFLLElBQUMsQ0FBQSxpQkFBQSxXQUFXLElBQUMsQ0FBQSxnQkFBQSxVQUFVLElBQUMsQ0FBQSxtQkFBQSxhQUFhLElBQUMsQ0FBQSxnQkFBQSxVQUFVLElBQUMsQ0FBQSxpQkFBQSxTQUFhLENBQXhGO0lBQUEsQ0FKYjs7QUFBQSwwQkFNQSxRQUFBLEdBQVUsU0FBQSxHQUFBO2FBQ1IsQ0FBQyxDQUFDLElBQUMsQ0FBQSxHQUFGLEVBQU8sSUFBQyxDQUFBLFNBQVUsQ0FBQSxDQUFBLENBQWxCLENBQUQsRUFBd0IsQ0FBQyxJQUFDLENBQUEsR0FBRixFQUFPLElBQUMsQ0FBQSxTQUFVLENBQUEsQ0FBQSxDQUFsQixDQUF4QixFQURRO0lBQUEsQ0FOVixDQUFBOztBQUFBLDBCQVNBLFNBQUEsR0FBVyxTQUFBLEdBQUE7YUFDVDtBQUFBLFFBQUUsTUFBRCxJQUFDLENBQUEsSUFBRjtBQUFBLFFBQVMsVUFBRCxJQUFDLENBQUEsUUFBVDtBQUFBLFFBQW9CLEtBQUQsSUFBQyxDQUFBLEdBQXBCO0FBQUEsUUFBMEIsV0FBRCxJQUFDLENBQUEsU0FBMUI7QUFBQSxRQUFzQyxVQUFELElBQUMsQ0FBQSxRQUF0QztBQUFBLFFBQWlELGFBQUQsSUFBQyxDQUFBLFdBQWpEO0FBQUEsUUFBK0QsVUFBRCxJQUFDLENBQUEsUUFBL0Q7UUFEUztJQUFBLENBVFgsQ0FBQTs7dUJBQUE7O01BTEYsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/andytlr/.atom/packages/project-palette-finder/lib/palette-item.coffee