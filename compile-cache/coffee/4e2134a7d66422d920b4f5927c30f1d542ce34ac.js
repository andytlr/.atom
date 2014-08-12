(function() {
  var $, DotMarkerView, MarkerMixin, Subscriber, View, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ref = require('atom'), View = _ref.View, $ = _ref.$;

  Subscriber = require('emissary').Subscriber;

  MarkerMixin = require('./marker-mixin');

  module.exports = DotMarkerView = (function() {
    Subscriber.includeInto(DotMarkerView);

    MarkerMixin.includeInto(DotMarkerView);

    function DotMarkerView(_arg) {
      this.editorView = _arg.editorView, this.marker = _arg.marker, this.markersByRows = _arg.markersByRows;
      this.updateDisplay = __bind(this.updateDisplay, this);
      this.editor = this.editorView.editor;
      this.element = document.createElement('div');
      this.element.innerHTML = '<div class="selector"/>';
      this.element.className = 'dot-marker color-highlight';
      this.updateNeeded = this.marker.isValid();
      this.oldScreenRange = this.getScreenRange();
      this.buffer = this.editor.buffer;
      this.subscribeToMarker();
      this.updateDisplay();
    }

    DotMarkerView.prototype.updateDisplay = function() {
      var color, colorText, left, lineLength, position, range, size, spacing, top, _base, _name, _ref1;
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
      size = atom.config.get('atom-color-highlight.dotMarkersSize');
      spacing = atom.config.get('atom-color-highlight.dotMarkersSpacing');
      if ((_base = this.markersByRows)[_name = range.start.row] == null) {
        _base[_name] = 0;
      }
      if (this.position == null) {
        this.position = this.markersByRows[range.start.row];
      }
      this.markersByRows[range.start.row]++;
      color = this.getColor();
      colorText = this.getColorTextColor();
      lineLength = this.editor.displayBuffer.getLines()[range.start.row].text.length;
      position = {
        row: range.start.row,
        column: lineLength
      };
      _ref1 = this.editorView.pixelPositionForScreenPosition(position), top = _ref1.top, left = _ref1.left;
      this.element.style.top = top + 'px';
      this.element.style.width = size + 'px';
      this.element.style.height = size + 'px';
      this.element.style.left = (left + spacing + this.position * (size + spacing)) + 'px';
      this.element.style.backgroundColor = color;
      return this.element.style.color = colorText;
    };

    return DotMarkerView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFEQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQSxPQUFZLE9BQUEsQ0FBUSxNQUFSLENBQVosRUFBQyxZQUFBLElBQUQsRUFBTyxTQUFBLENBQVAsQ0FBQTs7QUFBQSxFQUNDLGFBQWMsT0FBQSxDQUFRLFVBQVIsRUFBZCxVQURELENBQUE7O0FBQUEsRUFFQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSLENBRmQsQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixJQUFBLFVBQVUsQ0FBQyxXQUFYLENBQXVCLGFBQXZCLENBQUEsQ0FBQTs7QUFBQSxJQUNBLFdBQVcsQ0FBQyxXQUFaLENBQXdCLGFBQXhCLENBREEsQ0FBQTs7QUFHYSxJQUFBLHVCQUFDLElBQUQsR0FBQTtBQUNYLE1BRGEsSUFBQyxDQUFBLGtCQUFBLFlBQVksSUFBQyxDQUFBLGNBQUEsUUFBUSxJQUFDLENBQUEscUJBQUEsYUFDcEMsQ0FBQTtBQUFBLDJEQUFBLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBQyxDQUFBLFVBQVUsQ0FBQyxNQUF0QixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsT0FBRCxHQUFXLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCLENBRFgsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFULEdBQXFCLHlCQUZyQixDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVQsR0FBcUIsNEJBSHJCLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxZQUFELEdBQWdCLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBUixDQUFBLENBSmhCLENBQUE7QUFBQSxNQUtBLElBQUMsQ0FBQSxjQUFELEdBQWtCLElBQUMsQ0FBQSxj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
//# sourceURL=/Users/andytlr/.atom/packages/atom-color-highlight/lib/dot-marker-view.coffee