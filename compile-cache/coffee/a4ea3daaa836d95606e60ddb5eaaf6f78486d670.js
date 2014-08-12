(function() {
  var MarkerMixin, Mixin,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Mixin = require('mixto');

  module.exports = MarkerMixin = (function(_super) {
    __extends(MarkerMixin, _super);

    function MarkerMixin() {
      return MarkerMixin.__super__.constructor.apply(this, arguments);
    }

    MarkerMixin.prototype.addClass = function(cls) {
      return this.element.classList.add(cls);
    };

    MarkerMixin.prototype.removeClass = function(cls) {
      return this.element.classList.remove(cls);
    };

    MarkerMixin.prototype.remove = function() {
      this.unsubscribe();
      this.marker = null;
      this.editorView = null;
      this.editor = null;
      return this.element.remove();
    };

    MarkerMixin.prototype.show = function() {
      if (!this.hidden()) {
        return this.element.style.display = "";
      }
    };

    MarkerMixin.prototype.hide = function() {
      return this.element.style.display = "none";
    };

    MarkerMixin.prototype.subscribeToMarker = function() {
      this.subscribe(this.marker, 'changed', (function(_this) {
        return function(e) {
          return _this.onMarkerChanged(e);
        };
      })(this));
      this.subscribe(this.marker, 'destroyed', (function(_this) {
        return function(e) {
          return _this.remove(e);
        };
      })(this));
      return this.subscribe(this.editorView, 'editor:display-updated', (function(_this) {
        return function(e) {
          return _this.updateDisplay(e);
        };
      })(this));
    };

    MarkerMixin.prototype.onMarkerChanged = function(_arg) {
      var isValid;
      isValid = _arg.isValid;
      this.updateNeeded = isValid;
      if (isValid) {
        return this.show();
      } else {
        return this.hide();
      }
    };

    MarkerMixin.prototype.isUpdateNeeded = function() {
      var newScreenRange, oldScreenRange;
      if (!(this.updateNeeded && this.editor === this.editorView.editor)) {
        return false;
      }
      oldScreenRange = this.oldScreenRange;
      newScreenRange = this.getScreenRange();
      this.oldScreenRange = newScreenRange;
      return this.intersectsRenderedScreenRows(oldScreenRange) || this.intersectsRenderedScreenRows(newScreenRange);
    };

    MarkerMixin.prototype.intersectsRenderedScreenRows = function(range) {
      return range.intersectsRowRange(this.editorView.firstRenderedScreenRow, this.editorView.lastRenderedScreenRow);
    };

    MarkerMixin.prototype.hidden = function() {
      return this.hiddenDueToComment() || this.hiddenDueToString();
    };

    MarkerMixin.prototype.hiddenDueToComment = function() {
      var bufferRange, scope;
      bufferRange = this.getBufferRange();
      scope = this.editor.displayBuffer.scopesForBufferPosition(bufferRange.start).join(';');
      return atom.config.get('atom-color-highlight.hideMarkersInComments') && (scope.match(/comment/) != null);
    };

    MarkerMixin.prototype.hiddenDueToString = function() {
      var bufferRange, scope;
      bufferRange = this.getBufferRange();
      scope = this.editor.displayBuffer.scopesForBufferPosition(bufferRange.start).join(';');
      return atom.config.get('atom-color-highlight.hideMarkersInStrings') && (scope.match(/string/) != null);
    };

    MarkerMixin.prototype.getColor = function() {
      return this.marker.bufferMarker.properties.cssColor;
    };

    MarkerMixin.prototype.getColorText = function() {
      return this.marker.bufferMarker.properties.color;
    };

    MarkerMixin.prototype.getColorTextColor = function() {
      return this.marker.bufferMarker.properties.textColor;
    };

    MarkerMixin.prototype.getScreenRange = function() {
      return this.marker.getScreenRange();
    };

    MarkerMixin.prototype.getBufferRange = function() {
      return this.marker.getBufferRange();
    };

    return MarkerMixin;

  })(Mixin);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGtCQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxLQUFBLEdBQVEsT0FBQSxDQUFRLE9BQVIsQ0FBUixDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLGtDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSwwQkFBQSxRQUFBLEdBQVUsU0FBQyxHQUFELEdBQUE7YUFBUyxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFuQixDQUF1QixHQUF2QixFQUFUO0lBQUEsQ0FBVixDQUFBOztBQUFBLDBCQUNBLFdBQUEsR0FBYSxTQUFDLEdBQUQsR0FBQTthQUFTLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQW5CLENBQTBCLEdBQTFCLEVBQVQ7SUFBQSxDQURiLENBQUE7O0FBQUEsMEJBR0EsTUFBQSxHQUFRLFNBQUEsR0FBQTtBQUNOLE1BQUEsSUFBQyxDQUFBLFdBQUQsQ0FBQSxDQUFBLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFEVixDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsVUFBRCxHQUFjLElBRmQsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUhWLENBQUE7YUFJQSxJQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsQ0FBQSxFQUxNO0lBQUEsQ0FIUixDQUFBOztBQUFBLDBCQVVBLElBQUEsR0FBTSxTQUFBLEdBQUE7QUFDSixNQUFBLElBQUEsQ0FBQSxJQUFvQyxDQUFBLE1BQUQsQ0FBQSxDQUFuQztlQUFBLElBQUMsQ0FBQSxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQWYsR0FBeUIsR0FBekI7T0FESTtJQUFBLENBVk4sQ0FBQTs7QUFBQSwwQkFhQSxJQUFBLEdBQU0sU0FBQSxHQUFBO2FBQ0osSUFB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
//# sourceURL=/Users/andytlr/.atom/packages/atom-color-highlight/lib/marker-mixin.coffee