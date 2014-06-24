(function() {
  var Choice, Comment, Diagram, Group, NonTerminal, OneOrMore, Optional, Sequence, Skip, Terminal, ZeroOrMore, parse, parseRegex, rx2rr, _ref;

  parse = require("regexp");

  _ref = require('./railroad-diagrams'), Diagram = _ref.Diagram, Sequence = _ref.Sequence, Choice = _ref.Choice, Optional = _ref.Optional, OneOrMore = _ref.OneOrMore, ZeroOrMore = _ref.ZeroOrMore, Terminal = _ref.Terminal, NonTerminal = _ref.NonTerminal, Comment = _ref.Comment, Skip = _ref.Skip, Group = _ref.Group;

  rx2rr = function(node, options) {
    var alternatives, body, charset, list, literal, max, min, n, sequence, x, _i, _len, _ref1, _ref2;
    switch (node.type) {
      case "match":
        literal = null;
        sequence = [];
        _ref1 = node.body;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          n = _ref1[_i];
          if (n.type === "literal") {
            if (literal != null) {
              literal += n.body;
            } else {
              literal = n.body;
            }
          } else {
            if (literal != null) {
              sequence.push(Terminal(literal));
              literal = null;
            }
            sequence.push(rx2rr(n));
          }
        }
        if (literal != null) {
          sequence.push(Terminal(literal));
        }
        if (sequence.length === 1) {
          return sequence[0];
        } else {
          return new Sequence(sequence);
        }
        break;
      case "alternate":
        alternatives = [];
        while (node.type === "alternate") {
          alternatives.push(rx2rr(node.left));
          node = node.right;
        }
        alternatives.push(rx2rr(node));
        return new Choice(Math.floor(alternatives.length / 2) - 1, alternatives);
      case "quantified":
        _ref2 = node.quantifier, min = _ref2.min, max = _ref2.max;
        body = rx2rr(node.body);
        switch (min) {
          case 0:
            if (max === 1) {
              return Optional(body);
            } else {
              if (max !== Infinity) {
                return ZeroOrMore(body, Comment("0 to " + max + " times"));
              } else {
                return ZeroOrMore(body);
              }
            }
            break;
          case 1:
            if (max !== Infinity) {
              return OneOrMore(body, Comment("1 to " + max + " times"));
            } else {
              return OneOrMore(body);
            }
            break;
          default:
            if (max !== Infinity) {
              return OneOrMore(body, Comment("" + min + " to " + max + " times"));
            } else {
              return OneOrMore(body, Comment("at least " + min + " times"));
            }
        }
        break;
      case "capture-group":
        return Group(rx2rr(node.body), Comment("capture " + node.index));
      case "non-capture-group":
        return Group(rx2rr(node.body));
      case "positive-lookahead":
      case "negative-lookahead":
      case "positive-lookbehind":
      case "negative-lookbehind":
        return Group(rx2rr(node.body), Comment(node.type));
      case "back-reference":
        return NonTerminal("ref " + node.index);
      case "literal":
        if (node.body === " ") {
          return NonTerminal("SP");
        } else {
          return Terminal(node.body);
        }
        break;
      case "word":
        return NonTerminal("word-character");
      case "non-word":
        return NonTerminal("non-word-character");
      case "line-feed":
        return NonTerminal("LF");
      case "carriage-return":
        return NonTerminal("CR");
      case "form-feed":
        return NonTerminal("FF");
      case "back-space":
        return NonTerminal("BS");
      case "digit":
        return Terminal("0-9");
      case "white-space":
        return NonTerminal("WS");
      case "range":
        return Terminal(node.text);
      case "charset":
        charset = (function() {
          var _j, _len1, _ref3, _results;
          _ref3 = node.body;
          _results = [];
          for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
            x = _ref3[_j];
            _results.push(x.text);
          }
          return _results;
        })();
        if (charset.length === 1) {
          if (node.invert) {
            return Terminal("not " + charset[0]);
          } else {
            return Terminal(charset[0]);
          }
        } else {
          list = charset.slice(0, -1).join(", ");
          if (node.invert) {
            return Terminal("not " + list + " and " + charset.slice(-1));
          } else {
            return Terminal("" + list + " or " + charset.slice(-1));
          }
        }
        break;
      case "hex":
      case "octal":
      case "unicode":
        return Terminal(node.text);
      default:
        return NonTerminal(node.type);
    }
  };

  parseRegex = function(regex) {
    if (regex instanceof RegExp) {
      regex = regex.source;
    }
    return parse(regex);
  };

  module.exports = {
    Regex2RailRoadDiagram: function(regex, parent) {
      return Diagram(rx2rr(parseRegex(regex))).addTo(parent);
    },
    ParseRegex: parseRegex
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVJQUFBOztBQUFBLEVBQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxRQUFSLENBQVIsQ0FBQTs7QUFBQSxFQUVBLE9BQ3VDLE9BQUEsQ0FBUSxxQkFBUixDQUR2QyxFQUFDLGVBQUEsT0FBRCxFQUFVLGdCQUFBLFFBQVYsRUFBb0IsY0FBQSxNQUFwQixFQUE0QixnQkFBQSxRQUE1QixFQUFzQyxpQkFBQSxTQUF0QyxFQUFpRCxrQkFBQSxVQUFqRCxFQUE2RCxnQkFBQSxRQUE3RCxFQUNDLG1CQUFBLFdBREQsRUFDYyxlQUFBLE9BRGQsRUFDdUIsWUFBQSxJQUR2QixFQUM2QixhQUFBLEtBSDdCLENBQUE7O0FBQUEsRUFLQSxLQUFBLEdBQVEsU0FBQyxJQUFELEVBQU8sT0FBUCxHQUFBO0FBQ04sUUFBQSw0RkFBQTtBQUFBLFlBQU8sSUFBSSxDQUFDLElBQVo7QUFBQSxXQUNPLE9BRFA7QUFFSSxRQUFBLE9BQUEsR0FBVSxJQUFWLENBQUE7QUFBQSxRQUNBLFFBQUEsR0FBVyxFQURYLENBQUE7QUFHQTtBQUFBLGFBQUEsNENBQUE7d0JBQUE7QUFDRSxVQUFBLElBQUcsQ0FBQyxDQUFDLElBQUYsS0FBVSxTQUFiO0FBQ0UsWUFBQSxJQUFHLGVBQUg7QUFDRSxjQUFBLE9BQUEsSUFBVyxDQUFDLENBQUMsSUFBYixDQURGO2FBQUEsTUFBQTtBQUdFLGNBQUEsT0FBQSxHQUFVLENBQUMsQ0FBQyxJQUFaLENBSEY7YUFERjtXQUFBLE1BQUE7QUFNRSxZQUFBLElBQUcsZUFBSDtBQUNFLGNBQUEsUUFBUSxDQUFDLElBQVQsQ0FBYyxRQUFBLENBQVMsT0FBVCxDQUFkLENBQUEsQ0FBQTtBQUFBLGNBQ0EsT0FBQSxHQUFVLElBRFYsQ0FERjthQUFBO0FBQUEsWUFJQSxRQUFRLENBQUMsSUFBVCxD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
//# sourceURL=/Users/andytlr/.atom/packages/regex-railroad-diagram/lib/regex-to-railroad.coffee