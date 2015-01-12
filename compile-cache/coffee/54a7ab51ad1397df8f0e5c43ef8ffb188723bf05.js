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
      var finder, module;
      this.editor = editor;
      this.buffer = buffer;
      this.update = __bind(this.update, this);
      finder = atom.packages.getLoadedPackage('project-palette-finder');
      this.subscriptions = new CompositeDisposable;
      if (finder != null) {
        module = require(finder.path);
        Color = module.constructor.Color;
        this.subscribe(module, 'palette:ready', this.update);
      }
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlGQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBQUosQ0FBQTs7QUFBQSxFQUNBLE9BQXdCLE9BQUEsQ0FBUSxVQUFSLENBQXhCLEVBQUMsZUFBQSxPQUFELEVBQVUsa0JBQUEsVUFEVixDQUFBOztBQUFBLEVBRUMsc0JBQXVCLE9BQUEsQ0FBUSxXQUFSLEVBQXZCLG1CQUZELENBQUE7O0FBQUEsRUFHQSxLQUFBLEdBQVEsT0FBQSxDQUFRLFVBQVIsQ0FIUixDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLElBQUEsT0FBTyxDQUFDLFdBQVIsQ0FBb0IsdUJBQXBCLENBQUEsQ0FBQTs7QUFBQSxJQUNBLFVBQVUsQ0FBQyxXQUFYLENBQXVCLHVCQUF2QixDQURBLENBQUE7O0FBQUEsSUFHQSx1QkFBQyxDQUFBLEtBQUQsR0FBUSxLQUhSLENBQUE7O0FBQUEsSUFLQSx1QkFBQyxDQUFBLFdBQUQsR0FBYyxpQkFMZCxDQUFBOztBQUFBLElBTUEsdUJBQUMsQ0FBQSxXQUFELEdBQWMsQ0FBQyxDQUFDLENBQUQsRUFBRyxDQUFILENBQUQsRUFBUSxDQUFDLFFBQUQsRUFBVSxRQUFWLENBQVIsQ0FOZCxDQUFBOztBQVFhLElBQUEsaUNBQUUsTUFBRixFQUFXLE1BQVgsR0FBQTtBQUNYLFVBQUEsY0FBQTtBQUFBLE1BRFksSUFBQyxDQUFBLFNBQUEsTUFDYixDQUFBO0FBQUEsTUFEcUIsSUFBQyxDQUFBLFNBQUEsTUFDdEIsQ0FBQTtBQUFBLDZDQUFBLENBQUE7QUFBQSxNQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFkLENBQStCLHdCQUEvQixDQUFULENBQUE7QUFBQSxNQUNBLElBQUMsQ0FB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
//# sourceURL=/Users/andytlr/.atom/packages/atom-color-highlight/lib/atom-color-highlight-model.coffee