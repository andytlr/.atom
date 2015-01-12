(function() {
  var $, MarkerMixin, MarkerView, Subscriber, View, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ref = require('space-pen'), View = _ref.View, $ = _ref.$;

  Subscriber = require('emissary').Subscriber;

  MarkerMixin = require('./marker-mixin');

  module.exports = MarkerView = (function() {
    Subscriber.includeInto(MarkerView);

    MarkerMixin.includeInto(MarkerView);

    function MarkerView(_arg) {
      this.editorElement = _arg.editorElement, this.editor = _arg.editor, this.marker = _arg.marker;
      this.updateDisplay = __bind(this.updateDisplay, this);
      this.regions = [];
      this.element = document.createElement('div');
      this.element.className = 'marker color-highlight';
      this.updateNeeded = this.marker.isValid();
      this.oldScreenRange = this.getScreenRange();
      this.subscribeToMarker();
      this.updateDisplay();
    }

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
      if (this.hidden()) {
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

    MarkerView.prototype.appendRegion = function(rows, start, end) {
      var bufferRange, charWidth, color, colorText, css, lineHeight, name, region, text, value, _ref1;
      _ref1 = this.editorElement, lineHeight = _ref1.lineHeight, charWidth = _ref1.charWidth;
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

    return MarkerView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGtEQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQSxPQUFZLE9BQUEsQ0FBUSxXQUFSLENBQVosRUFBQyxZQUFBLElBQUQsRUFBTyxTQUFBLENBQVAsQ0FBQTs7QUFBQSxFQUNDLGFBQWMsT0FBQSxDQUFRLFVBQVIsRUFBZCxVQURELENBQUE7O0FBQUEsRUFFQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSLENBRmQsQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixJQUFBLFVBQVUsQ0FBQyxXQUFYLENBQXVCLFVBQXZCLENBQUEsQ0FBQTs7QUFBQSxJQUNBLFdBQVcsQ0FBQyxXQUFaLENBQXdCLFVBQXhCLENBREEsQ0FBQTs7QUFHYSxJQUFBLG9CQUFDLElBQUQsR0FBQTtBQUNYLE1BRGEsSUFBQyxDQUFBLHFCQUFBLGVBQWUsSUFBQyxDQUFBLGNBQUEsUUFBUSxJQUFDLENBQUEsY0FBQSxNQUN2QyxDQUFBO0FBQUEsMkRBQUEsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxFQUFYLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxPQUFELEdBQVcsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsS0FBdkIsQ0FEWCxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVQsR0FBcUIsd0JBRnJCLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxZQUFELEdBQWdCLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBUixDQUFBLENBSGhCLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxjQUFELEdBQWtCLElBQUMsQ0FBQSxjQUFELENBQUEsQ0FKbEIsQ0FBQTtBQUFBLE1BTUEsSUFBQyxDQUFBLGlCQUFELENBQUEsQ0FOQSxDQUFBO0FBQUEsTUFPQSxJQUFD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
//# sourceURL=/Users/andytlr/.atom/packages/atom-color-highlight/lib/marker-view.coffee