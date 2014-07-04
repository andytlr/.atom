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
      var editor, error, m, range, sp, text;
      editor = atom.workspace.getActiveEditor();
      if (editor == null) {
        return;
      }
      range = editor.bufferRangeForScopeAtCursor(".raw-regex");
      if (!range) {
        range = editor.bufferRangeForScopeAtCursor(".regexp");
      }
      if (!range) {
        if (this.isVisible) {
          this.hideRailRoadDiagram();
          this.currentRegex = null;
        }
      } else {
        text = editor.getTextInBufferRange(range);
        text = text.replace(/^\s+/, "").replace(/\s+$/, "");
        if (text.length === 1 && text === "/") {
          return;
        }
        m = /^r('''|"""|"|')(.*)\1$/.exec(text);
        if (m != null) {
          text = m[2];
        }
        m = /^\/\/\/(.*)\/\/\/\w*$/.exec(text);
        if (m != null) {
          text = m[1].replace(/\s+/, "");
        } else {
          m = /^\/(.*)\/\w*$/.exec(text);
          if (m != null) {
            text = m[1];
          }
        }
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtEQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsT0FBYSxPQUFBLENBQVEsTUFBUixDQUFiLEVBQUMsWUFBQSxJQUFELEVBQU8sVUFBQSxFQUFQLENBQUE7O0FBQUEsRUFDQyx3QkFBeUIsT0FBQSxDQUFRLHFCQUFSLEVBQXpCLHFCQURELENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osK0NBQUEsQ0FBQTs7Ozs7S0FBQTs7QUFBQSxJQUFBLHdCQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTyx3QkFBUDtPQUFMLEVBRFE7SUFBQSxDQUFWLENBQUE7O0FBQUEsdUNBR0EsVUFBQSxHQUFZLFNBQUMsY0FBRCxHQUFBO0FBR1YsTUFBQSxJQUFDLENBQUEsU0FBRCxHQUFnQixLQUFoQixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsWUFBRCxHQUFnQixJQURoQixDQUFBO2FBSUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFuQixDQUFzQixjQUF0QixFQUFzQyxJQUFDLENBQUEscUJBQXZDLEVBUFU7SUFBQSxDQUhaLENBQUE7O0FBQUEsdUNBWUEscUJBQUEsR0FBdUIsU0FBQSxHQUFBO0FBQ3JCLFVBQUEsaUNBQUE7QUFBQSxNQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWYsQ0FBQSxDQUFULENBQUE7QUFDQSxNQUFBLElBQWMsY0FBZDtBQUFBLGNBQUEsQ0FBQTtPQURBO0FBQUEsTUFLQSxLQUFBLEdBQVEsTUFBTSxDQUFDLDJCQUFQLENBQW1DLFlBQW5DLENBTFIsQ0FBQTtBQU9BLE1BQUEsSUFBQSxDQUFBLEtBQUE7QUFFRSxRQUFBLEtBQUEsR0FBUSxN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
//# sourceURL=/Users/andytlr/.atom/packages/regex-railroad-diagram/lib/regex-railroad-diagram-view.coffee