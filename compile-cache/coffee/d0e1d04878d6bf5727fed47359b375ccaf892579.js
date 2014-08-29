(function() {
  var Emitter, SearchModel, _;

  _ = require('underscore-plus');

  Emitter = require('emissary').Emitter;

  module.exports = SearchModel = (function() {
    Emitter.includeInto(SearchModel);

    SearchModel.resultClass = 'isearch-result';

    SearchModel.currentClass = 'isearch-current';

    function SearchModel(state) {
      var _ref, _ref1;
      if (state == null) {
        state = {};
      }
      this.editSession = null;
      this.startMarker = null;
      this.markers = [];
      this.currentMarker = null;
      this.currentDecoration = null;
      this.lastPosition = null;
      this.pattern = '';
      this.direction = 'forward';
      this.useRegex = (_ref = state.useRegex) != null ? _ref : false;
      this.caseSensitive = (_ref1 = state.caseSensitive) != null ? _ref1 : false;
      this.valid = false;
      this.history = state.history || [];
    }

    SearchModel.prototype.hasStarted = function() {
      return this.startMarker === !null;
    };

    SearchModel.prototype.activePaneItemChanged = function() {
      if (this.editSession) {
        this.editSession.getBuffer().off(".isearch");
        this.editSession = null;
        this.destroyResultMarkers();
      }
      return this.start;
    };

    SearchModel.prototype.start = function(pattern) {
      var markerAttributes, paneItem, range;
      if (pattern == null) {
        pattern = None;
      }
      this.cleanup();
      if (pattern) {
        this.pattern = pattern;
      }
      paneItem = atom.workspace.getActivePaneItem();
      if ((paneItem != null ? typeof paneItem.getBuffer === "function" ? paneItem.getBuffer() : void 0 : void 0) != null) {
        this.editSession = paneItem;
        this.editSession.getBuffer().on("contents-modified.isearch", (function(_this) {
          return function(args) {
            return _this.updateMarkers();
          };
        })(this));
        markerAttributes = {
          invalidate: 'inside',
          replicate: false,
          persistent: false,
          isCurrent: false
        };
        range = this.editSession.getSelectedBufferRange();
        this.startMarker = this.editSession.markBufferRange(range, markerAttributes);
        return this.updateMarkers();
      }
    };

    SearchModel.prototype.stopSearch = function(pattern) {
      var buffer, func;
      if (pattern && pattern !== this.pattern && this.editSession) {
        this.pattern = pattern;
        buffer = this.editSession.getBuffer();
        func = buffer[this.direction === 'forward' ? 'scan' : 'backwardsScan'];
        func.call(buffer, this.getRegex(), (function(_this) {
          return function(_arg) {
            var range, stop;
            range = _arg.range, stop = _arg.stop;
            _this.editSession.setSelectedBufferRange(range);
            return stop();
          };
        })(this));
      } else {
        this.moveCursorToCurrent();
      }
      return this.cleanup();
    };

    SearchModel.prototype.slurp = function() {
      var cursor, end, scanRange, start, text, _ref;
      cursor = this.editSession.getCursor();
      text = '';
      if (!this.pattern.length) {
        text = this.editSession.getSelectedText();
        if (!text.length) {
          start = cursor.getBufferPosition();
          end = cursor.getMoveNextWordBoundaryBufferPosition();
          if (end) {
            text = this.editSession.getTextInRange([start, end]);
          }
        }
      } else if (this.currentMarker) {
        _ref = this.currentMarker.getBufferRange(), start = _ref.start, end = _ref.end;
        scanRange = [end, this.editSession.getEofBufferPosition()];
        this.editSession.scanInBufferRange(cursor.wordRegExp(), scanRange, (function(_this) {
          return function(_arg) {
            var range, stop, _ref1;
            range = _arg.range, stop = _arg.stop;
            if (!((_ref1 = range.end) != null ? _ref1.isEqual(end) : void 0)) {
              text = _this.editSession.getTextInRange([start, range.end]);
              return stop();
            }
          };
        })(this));
      }
      if (text.length) {
        this.pattern = text;
        return this.updateMarkers();
      }
    };

    SearchModel.prototype.moveCursorToCurrent = function() {
      if (this.lastPosition) {
        return this.editSession.setSelectedBufferRange(this.lastPosition);
      }
    };

    SearchModel.prototype.cancelSearch = function() {
      var _ref;
      if (this.startMarker) {
        if ((_ref = this.editSession) != null) {
          _ref.getCursor().setBufferPosition(this.startMarker.getHeadBufferPosition());
        }
      }
      return this.cleanup();
    };

    SearchModel.prototype.cleanup = function() {
      if (!atom.config.get('isearch.keepOptionsAfterSearch')) {
        this.useRegex = false;
        this.caseSensitive = false;
        this.emit('updatedOptions');
      }
      if (this.startMarker) {
        this.startMarker.destroy();
      }
      this.startMarker = null;
      this.lastPosition = null;
      this.destroyResultMarkers();
      if (this.editSession) {
        this.editSession.getBuffer().off(".isearch");
        this.editSession = null;
      }
      if (this.pattern && this.history[this.history.length - 1] !== this.pattern) {
        this.history.push(this.pattern);
      }
      return this.pattern = '';
    };

    SearchModel.prototype.updateMarkers = function() {
      var bufferRange, id, marker, markersToRemoveById, updatedMarkers, _i, _len, _ref;
      if ((this.editSession == null) || !this.pattern) {
        this.destroyResultMarkers();
        return;
      }
      this.valid = true;
      bufferRange = [[0, 0], [Infinity, Infinity]];
      updatedMarkers = [];
      markersToRemoveById = {};
      _ref = this.markers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        marker = _ref[_i];
        markersToRemoveById[marker.id] = marker;
      }
      this.editSession.scanInBufferRange(this.getRegex(), bufferRange, (function(_this) {
        return function(_arg) {
          var range;
          range = _arg.range;
          if (marker = _this.findMarker(range)) {
            delete markersToRemoveById[marker.id];
          } else {
            marker = _this.createMarker(range);
          }
          return updatedMarkers.push(marker);
        };
      })(this));
      for (id in markersToRemoveById) {
        marker = markersToRemoveById[id];
        marker.destroy();
      }
      this.markers = updatedMarkers;
      return this.moveToClosestResult();
    };

    SearchModel.prototype.findNext = function() {
      return this.moveToClosestResult(true);
    };

    SearchModel.prototype.moveToClosestResult = function(force) {
      var _ref;
      this.currentMarker = (this.direction === 'forward') && this.findMarkerForward(force) || this.findMarkerBackward(force);
      if ((_ref = this.currentDecoration) != null) {
        _ref.destroy();
      }
      this.currentDecoration = null;
      if (this.currentMarker) {
        this.editSession.scrollToScreenRange(this.currentMarker.getScreenRange());
        this.currentDecoration = this.editSession.decorateMarker(this.currentMarker, {
          type: 'highlight',
          "class": this.constructor.currentClass
        });
        return this.lastPosition = this.currentMarker.getBufferRange();
      }
    };

    SearchModel.prototype.findMarkerForward = function(force) {
      var comp, marker, markerStartPosition, range, start, _i, _len, _ref, _ref1;
      if (!this.markers.length) {
        return null;
      }
      range = this.lastPosition || ((_ref = this.startMarker) != null ? _ref.getScreenRange() : void 0) || this.editSession.getSelection().getBufferRange();
      start = range.start;
      _ref1 = this.markers;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        marker = _ref1[_i];
        markerStartPosition = marker.bufferMarker.getStartPosition();
        comp = markerStartPosition.compare(start);
        if (comp > 0 || (comp === 0 && !force)) {
          return marker;
        }
      }
      return this.markers[0];
    };

    SearchModel.prototype.findMarkerBackward = function(force) {
      var comp, marker, markerStartPosition, prev, range, start, _i, _len, _ref, _ref1;
      if (!this.markers.length) {
        return null;
      }
      range = this.lastPosition || ((_ref = this.startMarker) != null ? _ref.getScreenRange() : void 0) || this.editSession.getSelection().getBufferRange();
      start = range.start;
      prev = null;
      _ref1 = this.markers;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        marker = _ref1[_i];
        markerStartPosition = marker.bufferMarker.getStartPosition();
        comp = markerStartPosition.compare(start);
        if (comp === 0 && !force) {
          return marker;
        }
        if (comp < 0) {
          prev = marker;
        } else {
          break;
        }
      }
      return prev || this.markers[this.markers.length - 1];
    };

    SearchModel.prototype.destroyResultMarkers = function() {
      var marker, _i, _len, _ref, _ref1;
      this.valid = false;
      _ref1 = (_ref = this.markers) != null ? _ref : [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        marker = _ref1[_i];
        marker.destroy();
      }
      this.markers = [];
      this.currentMarker = null;
      return this.currentDecoration = null;
    };

    SearchModel.prototype.update = function(newParams) {
      var currentParams;
      if (newParams == null) {
        newParams = {};
      }
      currentParams = {
        pattern: this.pattern,
        direction: this.direction,
        useRegex: this.useRegex,
        caseSensitive: this.caseSensitive
      };
      _.defaults(newParams, currentParams);
      if (!(this.valid && _.isEqual(newParams, currentParams))) {
        _.extend(this, newParams);
        return this.updateMarkers();
      }
    };

    SearchModel.prototype.getRegex = function() {
      var flags;
      flags = 'g';
      if (!this.caseSensitive) {
        flags += 'i';
      }
      if (this.useRegex) {
        return new RegExp(this.pattern, flags);
      } else {
        return new RegExp(_.escapeRegExp(this.pattern), flags);
      }
    };

    SearchModel.prototype.createMarker = function(range) {
      var decoration, marker, markerAttributes;
      markerAttributes = {
        "class": this.constructor.resultClass,
        invalidate: 'inside',
        replicate: false,
        persistent: false,
        isCurrent: false
      };
      marker = this.editSession.markBufferRange(range, markerAttributes);
      decoration = this.editSession.decorateMarker(marker, {
        type: 'highlight',
        "class": this.constructor.resultClass
      });
      return marker;
    };

    SearchModel.prototype.findMarker = function(range) {
      var attributes;
      attributes = {
        "class": this.constructor.resultClass,
        startPosition: range.start,
        endPosition: range.end
      };
      return _.find(this.editSession.findMarkers(attributes), function(marker) {
        return marker.isValid();
      });
    };

    return SearchModel;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBT0E7QUFBQSxNQUFBLHVCQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQyxVQUFXLE9BQUEsQ0FBUSxVQUFSLEVBQVgsT0FERCxDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLElBQUEsT0FBTyxDQUFDLFdBQVIsQ0FBb0IsV0FBcEIsQ0FBQSxDQUFBOztBQUFBLElBRUEsV0FBQyxDQUFBLFdBQUQsR0FBYyxnQkFGZCxDQUFBOztBQUFBLElBR0EsV0FBQyxDQUFBLFlBQUQsR0FBZSxpQkFIZixDQUFBOztBQUthLElBQUEscUJBQUMsS0FBRCxHQUFBO0FBRVgsVUFBQSxXQUFBOztRQUZZLFFBQU07T0FFbEI7QUFBQSxNQUFBLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBZixDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsV0FBRCxHQUFlLElBSGYsQ0FBQTtBQUFBLE1BVUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxFQVZYLENBQUE7QUFBQSxNQWFBLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBYmpCLENBQUE7QUFBQSxNQWlCQSxJQUFDLENBQUEsaUJBQUQsR0FBcUIsSUFqQnJCLENBQUE7QUFBQSxNQXdCQSxJQUFDLENBQUEsWUFBRCxHQUFnQixJQXhCaEIsQ0FBQTtBQUFBLE1BNkJBLElBQUMsQ0FBQSxPQUFELEdBQVcsRUE3QlgsQ0FBQTtBQUFBLE1BOEJBLElBQUMsQ0FBQSxTQUFELEdBQWEsU0E5QmIsQ0FBQTtBQUFBLE1BK0JBLElBQUMsQ0FBQSxRQUFELDRDQUE2QixLQS9CN0IsQ0FBQTtBQUFBLE1BZ0NBLElBQUMsQ0FBQSxhQUFELG1EQUF1QyxLQWhDdkMsQ0FBQTtBQUFBLE1BaUNBLElBQUMsQ0FBQSxLQUFELEdBQVMs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
//# sourceURL=/Users/andytlr/.atom/packages/incremental-search/lib/search-model.coffee