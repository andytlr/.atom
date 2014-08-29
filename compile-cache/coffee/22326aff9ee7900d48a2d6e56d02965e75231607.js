(function() {
  var $, InputView, Subscriber;

  $ = require('atom').$;

  Subscriber = require('emissary').Subscriber;

  InputView = require('./input-view');

  module.exports = {
    configDefaults: {
      keepOptionsAfterSearch: true
    },
    inputView: null,
    activate: function(state) {
      this.subscriber = new Subscriber();
      this.subscriber.subscribeToCommand(atom.workspaceView, 'incremental-search:forward', (function(_this) {
        return function() {
          return _this.findPressed('forward');
        };
      })(this));
      this.subscriber.subscribeToCommand(atom.workspaceView, 'incremental-search:backward', (function(_this) {
        return function() {
          return _this.findPressed('backward');
        };
      })(this));
      return this.subscriber.subscribeToCommand(atom.workspaceView, 'core:cancel core:close', (function(_this) {
        return function(_arg) {
          var editor, target, _ref, _ref1;
          target = _arg.target;
          if (target !== ((_ref = atom.workspaceView.getActivePaneView()) != null ? _ref[0] : void 0)) {
            editor = $(target).parents('.editor:not(.mini)');
            if (!editor.length) {
              return;
            }
          }
          return (_ref1 = _this.inputView) != null ? _ref1.detach() : void 0;
        };
      })(this));
    },
    deactivate: function() {
      if (this.inputView) {
        this.inputView.destroy();
        return this.inputView = null;
      }
    },
    findPressed: function(direction) {
      if (!this.inputView) {
        this.inputView = new InputView();
      }
      return this.inputView.trigger(direction);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHdCQUFBOztBQUFBLEVBQUMsSUFBSyxPQUFBLENBQVEsTUFBUixFQUFMLENBQUQsQ0FBQTs7QUFBQSxFQUNDLGFBQWMsT0FBQSxDQUFRLFVBQVIsRUFBZCxVQURELENBQUE7O0FBQUEsRUFHQSxTQUFBLEdBQVksT0FBQSxDQUFRLGNBQVIsQ0FIWixDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsY0FBQSxFQUNFO0FBQUEsTUFBQSxzQkFBQSxFQUF3QixJQUF4QjtLQURGO0FBQUEsSUFHQSxTQUFBLEVBQVcsSUFIWDtBQUFBLElBS0EsUUFBQSxFQUFVLFNBQUMsS0FBRCxHQUFBO0FBQ1IsTUFBQSxJQUFDLENBQUEsVUFBRCxHQUFrQixJQUFBLFVBQUEsQ0FBQSxDQUFsQixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsVUFBVSxDQUFDLGtCQUFaLENBQStCLElBQUksQ0FBQyxhQUFwQyxFQUFtRCw0QkFBbkQsRUFBaUYsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFBRyxLQUFDLENBQUEsV0FBRCxDQUFhLFNBQWIsRUFBSDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpGLENBREEsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxrQkFBWixDQUErQixJQUFJLENBQUMsYUFBcEMsRUFBbUQsNkJBQW5ELEVBQWtGLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQUcsS0FBQyxDQUFBLFdBQUQsQ0FBYSxVQUFiLEVBQUg7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsRixDQUZBLENBQUE7YUFJQSxJQUFDLENBQUEsVUFBVSxDQUFDLGtCQUFaLENBQStCLElBQUksQ0FBQyxhQUFwQyxFQUFtRCx3QkFBbkQsRUFBNkUsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsSUFBRCxHQUFBO0FBQzNFLGNBQUEsMkJBQUE7QUFBQSxVQUQ2RSxTQUFELEtBQUMsTUFDN0UsQ0FBQTtBQUFBLFVBQUEsSUFBRyxNQUFBLG9FQUFvRCxDQUFBLENBQUEsV0FBdkQ7QUFDRSxZQUFBLE1BQUEsR0FBUyxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsT0FBVixDQUFrQixvQkFBbEIsQ0FBVCxDQUFBO0FBQ0EsWUFBQSxJQUFBLENBQUEsTUFBb0IsQ0FBQyxNQUFyQjtBQUFBLG9CQUFBLENBQUE7YUFGRjtXQUFBOzBEQUlVLENBQUUsTUFBWixDQUFBLFdBTDJFO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBN0UsRUFMUTtJQUFBLENBTFY7QUFBQSxJQWlCQSxVQUFBLEVBQVksU0FBQSxHQUFBO0FBQ1YsTUFBQSxJQUFHLElBQUMsQ0FBQSxTQUFKO0FBQ0UsUUFBQSxJQUFDLENBQUEsU0FBUyxDQUFDLE9BQVgsQ0FBQSxDQUFBLENBQUE7ZUFDQSxJQUFDLENBQUEsU0FBRCxHQUFhLEtBRmY7T0FEVTtJQUFBLENBakJaO0FBQUEsSUF5QkEsV0FBQSxFQUFhLFNBQUMsU0FBRCxHQUFBO0FBQ1gsTUFBQSxJQUFHLENBQUEsSUFBSyxDQUFBLFNBQVI7QUFDRSxRQUFBLElBQUMsQ0FBQSxTQUFELEdBQWlCLElBQUEsU0FBQSxDQUFBLENBQWpCLENBREY7T0FBQTthQUVBLElBQUMsQ0FBQSxTQUFTLENBQUMsT0FBWCxDQUFtQixTQUFuQixFQUhXO0lBQUEsQ0F6QmI7R0FORixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/andytlr/.atom/packages/incremental-search/lib/isearch.coffee