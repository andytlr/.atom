(function() {
  var CompositeDisposable, MarkerElement, MarkerMixin,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  CompositeDisposable = require('event-kit').CompositeDisposable;

  MarkerMixin = require('./marker-mixin');

  module.exports = MarkerElement = (function(_super) {
    __extends(MarkerElement, _super);

    function MarkerElement() {
      this.updateDisplay = __bind(this.updateDisplay, this);
      return MarkerElement.__super__.constructor.apply(this, arguments);
    }

    MarkerMixin.includeInto(MarkerElement);

    MarkerElement.prototype.createdCallback = function() {
      return this.regions = [];
    };

    MarkerElement.prototype.init = function(_arg) {
      this.editorElement = _arg.editorElement, this.editor = _arg.editor, this.marker = _arg.marker;
      this.updateNeeded = this.marker.isValid();
      this.oldScreenRange = this.getScreenRange();
      this.subscribeToMarker();
      return this.updateDisplay();
    };

    MarkerElement.prototype.updateDisplay = function() {
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
      if (this.isHidden()) {
        this.hide();
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

    MarkerElement.prototype.appendRegion = function(rows, start, end) {
      var bufferRange, charWidth, color, colorText, css, lineHeight, name, region, text, value, _ref;
      _ref = this.editorElement, lineHeight = _ref.lineHeight, charWidth = _ref.charWidth;
      color = this.getColor();
      colorText = this.getColorTextColor();
      bufferRange = this.editor.bufferRangeForScreenRange({
        start: start,
        end: end
      });
      text = this.editor.getTextInRange(bufferRange);
      css = this.editor.pixelPositionForScreenPosition(start);
      css.height = lineHeight * rows;
      if (end) {
        css.width = this.editor.pixelPositionForScreenPosition(end).left - css.left;
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
      this.appendChild(region);
      return this.regions.push(region);
    };

    MarkerElement.prototype.clearRegions = function() {
      var region, _i, _len, _ref;
      _ref = this.regions;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        region = _ref[_i];
        region.remove();
      }
      return this.regions = [];
    };

    return MarkerElement;

  })(HTMLElement);

  module.exports = MarkerElement = document.registerElement('color-marker', {
    prototype: MarkerElement.prototype
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtDQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUMsc0JBQXVCLE9BQUEsQ0FBUSxXQUFSLEVBQXZCLG1CQUFELENBQUE7O0FBQUEsRUFDQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSLENBRGQsQ0FBQTs7QUFBQSxFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixvQ0FBQSxDQUFBOzs7OztLQUFBOztBQUFBLElBQUEsV0FBVyxDQUFDLFdBQVosQ0FBd0IsYUFBeEIsQ0FBQSxDQUFBOztBQUFBLDRCQUVBLGVBQUEsR0FBaUIsU0FBQSxHQUFBO2FBQ2YsSUFBQyxDQUFBLE9BQUQsR0FBVyxHQURJO0lBQUEsQ0FGakIsQ0FBQTs7QUFBQSw0QkFLQSxJQUFBLEdBQU0sU0FBQyxJQUFELEdBQUE7QUFDSixNQURNLElBQUMsQ0FBQSxxQkFBQSxlQUFlLElBQUMsQ0FBQSxjQUFBLFFBQVEsSUFBQyxDQUFBLGNBQUEsTUFDaEMsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFSLENBQUEsQ0FBaEIsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLGNBQUQsR0FBa0IsSUFBQyxDQUFBLGNBQUQsQ0FBQSxDQURsQixDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsaUJBQUQsQ0FBQSxDQUhBLENBQUE7YUFJQSxJQUFDLENBQUEsYUFBRCxDQUFBLEVBTEk7SUFBQSxDQUxOLENBQUE7O0FBQUEsNEJBWUEsYUFBQSxHQUFlLFNBQUEsR0FBQTtBQUNiLFVBQUEsY0FBQTtBQUFBLE1BQUEsSUFBQSxDQUFBLElBQWUsQ0FBQSxjQUFELENBQUEsQ0FBZDtBQUFBLGNBQUEsQ0FBQTtPQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsWUFBRCxHQUFnQixL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
//# sourceURL=/Users/andytlr/.atom/packages/atom-color-highlight/lib/marker-element.coffee