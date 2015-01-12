(function() {
  var $, DotMarkerView, MarkerMixin, Subscriber, View, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ref = require('space-pen'), View = _ref.View, $ = _ref.$;

  Subscriber = require('emissary').Subscriber;

  MarkerMixin = require('./marker-mixin');

  module.exports = DotMarkerView = (function() {
    Subscriber.includeInto(DotMarkerView);

    MarkerMixin.includeInto(DotMarkerView);

    function DotMarkerView(_arg) {
      this.editorElement = _arg.editorElement, this.editor = _arg.editor, this.marker = _arg.marker, this.markersByRows = _arg.markersByRows;
      this.updateDisplay = __bind(this.updateDisplay, this);
      this.element = document.createElement('div');
      this.element.innerHTML = '<div class="selector"/>';
      this.element.className = 'dot-marker color-highlight';
      this.updateNeeded = this.marker.isValid();
      this.oldScreenRange = this.getScreenRange();
      this.buffer = this.editor.buffer;
      this.clearPosition = true;
      this.subscribeToMarker();
      this.updateDisplay();
    }

    DotMarkerView.prototype.updateDisplay = function() {
      var color, colorText, left, line, lineLength, position, range, size, spacing, top, _base, _name, _ref1;
      if (!this.isUpdateNeeded()) {
        return;
      }
      this.updateNeeded = false;
      range = this.getScreenRange();
      if (range.isEmpty()) {
        return;
      }
      if (this.hidden()) {
        this.hide();
      }
      size = this.getSize();
      spacing = this.getSpacing();
      if ((_base = this.markersByRows)[_name = range.start.row] == null) {
        _base[_name] = 0;
      }
      if (this.clearPosition) {
        this.position = this.markersByRows[range.start.row];
        this.clearPosition = false;
      }
      this.markersByRows[range.start.row]++;
      color = this.getColor();
      colorText = this.getColorTextColor();
      line = this.editor.lineTextForScreenRow(range.start.row);
      lineLength = line.length;
      position = {
        row: range.start.row,
        column: lineLength
      };
      _ref1 = this.editor.pixelPositionForScreenPosition(position), top = _ref1.top, left = _ref1.left;
      this.element.style.top = top + 'px';
      this.element.style.width = size + 'px';
      this.element.style.height = size + 'px';
      this.element.style.left = (left + spacing + this.position * (size + spacing)) + 'px';
      this.element.style.backgroundColor = color;
      return this.element.style.color = colorText;
    };

    DotMarkerView.prototype.getSize = function() {
      return atom.config.get('atom-color-highlight.dotMarkersSize');
    };

    DotMarkerView.prototype.getSpacing = function() {
      return atom.config.get('atom-color-highlight.dotMarkersSpacing');
    };

    return DotMarkerView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFEQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQSxPQUFZLE9BQUEsQ0FBUSxXQUFSLENBQVosRUFBQyxZQUFBLElBQUQsRUFBTyxTQUFBLENBQVAsQ0FBQTs7QUFBQSxFQUNDLGFBQWMsT0FBQSxDQUFRLFVBQVIsRUFBZCxVQURELENBQUE7O0FBQUEsRUFFQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSLENBRmQsQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixJQUFBLFVBQVUsQ0FBQyxXQUFYLENBQXVCLGFBQXZCLENBQUEsQ0FBQTs7QUFBQSxJQUNBLFdBQVcsQ0FBQyxXQUFaLENBQXdCLGFBQXhCLENBREEsQ0FBQTs7QUFHYSxJQUFBLHVCQUFDLElBQUQsR0FBQTtBQUNYLE1BRGEsSUFBQyxDQUFBLHFCQUFBLGVBQWUsSUFBQyxDQUFBLGNBQUEsUUFBUSxJQUFDLENBQUEsY0FBQSxRQUFRLElBQUMsQ0FBQSxxQkFBQSxhQUNoRCxDQUFBO0FBQUEsMkRBQUEsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QixDQUFYLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBVCxHQUFxQix5QkFEckIsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFULEdBQXFCLDRCQUZyQixDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsWUFBRCxHQUFnQixJQUFDLENBQUEsTUFBTSxDQUFDLE9BQVIsQ0FBQSxDQUhoQixDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsY0FBRCxHQUFrQixJQUFDLENBQUEsY0FBRCxDQUFBLENBSmxCLENBQUE7QUFBQSxNQUtBLElBQUMsQ0FBQSxN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
//# sourceURL=/Users/andytlr/.atom/packages/atom-color-highlight/lib/dot-marker-view.coffee