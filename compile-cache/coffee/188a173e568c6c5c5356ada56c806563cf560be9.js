(function() {
  var AtomColorHighlightModel, Color, Emitter, OnigRegExp, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore-plus');

  Emitter = require('emissary').Emitter;

  OnigRegExp = require('oniguruma').OnigRegExp;

  Color = require('pigments');

  module.exports = AtomColorHighlightModel = (function() {
    Emitter.includeInto(AtomColorHighlightModel);

    AtomColorHighlightModel.Color = Color;

    AtomColorHighlightModel.markerClass = 'color-highlight';

    AtomColorHighlightModel.bufferRange = [[0, 0], [Infinity, Infinity]];

    function AtomColorHighlightModel(editor, buffer) {
      var finder;
      this.editor = editor;
      this.buffer = buffer;
      this.update = __bind(this.update, this);
      finder = atom.packages.getLoadedPackage('project-palette-finder');
      if (finder != null) {
        Color = require(finder.path).constructor.Color;
      }
      this.constructor.Color = Color;
    }

    AtomColorHighlightModel.prototype.update = function() {
      if (this.frameRequested) {
        return;
      }
      this.frameRequested = true;
      return webkitRequestAnimationFrame((function(_this) {
        return function() {
          _this.frameRequested = false;
          return _this.updateMarkers();
        };
      })(this));
    };

    AtomColorHighlightModel.prototype.subscribeToBuffer = function() {
      return this.buffer.on('contents-modified', this.update);
    };

    AtomColorHighlightModel.prototype.unsubscribeFromBuffer = function() {
      this.buffer.off('contents-modified', this.update);
      return this.buffer = null;
    };

    AtomColorHighlightModel.prototype.init = function() {
      if (this.buffer != null) {
        this.subscribeToBuffer();
        this.destroyAllMarkers();
        return this.update();
      }
    };

    AtomColorHighlightModel.prototype.dispose = function() {
      if (this.buffer != null) {
        return this.unsubscribeFromBuffer();
      }
    };

    AtomColorHighlightModel.prototype.eachColor = function(block) {
      if (this.buffer != null) {
        return Color.scanBufferForColors(this.buffer, block);
      }
    };

    AtomColorHighlightModel.prototype.updateMarkers = function() {
      var e, marker, markersToRemoveById, promise, updatedMarkers, _i, _len, _ref;
      if (this.buffer == null) {
        return this.destroyAllMarkers();
      }
      if (this.updating) {
        return;
      }
      this.updating = true;
      updatedMarkers = [];
      markersToRemoveById = {};
      _ref = this.markers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        marker = _ref[_i];
        markersToRemoveById[marker.id] = marker;
      }
      try {
        promise = this.eachColor();
        return promise.then((function(_this) {
          return function(results) {
            var color, id, match, range, res, _j, _len1;
            _this.updating = false;
            if (results == null) {
              results = [];
            }
            for (_j = 0, _len1 = results.length; _j < _len1; _j++) {
              res = results[_j];
              range = res.bufferRange, match = res.match, color = res.color;
              if (marker = _this.findMarker(match, range)) {
                if (marker.bufferMarker.properties.cssColor !== color.toCSS()) {
                  marker = _this.createMarker(match, color, range);
                } else {
                  delete markersToRemoveById[marker.id];
                }
              } else {
                marker = _this.createMarker(match, color, range);
              }
              updatedMarkers.push(marker);
            }
            for (id in markersToRemoveById) {
              marker = markersToRemoveById[id];
              marker.destroy();
            }
            _this.markers = updatedMarkers;
            return _this.emit('updated', _.clone(_this.markers));
          };
        })(this)).fail(function(e) {
          return console.log(e);
        });
      } catch (_error) {
        e = _error;
        this.destroyAllMarkers();
        throw e;
      }
    };

    AtomColorHighlightModel.prototype.findMarker = function(color, range) {
      var attributes;
      attributes = {
        type: this.constructor.markerClass,
        color: color,
        startPosition: range.start,
        endPosition: range.end
      };
      return _.find(this.editor.findMarkers(attributes), function(marker) {
        return marker.isValid();
      });
    };

    AtomColorHighlightModel.prototype.destroyAllMarkers = function() {
      var marker, _i, _len, _ref, _ref1;
      _ref1 = (_ref = this.markers) != null ? _ref : [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        marker = _ref1[_i];
        marker.destroy();
      }
      this.markers = [];
      return this.emit('updated', _.clone(this.markers));
    };

    AtomColorHighlightModel.prototype.createMarker = function(color, colorObject, range) {
      var l, markerAttributes, textColor;
      l = colorObject.luma();
      textColor = l > 0.43 ? 'black' : 'white';
      markerAttributes = {
        type: this.constructor.markerClass,
        color: color,
        cssColor: colorObject.toCSS(),
        textColor: textColor,
        invalidation: 'touch',
        persistent: false
      };
      return this.editor.markBufferRange(range, markerAttributes);
    };

    return AtomColorHighlightModel;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHNEQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBQUosQ0FBQTs7QUFBQSxFQUNDLFVBQVcsT0FBQSxDQUFRLFVBQVIsRUFBWCxPQURELENBQUE7O0FBQUEsRUFFQyxhQUFjLE9BQUEsQ0FBUSxXQUFSLEVBQWQsVUFGRCxDQUFBOztBQUFBLEVBR0EsS0FBQSxHQUFRLE9BQUEsQ0FBUSxVQUFSLENBSFIsQ0FBQTs7QUFBQSxFQUtBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixJQUFBLE9BQU8sQ0FBQyxXQUFSLENBQW9CLHVCQUFwQixDQUFBLENBQUE7O0FBQUEsSUFFQSx1QkFBQyxDQUFBLEtBQUQsR0FBUSxLQUZSLENBQUE7O0FBQUEsSUFJQSx1QkFBQyxDQUFBLFdBQUQsR0FBYyxpQkFKZCxDQUFBOztBQUFBLElBS0EsdUJBQUMsQ0FBQSxXQUFELEdBQWMsQ0FBQyxDQUFDLENBQUQsRUFBRyxDQUFILENBQUQsRUFBUSxDQUFDLFFBQUQsRUFBVSxRQUFWLENBQVIsQ0FMZCxDQUFBOztBQU9hLElBQUEsaUNBQUUsTUFBRixFQUFXLE1BQVgsR0FBQTtBQUNYLFVBQUEsTUFBQTtBQUFBLE1BRFksSUFBQyxDQUFBLFNBQUEsTUFDYixDQUFBO0FBQUEsTUFEcUIsSUFBQyxDQUFBLFNBQUEsTUFDdEIsQ0FBQTtBQUFBLDZDQUFBLENBQUE7QUFBQSxNQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFkLENBQStCLHdCQUEvQixDQUFULENBQUE7QUFDQSxNQUFBLElBQWtELGNBQWxEO0FBQUEsUUFBQSxLQUFBLEdBQVEsT0FBQSxDQUFRLE1BQU0sQ0FBQyxJQUFmLENBQW9CLENBQUMsV0FBVyxDQUFDLEtBQXpDLENBQUE7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
//# sourceURL=/Users/andytlr/.atom/packages/atom-color-highlight/lib/atom-color-highlight-model.coffee