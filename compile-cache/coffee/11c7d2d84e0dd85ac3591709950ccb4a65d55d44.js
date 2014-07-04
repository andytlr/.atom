(function() {
  var $, buildConfig, fs, getConfig, path, saveWindowDimensions, season, setConfig, setWindowDimensions, storeOutsideMainConfig;

  $ = require('atom').$;

  fs = require('fs-plus');

  path = require('path');

  season = require('season');

  module.exports = {
    configDefaults: {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      treeWidth: 0,
      storeOutsideMainConfig: false
    },
    activate: function(state) {
      setWindowDimensions();
      return $(window).on('resize beforeunload', function() {
        return saveWindowDimensions();
      });
    }
  };

  buildConfig = function(x, y, width, height, treeWidth) {
    if (x == null) {
      x = 0;
    }
    if (y == null) {
      y = 0;
    }
    if (width == null) {
      width = 0;
    }
    if (height == null) {
      height = 0;
    }
    if (treeWidth == null) {
      treeWidth = 0;
    }
    return {
      x: x,
      y: y,
      width: width,
      height: height,
      treeWidth: treeWidth
    };
  };

  storeOutsideMainConfig = function() {
    return atom.config.get('remember-window.storeOutsideMainConfig');
  };

  getConfig = function() {
    var configPath;
    if (storeOutsideMainConfig()) {
      configPath = path.join(atom.getConfigDirPath(), 'remember-window.cson');
      if (fs.existsSync(configPath)) {
        return season.readFileSync(configPath);
      } else {
        return buildConfig();
      }
    } else {
      return atom.config.get('remember-window');
    }
  };

  setConfig = function(config) {
    if (storeOutsideMainConfig()) {
      return season.writeFileSync(path.join(atom.getConfigDirPath(), 'remember-window.cson'), config);
    } else {
      return atom.config.set('remember-window', config);
    }
  };

  setWindowDimensions = function() {
    var height, treeWidth, width, x, y, _ref;
    _ref = getConfig(), x = _ref.x, y = _ref.y, width = _ref.width, height = _ref.height, treeWidth = _ref.treeWidth;
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
    var config, height, treeWidth, width, x, y, _ref;
    _ref = atom.getWindowDimensions(), x = _ref.x, y = _ref.y, width = _ref.width, height = _ref.height;
    treeWidth = $('.tree-view-resizer').width();
    config = buildConfig(x, y, width, height, treeWidth);
    return setConfig(config);
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHlIQUFBOztBQUFBLEVBQUMsSUFBSyxPQUFBLENBQVEsTUFBUixFQUFMLENBQUQsQ0FBQTs7QUFBQSxFQUNBLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUixDQURMLENBQUE7O0FBQUEsRUFFQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FGUCxDQUFBOztBQUFBLEVBR0EsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSLENBSFQsQ0FBQTs7QUFBQSxFQUtBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLGNBQUEsRUFDRTtBQUFBLE1BQUEsQ0FBQSxFQUFHLENBQUg7QUFBQSxNQUNBLENBQUEsRUFBRyxDQURIO0FBQUEsTUFFQSxLQUFBLEVBQU8sQ0FGUDtBQUFBLE1BR0EsTUFBQSxFQUFRLENBSFI7QUFBQSxNQUlBLFNBQUEsRUFBVyxDQUpYO0FBQUEsTUFLQSxzQkFBQSxFQUF3QixLQUx4QjtLQURGO0FBQUEsSUFRQSxRQUFBLEVBQVUsU0FBQyxLQUFELEdBQUE7QUFDUixNQUFBLG1CQUFBLENBQUEsQ0FBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLEVBQVYsQ0FBYSxxQkFBYixFQUFvQyxTQUFBLEdBQUE7ZUFBRyxvQkFBQSxDQUFBLEVBQUg7TUFBQSxDQUFwQyxFQUZRO0lBQUEsQ0FSVjtHQU5GLENBQUE7O0FBQUEsRUFrQkEsV0FBQSxHQUFjLFNBQUMsQ0FBRCxFQUFNLENBQU4sRUFBVyxLQUFYLEVBQW9CLE1BQXBCLEVBQThCLFNBQTlCLEdBQUE7O01BQUMsSUFBRTtLQUNmOztNQURrQixJQUFFO0tBQ3BCOztNQUR1QixRQUFNO0tBQzdCOztNQURnQyxTQUFPO0tBQ3ZDOztNQUQwQyxZQUFVO0tBQ3BEO1dBQUE7QUFBQSxNQUNFLENBQUEsRUFB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
//# sourceURL=/Users/andytlr/.atom/packages/remember-window/lib/remember-window.coffee