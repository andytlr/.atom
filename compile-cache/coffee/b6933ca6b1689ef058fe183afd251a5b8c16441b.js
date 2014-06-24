(function() {
  var AsteroidsView;

  AsteroidsView = require('./asteroids-view');

  require('./asteroids-game');

  module.exports = {
    asteroidsView: null,
    activate: function(state) {
      this.asteroidsView = new AsteroidsView(state.asteroidsViewState);
      return startAsteroids();
    },
    deactivate: function() {
      return this.asteroidsView.destroy();
    },
    serialize: function() {
      return {
        asteroidsViewState: this.asteroidsView.serialize()
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGFBQUE7O0FBQUEsRUFBQSxhQUFBLEdBQWdCLE9BQUEsQ0FBUSxrQkFBUixDQUFoQixDQUFBOztBQUFBLEVBQ0EsT0FBQSxDQUFRLGtCQUFSLENBREEsQ0FBQTs7QUFBQSxFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLGFBQUEsRUFBZSxJQUFmO0FBQUEsSUFFQSxRQUFBLEVBQVUsU0FBQyxLQUFELEdBQUE7QUFDUixNQUFBLElBQUMsQ0FBQSxhQUFELEdBQXFCLElBQUEsYUFBQSxDQUFjLEtBQUssQ0FBQyxrQkFBcEIsQ0FBckIsQ0FBQTthQUNBLGNBQUEsQ0FBQSxFQUZRO0lBQUEsQ0FGVjtBQUFBLElBTUEsVUFBQSxFQUFZLFNBQUEsR0FBQTthQUNWLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBLEVBRFU7SUFBQSxDQU5aO0FBQUEsSUFTQSxTQUFBLEVBQVcsU0FBQSxHQUFBO2FBQ1Q7QUFBQSxRQUFBLGtCQUFBLEVBQW9CLElBQUMsQ0FBQSxhQUFhLENBQUMsU0FBZixDQUFBLENBQXBCO1FBRFM7SUFBQSxDQVRYO0dBSkYsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/andytlr/.atom/packages/asteroids/lib/asteroids.coffee