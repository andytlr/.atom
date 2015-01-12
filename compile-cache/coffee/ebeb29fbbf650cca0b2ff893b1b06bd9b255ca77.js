(function() {
  var AtomColorHighlightModel, Color, CompositeDisposable, Emitter, Subscriber, _, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore-plus');

  _ref = require('emissary'), Emitter = _ref.Emitter, Subscriber = _ref.Subscriber;

  CompositeDisposable = require('event-kit').CompositeDisposable;

  Color = require('pigments');

  module.exports = AtomColorHighlightModel = (function() {
    Emitter.includeInto(AtomColorHighlightModel);

    Subscriber.includeInto(AtomColorHighlightModel);

    AtomColorHighlightModel.Color = Color;

    AtomColorHighlightModel.markerClass = 'color-highlight';

    AtomColorHighlightModel.bufferRange = [[0, 0], [Infinity, Infinity]];

    function AtomColorHighlightModel(editor, buffer) {
      this.editor = editor;
      this.buffer = buffer;
      this.update = __bind(this.update, this);
      this.subscriptions = new CompositeDisposable;
      try {
        atom.packages.activatePackage('project-palette-finder').then((function(_this) {
          return function(pack) {
            var finder;
            finder = pack.mainModule;
            if (finder != null) {
              _this.constructor.Color = Color = finder.Color;
            }
            return _this.subscribe(finder, 'palette:ready', _this.update);
          };
        })(this));
      } catch (_error) {}
      this.constructor.Color = Color;
    }

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
      return this.subscriptions.add(this.buffer.onDidStopChanging(this.update));
    };

    AtomColorHighlightModel.prototype.unsubscribeFromBuffer = function() {
      this.subscriptions.dispose();
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
      this.unsubscribe();
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
      var marker, _i, _len, _ref1, _ref2;
      _ref2 = (_ref1 = this.markers) != null ? _ref1 : [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        marker = _ref2[_i];
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
        invalidate: 'touch',
        persistent: false
      };
      return this.editor.markBufferRange(range, markerAttributes);
    };

    return AtomColorHighlightModel;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlGQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBQUosQ0FBQTs7QUFBQSxFQUNBLE9BQXdCLE9BQUEsQ0FBUSxVQUFSLENBQXhCLEVBQUMsZUFBQSxPQUFELEVBQVUsa0JBQUEsVUFEVixDQUFBOztBQUFBLEVBRUMsc0JBQXVCLE9BQUEsQ0FBUSxXQUFSLEVBQXZCLG1CQUZELENBQUE7O0FBQUEsRUFHQSxLQUFBLEdBQVEsT0FBQSxDQUFRLFVBQVIsQ0FIUixDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLElBQUEsT0FBTyxDQUFDLFdBQVIsQ0FBb0IsdUJBQXBCLENBQUEsQ0FBQTs7QUFBQSxJQUNBLFVBQVUsQ0FBQyxXQUFYLENBQXVCLHVCQUF2QixDQURBLENBQUE7O0FBQUEsSUFHQSx1QkFBQyxDQUFBLEtBQUQsR0FBUSxLQUhSLENBQUE7O0FBQUEsSUFLQSx1QkFBQyxDQUFBLFdBQUQsR0FBYyxpQkFMZCxDQUFBOztBQUFBLElBTUEsdUJBQUMsQ0FBQSxXQUFELEdBQWMsQ0FBQyxDQUFDLENBQUQsRUFBRyxDQUFILENBQUQsRUFBUSxDQUFDLFFBQUQsRUFBVSxRQUFWLENBQVIsQ0FOZCxDQUFBOztBQVFhLElBQUEsaUNBQUUsTUFBRixFQUFXLE1BQVgsR0FBQTtBQUNYLE1BRFksSUFBQyxDQUFBLFNBQUEsTUFDYixDQUFBO0FBQUEsTUFEcUIsSUFBQyxDQUFBLFNBQUEsTUFDdEIsQ0FBQTtBQUFBLDZDQUFBLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxhQUFELEdBQWlCLEdBQUEsQ0FBQSxtQkFBakIsQ0FBQTtBQUNBO0FBQUksUUFBQSxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsd0JB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
//# sourceURL=/Users/andytlr/.atom/packages/atom-color-highlight/lib/atom-color-highlight-model.coffee