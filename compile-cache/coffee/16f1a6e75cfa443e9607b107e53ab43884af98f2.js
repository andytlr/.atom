(function() {
  var AsteroidsView, View,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom').View;

  module.exports = AsteroidsView = (function(_super) {
    __extends(AsteroidsView, _super);

    function AsteroidsView() {
      return AsteroidsView.__super__.constructor.apply(this, arguments);
    }

    AsteroidsView.content = function() {
      return this.div({
        "class": 'asteroids'
      });
    };

    AsteroidsView.prototype.initialize = function(serializeState) {
      return atom.workspaceView.command("asteroids:play", (function(_this) {
        return function() {
          return _this.play();
        };
      })(this));
    };

    AsteroidsView.prototype.serialize = function() {};

    AsteroidsView.prototype.destroy = function() {
      return this.detach();
    };

    AsteroidsView.prototype.play = function() {
      if (this.hasParent()) {
        return this.detach();
      } else {
        return atom.workspaceView.append(this);
      }
    };

    return AsteroidsView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1CQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxPQUFRLE9BQUEsQ0FBUSxNQUFSLEVBQVIsSUFBRCxDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLG9DQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLGFBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsT0FBQSxFQUFPLFdBQVA7T0FBTCxFQURRO0lBQUEsQ0FBVixDQUFBOztBQUFBLDRCQUdBLFVBQUEsR0FBWSxTQUFDLGNBQUQsR0FBQTthQUNWLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBbkIsQ0FBMkIsZ0JBQTNCLEVBQTZDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQUcsS0FBQyxDQUFBLElBQUQsQ0FBQSxFQUFIO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBN0MsRUFEVTtJQUFBLENBSFosQ0FBQTs7QUFBQSw0QkFPQSxTQUFBLEdBQVcsU0FBQSxHQUFBLENBUFgsQ0FBQTs7QUFBQSw0QkFVQSxPQUFBLEdBQVMsU0FBQSxHQUFBO2FBQ1AsSUFBQyxDQUFBLE1BQUQsQ0FBQSxFQURPO0lBQUEsQ0FWVCxDQUFBOztBQUFBLDRCQWFBLElBQUEsR0FBTSxTQUFBLEdBQUE7QUFDSixNQUFBLElBQUcsSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUFIO2VBQ0UsSUFBQyxDQUFBLE1BQUQsQ0FBQSxFQURGO09BQUEsTUFBQTtlQUdFLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBbkIsQ0FBMEIsSUFBMUIsRUFIRjtPQURJO0lBQUEsQ0FiTixDQUFBOzt5QkFBQTs7S0FEMEIsS0FINUIsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/andytlr/.atom/packages/asteroids/lib/asteroids-view.coffee