(function() {
  var $$, Regex2RailRoadDiagram, RegexRailroadDiagramView, View, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom'), View = _ref.View, $$ = _ref.$$;

  Regex2RailRoadDiagram = require('./regex-to-railroad').Regex2RailRoadDiagram;

  module.exports = RegexRailroadDiagramView = (function(_super) {
    __extends(RegexRailroadDiagramView, _super);

    function RegexRailroadDiagramView() {
      this.updateRailRoadDiagram = __bind(this.updateRailRoadDiagram, this);
      return RegexRailroadDiagramView.__super__.constructor.apply(this, arguments);
    }

    RegexRailroadDiagramView.content = function() {
      return this.div({
        "class": 'regex-railroad-diagram'
      });
    };

    RegexRailroadDiagramView.prototype.initialize = function(serializeState) {
      this.isVisible = false;
      this.currentRegex = null;
      return atom.workspaceView.on('cursor:moved', this.updateRailRoadDiagram);
    };

    RegexRailroadDiagramView.prototype.updateRailRoadDiagram = function() {
      var editor, error, foo, m, range, sp, text;
      editor = atom.workspace.getActiveEditor();
      if (editor == null) {
        return;
      }
      range = editor.bufferRangeForScopeAtCursor("string.regexp");
      if (!range) {
        if (this.isVisible) {
          this.hideRailRoadDiagram();
          this.currentRegex = null;
        }
      } else {
        text = editor.getTextInBufferRange(range);
        text = text.replace(/^\s+/, "").replace(/\s+$/, "");
        m = /^\/\/\/(.*)\/\/\/\w*$/.exec(text);
        if (m != null) {
          text = m[1].replace(/\s+/, "");
        } else {
          m = /^\/(.*)\/\w*$/.exec(text);
          if (m != null) {
            text = m[1];
          }
        }
        foo = /abc/;
        if (!this.isVisible || this.currentRegex !== text) {
          this.find('div.error-message').remove();
          try {
            this.showRailRoadDiagram(text);
          } catch (_error) {
            error = _error;
            if (!this.isVisible) {
              this.showRailRoadDiagram("");
            }
            sp = " ".repeat(error.offset);
            this.append($$(function() {
              return this.div({
                "class": "error-message"
              }, (function(_this) {
                return function() {
                  return _this.pre("" + text + "\n" + sp + "^\n" + sp + error.message, {
                    "class": "text-error"
                  });
                };
              })(this));
            }));
          }
        }
      }
      return this.currentRegex = text;
    };

    RegexRailroadDiagramView.prototype.serialize = function() {};

    RegexRailroadDiagramView.prototype.destroy = function() {
      return this.detach();
    };

    RegexRailroadDiagramView.prototype.getRegexScope = function(scope) {
      var name, scopeName, _i, _len;
      scopeName = [];
      for (_i = 0, _len = scope.length; _i < _len; _i++) {
        name = scope[_i];
        scopeName.push(name);
        if (/^string\.regexp/.test(name)) {
          scopeName;
        }
      }
      return false;
    };

    RegexRailroadDiagramView.prototype.showRailRoadDiagram = function(regex) {
      var rr;
      rr = atom.workspaceView.find('.regex-railroad-diagram');
      if (!rr.length) {
        this.hide();
        atom.workspaceView.getActivePaneView().parents('.panes').eq(0).after(this);
      }
      this.children().remove();
      Regex2RailRoadDiagram(regex, this.get(0));
      this.show();
      return this.isVisible = true;
    };

    RegexRailroadDiagramView.prototype.hideRailRoadDiagram = function() {
      this.hide();
      return this.isVisible = false;
    };

    RegexRailroadDiagramView.prototype.toggle = function() {
      var statusBar;
      statusBar = atom.workspaceView.find('.status-bar');
      if (statusBar.length > 0) {
        this.insertBefore(statusBar);
      } else {
        atom.workspace.getActivePane().append(this);
      }
      Diagram(Choice(0, Skip(), '-'), Choice(0, NonTerminal('name-start char'), NonTerminal('escape')), ZeroOrMore(Choice(0, NonTerminal('name char'), NonTerminal('escape')))).addTo(this.get(0));
      return this;
    };

    return RegexRailroadDiagramView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtEQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsT0FBYSxPQUFBLENBQVEsTUFBUixDQUFiLEVBQUMsWUFBQSxJQUFELEVBQU8sVUFBQSxFQUFQLENBQUE7O0FBQUEsRUFDQyx3QkFBeUIsT0FBQSxDQUFRLHFCQUFSLEVBQXpCLHFCQURELENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osK0NBQUEsQ0FBQTs7Ozs7S0FBQTs7QUFBQSxJQUFBLHdCQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTyx3QkFBUDtPQUFMLEVBRFE7SUFBQSxDQUFWLENBQUE7O0FBQUEsdUNBR0EsVUFBQSxHQUFZLFNBQUMsY0FBRCxHQUFBO0FBR1YsTUFBQSxJQUFDLENBQUEsU0FBRCxHQUFnQixLQUFoQixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsWUFBRCxHQUFnQixJQURoQixDQUFBO2FBSUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFuQixDQUFzQixjQUF0QixFQUFzQyxJQUFDLENBQUEscUJBQXZDLEVBUFU7SUFBQSxDQUhaLENBQUE7O0FBQUEsdUNBWUEscUJBQUEsR0FBdUIsU0FBQSxHQUFBO0FBQ3JCLFVBQUEsc0NBQUE7QUFBQSxNQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWYsQ0FBQSxDQUFULENBQUE7QUFDQSxNQUFBLElBQWMsY0FBZDtBQUFBLGNBQUEsQ0FBQTtPQURBO0FBQUEsTUFFQSxLQUFBLEdBQVEsTUFBTSxDQUFDLDJCQUFQLENBQW1DLGVBQW5DLENBRlIsQ0FBQTtBQUlBLE1BQUEsSUFBRyxDQUFBLEtBQUg7QUFDRSxRQUFBLElBQUcsSUFBQyxD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
//# sourceURL=/Users/andytlr/.atom/packages/regex-railroad-diagram/lib/regex-railroad-diagram-view.coffee