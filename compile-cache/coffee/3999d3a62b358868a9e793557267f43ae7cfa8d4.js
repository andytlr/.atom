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
      var editor, error, flavour, m, range, sp, text;
      editor = atom.workspace.getActiveEditor();
      if (editor == null) {
        return;
      }
      flavour = "python";
      range = editor.bufferRangeForScopeAtCursor(".raw-regex");
      if (!range) {
        range = editor.bufferRangeForScopeAtCursor(".unicode-raw-regex");
      }
      if (!range) {
        range = editor.bufferRangeForScopeAtCursor(".regexp");
        flavour = "regexp";
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
        m = /^u?r('''|"""|"|')(.*)\1$/.exec(text);
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
            this.showRailRoadDiagram(text, flavour);
          } catch (_error) {
            error = _error;
            if (!this.isVisible) {
              this.showRailRoadDiagram("", flavour);
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

    RegexRailroadDiagramView.prototype.showRailRoadDiagram = function(regex, flavour) {
      var rr;
      rr = atom.workspaceView.find('.regex-railroad-diagram');
      if (!rr.length) {
        this.hide();
        atom.workspaceView.getActivePaneView().parents('.panes').eq(0).after(this);
      }
      this.children().remove();
      Regex2RailRoadDiagram(regex, this.get(0), {
        flavour: flavour
      });
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtEQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsT0FBYSxPQUFBLENBQVEsTUFBUixDQUFiLEVBQUMsWUFBQSxJQUFELEVBQU8sVUFBQSxFQUFQLENBQUE7O0FBQUEsRUFDQyx3QkFBeUIsT0FBQSxDQUFRLHFCQUFSLEVBQXpCLHFCQURELENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osK0NBQUEsQ0FBQTs7Ozs7S0FBQTs7QUFBQSxJQUFBLHdCQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTyx3QkFBUDtPQUFMLEVBRFE7SUFBQSxDQUFWLENBQUE7O0FBQUEsdUNBR0EsVUFBQSxHQUFZLFNBQUMsY0FBRCxHQUFBO0FBR1YsTUFBQSxJQUFDLENBQUEsU0FBRCxHQUFnQixLQUFoQixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsWUFBRCxHQUFnQixJQURoQixDQUFBO2FBSUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFuQixDQUFzQixjQUF0QixFQUFzQyxJQUFDLENBQUEscUJBQXZDLEVBUFU7SUFBQSxDQUhaLENBQUE7O0FBQUEsdUNBWUEscUJBQUEsR0FBdUIsU0FBQSxHQUFBO0FBQ3JCLFVBQUEsMENBQUE7QUFBQSxNQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWYsQ0FBQSxDQUFULENBQUE7QUFDQSxNQUFBLElBQWMsY0FBZDtBQUFBLGNBQUEsQ0FBQTtPQURBO0FBQUEsTUFHQSxPQUFBLEdBQVUsUUFIVixDQUFBO0FBQUEsTUFPQSxLQUFBLEdBQVEsTUFBTSxDQUFDLDJCQUFQLENBQW1DLFlBQW5DLENBUFIsQ0FBQTtBQVNBLE1BQUEsSUFBQSxD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
//# sourceURL=/Users/andytlr/.atom/packages/regex-railroad-diagram/lib/regex-railroad-diagram-view.coffee