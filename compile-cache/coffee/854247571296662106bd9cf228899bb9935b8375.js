(function() {
  var AtomColorHighlightModel, CompositeDisposable, Emitter, _, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore-plus');

  _ref = require('event-kit'), CompositeDisposable = _ref.CompositeDisposable, Emitter = _ref.Emitter;

  module.exports = AtomColorHighlightModel = (function() {
    AtomColorHighlightModel.idCounter = 0;

    AtomColorHighlightModel.markerClass = 'color-highlight';

    AtomColorHighlightModel.bufferRange = [[0, 0], [Infinity, Infinity]];

    function AtomColorHighlightModel(editor) {
      this.editor = editor;
      this.update = __bind(this.update, this);
      this.buffer = this.editor.getBuffer();
      this.id = AtomColorHighlightModel.idCounter++;
      this.dirty = false;
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
    }

    AtomColorHighlightModel.prototype.onDidUpdateMarkers = function(callback) {
      return this.emitter.on('did-update-markers', callback);
    };

    AtomColorHighlightModel.prototype.onDidDestroy = function(callback) {
      return this.emitter.on('did-destroy', callback);
    };

    AtomColorHighlightModel.prototype.update = function() {
      if (this.frameRequested) {
        return;
      }
      this.frameRequested = true;
      return requestAnimationFrame((function(_this) {
        return function() {
          _this.frameRequested = false;
          return _this.updateMarkers();
        };
      })(this));
    };

    AtomColorHighlightModel.prototype.subscribeToBuffer = function() {
      this.subscriptions.add(this.editor.onDidChange((function(_this) {
        return function() {
          return _this.dirty = true;
        };
      })(this)));
      this.subscriptions.add(this.editor.onDidStopChanging(this.update));
      return this.subscriptions.add(this.editor.onDidDestroy((function(_this) {
        return function() {
          return _this.destroy();
        };
      })(this)));
    };

    AtomColorHighlightModel.prototype.unsubscribeFromBuffer = function() {
      this.subscriptions.dispose();
      return this.buffer = null;
    };

    AtomColorHighlightModel.prototype.init = function() {
      this.subscribeToBuffer();
      this.destroyAllMarkers();
      return this.update();
    };

    AtomColorHighlightModel.prototype.destroy = function() {
      this.destroyed = true;
      this.emitter.emit('did-destroy');
      if (this.buffer != null) {
        return this.unsubscribeFromBuffer();
      }
    };

    AtomColorHighlightModel.prototype.isDestroyed = function() {
      return this.destroyed;
    };

    AtomColorHighlightModel.prototype.eachColor = function(block) {
      if (this.buffer != null) {
        return this.constructor.Color.scanBufferForColors(this.buffer, block);
      }
    };

    AtomColorHighlightModel.prototype.updateMarkers = function() {
      var e, marker, markersToRemoveById, promise, updatedMarkers, _i, _len, _ref1;
      if (this.buffer == null) {
        return this.destroyAllMarkers();
      }
      if (this.updating) {
        return;
      }
      this.updating = true;
      updatedMarkers = [];
      markersToRemoveById = {};
      _ref1 = this.markers;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        marker = _ref1[_i];
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
              if (color.isInvalid) {
                continue;
              }
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
            _this.emitter.emit('did-update-markers', _.clone(_this.markers));
            return _this.dirty = false;
          };
        })(this)).fail(function(e) {
          this.dirty = false;
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
      var marker, _i, _len, _ref1, _ref2;
      _ref2 = (_ref1 = this.markers) != null ? _ref1 : [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        marker = _ref2[_i];
        marker.destroy();
      }
      this.markers = [];
      return this.emitter.emit('did-update-markers', _.clone(this.markers));
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
        invalidate: 'touch',
        persistent: false
      };
      return this.editor.markBufferRange(range, markerAttributes);
    };

    return AtomColorHighlightModel;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDhEQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBQUosQ0FBQTs7QUFBQSxFQUNBLE9BQWlDLE9BQUEsQ0FBUSxXQUFSLENBQWpDLEVBQUMsMkJBQUEsbUJBQUQsRUFBc0IsZUFBQSxPQUR0QixDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLElBQUEsdUJBQUMsQ0FBQSxTQUFELEdBQVksQ0FBWixDQUFBOztBQUFBLElBRUEsdUJBQUMsQ0FBQSxXQUFELEdBQWMsaUJBRmQsQ0FBQTs7QUFBQSxJQUdBLHVCQUFDLENBQUEsV0FBRCxHQUFjLENBQUMsQ0FBQyxDQUFELEVBQUcsQ0FBSCxDQUFELEVBQVEsQ0FBQyxRQUFELEVBQVUsUUFBVixDQUFSLENBSGQsQ0FBQTs7QUFLYSxJQUFBLGlDQUFFLE1BQUYsR0FBQTtBQUNYLE1BRFksSUFBQyxDQUFBLFNBQUEsTUFDYixDQUFBO0FBQUEsNkNBQUEsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUEsTUFBTSxDQUFDLFNBQVIsQ0FBQSxDQUFWLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxFQUFELEdBQU0sdUJBQXVCLENBQUMsU0FBeEIsRUFETixDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsS0FBRCxHQUFTLEtBRlQsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLE9BQUQsR0FBVyxHQUFBLENBQUEsT0FIWCxDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsYUFBRCxHQUFpQixHQUFBLENBQUEsbUJBSmpCLENBRFc7SUFBQSxDQUxiOztBQUFBLHNDQVlBLGtCQUFBLEdBQW9CLFNBQUMsUUFBRCxHQUFBO2FBQ2xCLElBQUMsQ0FBQSxPQUFP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
//# sourceURL=/Users/andytlr/.atom/packages/atom-color-highlight/lib/atom-color-highlight-model.coffee