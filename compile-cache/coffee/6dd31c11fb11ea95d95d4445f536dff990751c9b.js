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
      this.editor = null;
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
      this.subscriptions.add(this.editor.onDidChange((function(_this) {
        return function(e) {
          return _this.updateDisplay(e);
        };
      })(this)));
      return this.subscriptions.add(this.editor.onDidChangeScrollTop((function(_this) {
        return function(e) {
          return _this.updateDisplay(e);
        };
      })(this)));
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
      if (!this.updateNeeded) {
        return false;
      }
      oldScreenRange = this.oldScreenRange;
      newScreenRange = this.getScreenRange();
      this.oldScreenRange = newScreenRange;
      return this.intersectsRenderedScreenRows(oldScreenRange) || this.intersectsRenderedScreenRows(newScreenRange);
    };

    MarkerMixin.prototype.intersectsRenderedScreenRows = function(range) {
      return range.intersectsRowRange(this.editor.getFirstVisibleScreenRow(), this.editor.getLastVisibleScreenRow());
    };

    MarkerMixin.prototype.hidden = function() {
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVDQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxLQUFBLEdBQVEsT0FBQSxDQUFRLE9BQVIsQ0FBUixDQUFBOztBQUFBLEVBQ0Msc0JBQXVCLE9BQUEsQ0FBUSxXQUFSLEVBQXZCLG1CQURELENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osa0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLDBCQUFBLFFBQUEsR0FBVSxTQUFDLEdBQUQsR0FBQTthQUFTLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQW5CLENBQXVCLEdBQXZCLEVBQVQ7SUFBQSxDQUFWLENBQUE7O0FBQUEsMEJBQ0EsV0FBQSxHQUFhLFNBQUMsR0FBRCxHQUFBO2FBQVMsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBbkIsQ0FBMEIsR0FBMUIsRUFBVDtJQUFBLENBRGIsQ0FBQTs7QUFBQSwwQkFHQSxNQUFBLEdBQVEsU0FBQSxHQUFBO0FBQ04sTUFBQSxJQUFDLENBQUEsV0FBRCxDQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUEsQ0FEQSxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsTUFBRCxHQUFVLElBRlYsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUhWLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFKVixDQUFBO2FBS0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULENBQUEsRUFOTTtJQUFBLENBSFIsQ0FBQTs7QUFBQSwwQkFXQSxJQUFBLEdBQU0sU0FBQSxHQUFBO0FBQ0osTUFBQSxJQUFBLENBQUEsSUFBb0MsQ0FBQSxNQUFELENBQUEsQ0FBbkM7ZUFBQSxJQUFDLENB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
//# sourceURL=/Users/andytlr/.atom/packages/atom-color-highlight/lib/marker-mixin.coffee