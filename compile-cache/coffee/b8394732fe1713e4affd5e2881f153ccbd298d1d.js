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
      return this.subscriptions.add(this.editor.onDidChange((function(_this) {
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