(function() {
  var CompositeDisposable, MarkerMixin, Mixin,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Mixin = require('mixto');

  CompositeDisposable = require('event-kit').CompositeDisposable;

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
      this.subscriptions.dispose();
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
      if (this.subscriptions == null) {
        this.subscriptions = new CompositeDisposable;
      }
      this.subscriptions.add(this.marker.onDidChange((function(_this) {
        return function(e) {
          return _this.onMarkerChanged(e);
        };
      })(this)));
      this.subscriptions.add(this.marker.onDidDestroy((function(_this) {
        return function(e) {
          return _this.remove(e);
        };
      })(this)));
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVDQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxLQUFBLEdBQVEsT0FBQSxDQUFRLE9BQVIsQ0FBUixDQUFBOztBQUFBLEVBQ0Msc0JBQXVCLE9BQUEsQ0FBUSxXQUFSLEVBQXZCLG1CQURELENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osa0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLDBCQUFBLFFBQUEsR0FBVSxTQUFDLEdBQUQsR0FBQTthQUFTLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQW5CLENBQXVCLEdBQXZCLEVBQVQ7SUFBQSxDQUFWLENBQUE7O0FBQUEsMEJBQ0EsV0FBQSxHQUFhLFNBQUMsR0FBRCxHQUFBO2FBQVMsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBbkIsQ0FBMEIsR0FBMUIsRUFBVDtJQUFBLENBRGIsQ0FBQTs7QUFBQSwwQkFHQSxNQUFBLEdBQVEsU0FBQSxHQUFBO0FBQ04sTUFBQSxJQUFDLENBQUEsV0FBRCxDQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUEsQ0FEQSxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsTUFBRCxHQUFVLElBRlYsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUhkLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFKVixDQUFBO2FBS0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULENBQUEsRUFOTTtJQUFBLENBSFIsQ0FBQTs7QUFBQSwwQkFXQSxJQUFBLEdBQU0sU0FBQSxHQUFBO0FBQ0osTUFBQSxJQUFBLENBQUEsSUFBb0MsQ0FBQSxNQUFELENBQUEsQ0FBbkM7ZUFBQSxJQUFDLENB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
//# sourceURL=/Users/andytlr/.atom/packages/atom-color-highlight/lib/marker-mixin.coffee