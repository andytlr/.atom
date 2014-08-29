(function() {
  var Emitter, Palette, PaletteItem,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Emitter = require('emissary').Emitter;

  PaletteItem = require('./palette-item');

  module.exports = Palette = (function() {
    Emitter.includeInto(Palette);

    function Palette(_arg) {
      var item, items, _i, _len;
      items = (_arg != null ? _arg : {}).items;
      items || (items = []);
      this.items = [];
      for (_i = 0, _len = items.length; _i < _len; _i++) {
        item = items[_i];
        this.addItem(new PaletteItem(item));
      }
    }

    Palette.prototype.addItem = function(item) {
      if (__indexOf.call(this.items, item) < 0) {
        return this.items.push(item);
      }
    };

    Palette.prototype.removeItem = function(item) {
      if (__indexOf.call(this.items, item) >= 0) {
        return this.items.splice(this.items.indexOf(item), 1);
      }
    };

    Palette.prototype.getItemByName = function(name) {
      return this.items.filter(function(item) {
        return item.name === name;
      })[0];
    };

    Palette.prototype.getItemsForPath = function(filePath) {
      return this.items.filter(function(item) {
        return item.filePath === filePath;
      });
    };

    Palette.prototype.getItemsForPathInRange = function(filePath, range) {
      var mEndCol, mEndRow, mStartCol, mStartRow, _ref, _ref1;
      (_ref = range[0], mStartRow = _ref[0], mStartCol = _ref[1]), (_ref1 = range[1], mEndRow = _ref1[0], mEndCol = _ref1[1]);
      return this.getItemsForPath(filePath).filter(function(item) {
        var endCol, endRow, startCol, startRow, _ref2, _ref3, _ref4;
        _ref2 = item.getRange(), (_ref3 = _ref2[0], startRow = _ref3[0], startCol = _ref3[1]), (_ref4 = _ref2[1], endRow = _ref4[0], endCol = _ref4[1]);
        return startRow >= mStartRow && startColumn >= mStartCol && endRow <= mEndRow && endCol <= mEndCol;
      });
    };

    Palette.prototype.serialize = function() {
      return {
        items: this.items.map(function(i) {
          return i.serialize();
        })
      };
    };

    return Palette;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDZCQUFBO0lBQUEscUpBQUE7O0FBQUEsRUFBQyxVQUFXLE9BQUEsQ0FBUSxVQUFSLEVBQVgsT0FBRCxDQUFBOztBQUFBLEVBQ0EsV0FBQSxHQUFjLE9BQUEsQ0FBUSxnQkFBUixDQURkLENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osSUFBQSxPQUFPLENBQUMsV0FBUixDQUFvQixPQUFwQixDQUFBLENBQUE7O0FBRWEsSUFBQSxpQkFBQyxJQUFELEdBQUE7QUFDWCxVQUFBLHFCQUFBO0FBQUEsTUFEYSx3QkFBRCxPQUFRLElBQVAsS0FDYixDQUFBO0FBQUEsTUFBQSxVQUFBLFFBQVUsR0FBVixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsS0FBRCxHQUFTLEVBRFQsQ0FBQTtBQUdBLFdBQUEsNENBQUE7eUJBQUE7QUFDRSxRQUFBLElBQUMsQ0FBQSxPQUFELENBQWEsSUFBQSxXQUFBLENBQVksSUFBWixDQUFiLENBQUEsQ0FERjtBQUFBLE9BSlc7SUFBQSxDQUZiOztBQUFBLHNCQVNBLE9BQUEsR0FBUyxTQUFDLElBQUQsR0FBQTtBQUNQLE1BQUEsSUFBd0IsZUFBUSxJQUFDLENBQUEsS0FBVCxFQUFBLElBQUEsS0FBeEI7ZUFBQSxJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBWSxJQUFaLEVBQUE7T0FETztJQUFBLENBVFQsQ0FBQTs7QUFBQSxzQkFZQSxVQUFBLEdBQVksU0FBQyxJQUFELEdBQUE7QUFDVixNQUFBLElBQUcsZUFBUSxJQUFDLENBQUEsS0FBVCxFQUFBLElBQUEsTUFBSDtlQUNFLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxDQUFjLElBQUMsQ0FBQSxLQUFLLENBQUMsT0FBUCxDQUFlLElBQWYsQ0FBZCxFQUFvQyxDQUFwQyxFQURGO09BRFU7SUFBQSxDQVpaLENBQUE7O0FBQUEsc0JBZ0JBLGFBQUEsR0FBZSxTQUFDLElBQUQsR0FBQTthQUNiLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxDQUFjLFNBQUMsSUFBRCxHQUFBO2VBQVUsSUFBSSxDQUFDLElBQUwsS0FBYSxLQUF2QjtNQUFBLENBQWQsQ0FBMkMsQ0FBQSxDQUFBLEVBRDlCO0lBQUEsQ0FoQmYsQ0FBQTs7QUFBQSxzQkFtQkEsZUFBQSxHQUFpQixTQUFDLFFBQUQsR0FBQTthQUNmLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxDQUFjLFNBQUMsSUFBRCxHQUFBO2VBQVUsSUFBSSxDQUFDLFFBQUwsS0FBaUIsU0FBM0I7TUFBQSxDQUFkLEVBRGU7SUFBQSxDQW5CakIsQ0FBQTs7QUFBQSxzQkFzQkEsc0JBQUEsR0FBd0IsU0FBQyxRQUFELEVBQVcsS0FBWCxHQUFBO0FBQ3RCLFVBQUEsbURBQUE7QUFBQSx3QkFBRSxxQkFBVyxvQkFBYixxQkFBMEIsb0JBQVMsbUJBQW5DLENBQUE7YUFDQSxJQUFDLENBQUEsZUFBRCxDQUFpQixRQUFqQixDQUEwQixDQUFDLE1BQTNCLENBQWtDLFNBQUMsSUFBRCxHQUFBO0FBQ2hDLFlBQUEsdURBQUE7QUFBQSxRQUFBLFFBQTJDLElBQUksQ0FBQyxRQUFMLENBQUEsQ0FBM0MscUJBQUUscUJBQVUsb0JBQVoscUJBQXdCLG1CQUFRLGtCQUFoQyxDQUFBO2VBRUEsUUFBQSxJQUFZLFNBQVosSUFDQSxXQUFBLElBQWUsU0FEZixJQUVBLE1BQUEsSUFBVSxPQUZWLElBR0EsTUFBQSxJQUFVLFFBTnNCO01BQUEsQ0FBbEMsRUFGc0I7SUFBQSxDQXRCeEIsQ0FBQTs7QUFBQSxzQkFnQ0EsU0FBQSxHQUFXLFNBQUEsR0FBQTthQUFHO0FBQUEsUUFBRSxLQUFBLEVBQU8sSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsU0FBQyxDQUFELEdBQUE7aUJBQU8sQ0FBQyxDQUFDLFNBQUYsQ0FBQSxFQUFQO1FBQUEsQ0FBWCxDQUFUO1FBQUg7SUFBQSxDQWhDWCxDQUFBOzttQkFBQTs7TUFMRixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/andytlr/.atom/packages/project-palette-finder/lib/palette.coffee