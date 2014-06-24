(function() {
  var $, saveWindowDimensions, setWindowDimensions;

  $ = require('atom').$;

  module.exports = {
    configDefaults: {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      treeWidth: 0
    },
    activate: function(state) {
      setWindowDimensions();
      return $(window).on('resize beforeunload', function() {
        return saveWindowDimensions();
      });
    }
  };

  setWindowDimensions = function() {
    var height, treeWidth, width, x, y, _ref;
    _ref = atom.config.get('remember-window'), x = _ref.x, y = _ref.y, width = _ref.width, height = _ref.height, treeWidth = _ref.treeWidth;
    if (x === 0 && y === 0 && width === 0 && height === 0 && treeWidth === 0) {
      return saveWindowDimensions();
    } else {
      $('.tree-view-resizer').width(treeWidth);
      return atom.setWindowDimensions({
        'x': x,
        'y': y,
        'width': width,
        'height': height
      });
    }
  };

  saveWindowDimensions = function() {
    var height, treeWidth, width, x, y, _ref;
    _ref = atom.getWindowDimensions(), x = _ref.x, y = _ref.y, width = _ref.width, height = _ref.height;
    treeWidth = $('.tree-view-resizer').width();
    atom.config.set('remember-window.x', x);
    atom.config.set('remember-window.y', y);
    atom.config.set('remember-window.width', width);
    atom.config.set('remember-window.height', height);
    return atom.config.set('remember-window.treeWidth', treeWidth);
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDRDQUFBOztBQUFBLEVBQUMsSUFBSyxPQUFBLENBQVEsTUFBUixFQUFMLENBQUQsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLGNBQUEsRUFDRTtBQUFBLE1BQUEsQ0FBQSxFQUFHLENBQUg7QUFBQSxNQUNBLENBQUEsRUFBRyxDQURIO0FBQUEsTUFFQSxLQUFBLEVBQU8sQ0FGUDtBQUFBLE1BR0EsTUFBQSxFQUFRLENBSFI7QUFBQSxNQUlBLFNBQUEsRUFBVyxDQUpYO0tBREY7QUFBQSxJQU9BLFFBQUEsRUFBVSxTQUFDLEtBQUQsR0FBQTtBQUNSLE1BQUEsbUJBQUEsQ0FBQSxDQUFBLENBQUE7YUFDQSxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsRUFBVixDQUFhLHFCQUFiLEVBQW9DLFNBQUEsR0FBQTtlQUFHLG9CQUFBLENBQUEsRUFBSDtNQUFBLENBQXBDLEVBRlE7SUFBQSxDQVBWO0dBSEYsQ0FBQTs7QUFBQSxFQWNBLG1CQUFBLEdBQXNCLFNBQUEsR0FBQTtBQUNwQixRQUFBLG9DQUFBO0FBQUEsSUFBQSxPQUFtQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsaUJBQWhCLENBQW5DLEVBQUMsU0FBQSxDQUFELEVBQUksU0FBQSxDQUFKLEVBQU8sYUFBQSxLQUFQLEVBQWMsY0FBQSxNQUFkLEVBQXNCLGlCQUFBLFNBQXRCLENBQUE7QUFFQSxJQUFBLElBQUcsQ0FBQSxLQUFLLENBQUwsSUFBVyxDQUFBLEtBQUssQ0FBaEIsSUFBc0IsS0FBQSxLQUFTLENBQS9CLElBQXFDLE1BQUEsS0FBVSxDQUEvQyxJQUFxRCxTQUFBLEtBQWEsQ0FBckU7YUFDRSxvQkFBQSxDQUFBLEVBREY7S0FBQSxNQUFBO0FBR0UsTUFBQSxDQUFBLENBQUUsb0JBQUYsQ0FBdUIsQ0FBQyxLQUF4QixDQUE4QixTQUE5QixDQUFBLENBQUE7YUFDQSxJQUFJLENBQUMsbUJBQUwsQ0FDRTtBQUFBLFFBQUEsR0FBQSxFQUFLLENBQUw7QUFBQSxRQUNBLEdBQUEsRUFBSyxDQURMO0FBQUEsUUFFQSxPQUFBLEVBQVMsS0FGVDtBQUFBLFFBR0EsUUFBQSxFQUFVLE1BSFY7T0FERixFQUpGO0tBSG9CO0VBQUEsQ0FkdEIsQ0FBQTs7QUFBQSxFQTJCQSxvQkFBQSxHQUF1QixTQUFBLEdBQUE7QUFDckIsUUFBQSxvQ0FBQTtBQUFBLElBQUEsT0FBd0IsSUFBSSxDQUFDLG1CQUFMLENBQUEsQ0FBeEIsRUFBQyxTQUFBLENBQUQsRUFBSSxTQUFBLENBQUosRUFBTyxhQUFBLEtBQVAsRUFBYyxjQUFBLE1BQWQsQ0FBQTtBQUFBLElBQ0EsU0FBQSxHQUFZLENBQUEsQ0FBRSxvQkFBRixDQUF1QixDQUFDLEtBQXhCLENBQUEsQ0FEWixDQUFBO0FBQUEsSUFHQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsbUJBQWhCLEVBQXFDLENBQXJDLENBSEEsQ0FBQTtBQUFBLElBSUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLG1CQUFoQixFQUFxQyxDQUFyQyxDQUpBLENBQUE7QUFBQSxJQUtBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix1QkFBaEIsRUFBeUMsS0FBekMsQ0FMQSxDQUFBO0FBQUEsSUFNQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isd0JBQWhCLEVBQTBDLE1BQTFDLENBTkEsQ0FBQTtXQU9BLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiwyQkFBaEIsRUFBNkMsU0FBN0MsRUFScUI7RUFBQSxDQTNCdkIsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/andytlr/.atom/packages/remember-window/lib/remember-window.coffee