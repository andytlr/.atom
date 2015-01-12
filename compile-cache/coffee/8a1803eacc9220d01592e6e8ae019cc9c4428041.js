(function() {
  var CompositeDisposable, DotMarkerElement, MarkerMixin,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  CompositeDisposable = require('event-kit').CompositeDisposable;

  MarkerMixin = require('./marker-mixin');

  module.exports = DotMarkerElement = (function(_super) {
    __extends(DotMarkerElement, _super);

    function DotMarkerElement() {
      this.updateDisplay = __bind(this.updateDisplay, this);
      return DotMarkerElement.__super__.constructor.apply(this, arguments);
    }

    MarkerMixin.includeInto(DotMarkerElement);

    DotMarkerElement.prototype.createdCallback = function() {
      return this.subscriptions = new CompositeDisposable();
    };

    DotMarkerElement.prototype.init = function(_arg) {
      this.editorElement = _arg.editorElement, this.editor = _arg.editor, this.marker = _arg.marker, this.markersByRows = _arg.markersByRows;
      this.innerHTML = '<div class="selector"/>';
      this.updateNeeded = this.marker.isValid();
      this.oldScreenRange = this.getScreenRange();
      this.buffer = this.editor.getBuffer();
      this.clearPosition = true;
      this.subscribeToMarker();
      return this.updateDisplay();
    };

    DotMarkerElement.prototype.updateDisplay = function() {
      var color, colorText, left, line, lineLength, position, range, size, spacing, top, _base, _name, _ref;
      if (!this.isUpdateNeeded()) {
        return;
      }
      this.updateNeeded = false;
      range = this.getScreenRange();
      if (range.isEmpty()) {
        return;
      }
      if (this.isHidden()) {
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
      _ref = this.editor.pixelPositionForScreenPosition(position), top = _ref.top, left = _ref.left;
      this.style.top = top + 'px';
      this.style.width = size + 'px';
      this.style.height = size + 'px';
      this.style.left = (left + spacing + this.position * (size + spacing)) + 'px';
      this.style.backgroundColor = color;
      return this.style.color = colorText;
    };

    DotMarkerElement.prototype.getSize = function() {
      return atom.config.get('atom-color-highlight.dotMarkersSize');
    };

    DotMarkerElement.prototype.getSpacing = function() {
      return atom.config.get('atom-color-highlight.dotMarkersSpacing');
    };

    return DotMarkerElement;

  })(HTMLElement);

  module.exports = DotMarkerElement = document.registerElement('dot-color-marker', {
    prototype: DotMarkerElement.prototype
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGtEQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUMsc0JBQXVCLE9BQUEsQ0FBUSxXQUFSLEVBQXZCLG1CQUFELENBQUE7O0FBQUEsRUFDQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSLENBRGQsQ0FBQTs7QUFBQSxFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSix1Q0FBQSxDQUFBOzs7OztLQUFBOztBQUFBLElBQUEsV0FBVyxDQUFDLFdBQVosQ0FBd0IsZ0JBQXhCLENBQUEsQ0FBQTs7QUFBQSwrQkFFQSxlQUFBLEdBQWlCLFNBQUEsR0FBQTthQUNmLElBQUMsQ0FBQSxhQUFELEdBQXFCLElBQUEsbUJBQUEsQ0FBQSxFQUROO0lBQUEsQ0FGakIsQ0FBQTs7QUFBQSwrQkFLQSxJQUFBLEdBQU0sU0FBQyxJQUFELEdBQUE7QUFDSixNQURNLElBQUMsQ0FBQSxxQkFBQSxlQUFlLElBQUMsQ0FBQSxjQUFBLFFBQVEsSUFBQyxDQUFBLGNBQUEsUUFBUSxJQUFDLENBQUEscUJBQUEsYUFDekMsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLFNBQUQsR0FBYSx5QkFBYixDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsWUFBRCxHQUFnQixJQUFDLENBQUEsTUFBTSxDQUFDLE9BQVIsQ0FBQSxDQUZoQixDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsY0FBRCxHQUFrQixJQUFDLENBQUEsY0FBRCxDQUFBLENBSGxCLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUFSLENBQUEsQ0FKVixDQUFBO0FBQUEsTUFLQSxJQUFDLENBQUEsYUFBRCxHQUFpQixJQUxqQixDQUFBO0FBQUEsTUFPQSxJQUFDLENBQUEsaUJBQUQsQ0FBQSxDQVBBLENB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
//# sourceURL=/Users/andytlr/.atom/packages/atom-color-highlight/lib/dot-marker-element.coffee