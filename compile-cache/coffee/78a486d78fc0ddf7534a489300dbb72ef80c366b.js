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
      return this.classList.add(cls);
    };

    MarkerMixin.prototype.removeClass = function(cls) {
      return this.classList.remove(cls);
    };

    MarkerMixin.prototype.remove = function() {
      var _ref;
      this.subscriptions.dispose();
      this.marker = null;
      this.editor = null;
      this.editor = null;
      return (_ref = this.parentNode) != null ? _ref.removeChild(this) : void 0;
    };

    MarkerMixin.prototype.show = function() {
      if (!this.isHidden()) {
        return this.style.display = "";
      }
    };

    MarkerMixin.prototype.hide = function() {
      return this.style.display = "none";
    };

    MarkerMixin.prototype.isVisible = function() {
      var newScreenRange, oldScreenRange;
      oldScreenRange = this.oldScreenRange;
      newScreenRange = this.getScreenRange();
      this.oldScreenRange = newScreenRange;
      return this.intersectsRenderedScreenRows(oldScreenRange) || this.intersectsRenderedScreenRows(newScreenRange);
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
          return _this.remove();
        };
      })(this)));
      return this.subscriptions.add(this.editor.onDidChangeScrollTop((function(_this) {
        return function(e) {
          return _this.updateDisplay();
        };
      })(this)));
    };

    MarkerMixin.prototype.onMarkerChanged = function(_arg) {
      var isValid;
      isValid = _arg.isValid;
      this.updateNeeded = isValid;
      this.updateDisplay();
      return this.updateVisibility();
    };

    MarkerMixin.prototype.updateVisibility = function() {
      if (this.isVisible()) {
        return this.show();
      } else {
        return this.hide();
      }
    };

    MarkerMixin.prototype.isUpdateNeeded = function() {
      if (!this.updateNeeded) {
        return false;
      }
      return this.isVisible();
    };

    MarkerMixin.prototype.intersectsRenderedScreenRows = function(range) {
      return range.intersectsRowRange(this.editor.getFirstVisibleScreenRow(), this.editor.getLastVisibleScreenRow());
    };

    MarkerMixin.prototype.isHidden = function() {
      return this.hiddenDueToComment() || this.hiddenDueToString();
    };

    MarkerMixin.prototype.getScope = function(bufferRange) {
      var descriptor;
      if (this.editor.displayBuffer.scopesForBufferPosition != null) {
        return this.editor.displayBuffer.scopesForBufferPosition(bufferRange.start).join(';');
      } else {
        descriptor = this.editor.displayBuffer.scopeDescriptorForBufferPosition(bufferRange.start);
        if (descriptor.join != null) {
          return descriptor.join(';');
        } else {
          return descriptor.scopes.join(';');
        }
      }
    };

    MarkerMixin.prototype.hiddenDueToComment = function() {
      var bufferRange, scope;
      bufferRange = this.getBufferRange();
      scope = this.getScope(bufferRange);
      return atom.config.get('atom-color-highlight.hideMarkersInComments') && (scope.match(/comment/) != null);
    };

    MarkerMixin.prototype.hiddenDueToString = function() {
      var bufferRange, scope;
      bufferRange = this.getBufferRange();
      scope = this.getScope(bufferRange);
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVDQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxLQUFBLEdBQVEsT0FBQSxDQUFRLE9BQVIsQ0FBUixDQUFBOztBQUFBLEVBQ0Msc0JBQXVCLE9BQUEsQ0FBUSxXQUFSLEVBQXZCLG1CQURELENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osa0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLDBCQUFBLFFBQUEsR0FBVSxTQUFDLEdBQUQsR0FBQTthQUFTLElBQUMsQ0FBQSxTQUFTLENBQUMsR0FBWCxDQUFlLEdBQWYsRUFBVDtJQUFBLENBQVYsQ0FBQTs7QUFBQSwwQkFDQSxXQUFBLEdBQWEsU0FBQyxHQUFELEdBQUE7YUFBUyxJQUFDLENBQUEsU0FBUyxDQUFDLE1BQVgsQ0FBa0IsR0FBbEIsRUFBVDtJQUFBLENBRGIsQ0FBQTs7QUFBQSwwQkFHQSxNQUFBLEdBQVEsU0FBQSxHQUFBO0FBQ04sVUFBQSxJQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBQSxDQUFBLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFEVixDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsTUFBRCxHQUFVLElBRlYsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUhWLENBQUE7b0RBS1csQ0FBRSxXQUFiLENBQXlCLElBQXpCLFdBTk07SUFBQSxDQUhSLENBQUE7O0FBQUEsMEJBV0EsSUFBQSxHQUFNLFNBQUEsR0FBQTtBQUNKLE1BQUEsSUFBQSxDQUFBLElBQTRCLENBQUEsUUFBRCxDQUFBLENBQTNCO2VBQUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxPQUFQLEdBQWlCLEdBQWpCO09BREk7SUFBQSxDQVhOLENBQUE7O0FBQUEs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
//# sourceURL=/Users/andytlr/.atom/packages/atom-color-highlight/lib/marker-mixin.coffee