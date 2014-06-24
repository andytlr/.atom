(function() {
  var $, MarkerView, Subscriber, View, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ref = require('atom'), View = _ref.View, $ = _ref.$;

  Subscriber = require('emissary').Subscriber;

  module.exports = MarkerView = (function() {
    Subscriber.includeInto(MarkerView);

    function MarkerView(_arg) {
      this.editorView = _arg.editorView, this.marker = _arg.marker;
      this.updateDisplay = __bind(this.updateDisplay, this);
      this.onMarkerChanged = __bind(this.onMarkerChanged, this);
      this.remove = __bind(this.remove, this);
      this.regions = [];
      this.editSession = this.editorView.editor;
      this.element = document.createElement('div');
      this.element.className = 'marker color-highlight';
      this.updateNeeded = this.marker.isValid();
      this.oldScreenRange = this.getScreenRange();
      this.subscribeToMarker();
      this.updateDisplay();
    }

    MarkerView.prototype.remove = function() {
      this.unsubscribe();
      this.marker = null;
      this.editorView = null;
      this.editSession = null;
      return this.element.remove();
    };

    MarkerView.prototype.show = function() {
      return this.element.style.display = "";
    };

    MarkerView.prototype.hide = function() {
      return this.element.style.display = "none";
    };

    MarkerView.prototype.subscribeToMarker = function() {
      this.subscribe(this.marker, 'changed', this.onMarkerChanged);
      this.subscribe(this.marker, 'destroyed', this.remove);
      return this.subscribe(this.editorView, 'editor:display-updated', this.updateDisplay);
    };

    MarkerView.prototype.onMarkerChanged = function(_arg) {
      var isValid;
      isValid = _arg.isValid;
      this.updateNeeded = isValid;
      if (isValid) {
        return this.show();
      } else {
        return this.hide();
      }
    };

    MarkerView.prototype.isUpdateNeeded = function() {
      var newScreenRange, oldScreenRange;
      if (!(this.updateNeeded && this.editSession === this.editorView.editor)) {
        return false;
      }
      oldScreenRange = this.oldScreenRange;
      newScreenRange = this.getScreenRange();
      this.oldScreenRange = newScreenRange;
      return this.intersectsRenderedScreenRows(oldScreenRange) || this.intersectsRenderedScreenRows(newScreenRange);
    };

    MarkerView.prototype.intersectsRenderedScreenRows = function(range) {
      return range.intersectsRowRange(this.editorView.firstRenderedScreenRow, this.editorView.lastRenderedScreenRow);
    };

    MarkerView.prototype.updateDisplay = function() {
      var range, rowSpan;
      if (!this.isUpdateNeeded()) {
        return;
      }
      this.updateNeeded = false;
      this.clearRegions();
      range = this.getScreenRange();
      if (range.isEmpty()) {
        return;
      }
      rowSpan = range.end.row - range.start.row;
      if (rowSpan === 0) {
        return this.appendRegion(1, range.start, range.end);
      } else {
        this.appendRegion(1, range.start, {
          row: range.start.row,
          column: Infinity
        });
        if (rowSpan > 1) {
          this.appendRegion(rowSpan - 1, {
            row: range.start.row + 1,
            column: 0
          }, {
            row: range.start.row + 1,
            column: Infinity
          });
        }
        return this.appendRegion(1, {
          row: range.end.row,
          column: 0
        }, range.end);
      }
    };

    MarkerView.prototype.appendRegion = function(rows, start, end) {
      var bufferRange, charWidth, color, colorText, css, lineHeight, name, region, text, value, _ref1;
      _ref1 = this.editorView, lineHeight = _ref1.lineHeight, charWidth = _ref1.charWidth;
      color = this.getColor();
      colorText = this.getColorTextColor();
      bufferRange = this.editSession.bufferRangeForScreenRange({
        start: start,
        end: end
      });
      text = this.editSession.getTextInRange(bufferRange);
      css = this.editorView.pixelPositionForScreenPosition(start);
      css.height = lineHeight * rows;
      if (end) {
        css.width = this.editorView.pixelPositionForScreenPosition(end).left - css.left;
      } else {
        css.right = 0;
      }
      region = document.createElement('div');
      region.className = 'region';
      region.textContent = text;
      for (name in css) {
        value = css[name];
        region.style[name] = value + 'px';
      }
      region.style.backgroundColor = color;
      region.style.color = colorText;
      this.element.appendChild(region);
      return this.regions.push(region);
    };

    MarkerView.prototype.clearRegions = function() {
      var region, _i, _len, _ref1;
      _ref1 = this.regions;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        region = _ref1[_i];
        region.remove();
      }
      return this.regions = [];
    };

    MarkerView.prototype.getColor = function() {
      return this.marker.bufferMarker.properties.cssColor;
    };

    MarkerView.prototype.getColorText = function() {
      return this.marker.bufferMarker.properties.color;
    };

    MarkerView.prototype.getColorTextColor = function() {
      return this.marker.bufferMarker.properties.textColor;
    };

    MarkerView.prototype.getScreenRange = function() {
      return this.marker.getScreenRange();
    };

    return MarkerView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFDQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQSxPQUFZLE9BQUEsQ0FBUSxNQUFSLENBQVosRUFBQyxZQUFBLElBQUQsRUFBTyxTQUFBLENBQVAsQ0FBQTs7QUFBQSxFQUNDLGFBQWMsT0FBQSxDQUFRLFVBQVIsRUFBZCxVQURELENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osSUFBQSxVQUFVLENBQUMsV0FBWCxDQUF1QixVQUF2QixDQUFBLENBQUE7O0FBRWEsSUFBQSxvQkFBQyxJQUFELEdBQUE7QUFDWCxNQURhLElBQUMsQ0FBQSxrQkFBQSxZQUFZLElBQUMsQ0FBQSxjQUFBLE1BQzNCLENBQUE7QUFBQSwyREFBQSxDQUFBO0FBQUEsK0RBQUEsQ0FBQTtBQUFBLDZDQUFBLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxPQUFELEdBQVcsRUFBWCxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsV0FBRCxHQUFlLElBQUMsQ0FBQSxVQUFVLENBQUMsTUFEM0IsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QixDQUZYLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBVCxHQUFxQix3QkFIckIsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFSLENBQUEsQ0FKaEIsQ0FBQTtBQUFBLE1BS0EsSUFBQyxDQUFBLGNBQUQsR0FBa0IsSUFBQyxDQUFBLGNBQUQsQ0FBQSxDQUxsQixDQUFBO0FBQUEsTUFPQSxJQUFDLENBQUEsaUJBQUQsQ0FBQSxDQVBBLENBQUE7QUFBQSxNQVFBLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FSQSxD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
//# sourceURL=/Users/andytlr/.atom/packages/atom-color-highlight/lib/marker-view.coffee