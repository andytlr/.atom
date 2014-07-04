(function() {
  var Choice, Comment, Diagram, Group, NonTerminal, OneOrMore, Optional, Sequence, Skip, Terminal, ZeroOrMore, makeLiteral, parse, parseRegex, rx2rr, _ref;

  parse = require("regexp");

  _ref = require('./railroad-diagrams'), Diagram = _ref.Diagram, Sequence = _ref.Sequence, Choice = _ref.Choice, Optional = _ref.Optional, OneOrMore = _ref.OneOrMore, ZeroOrMore = _ref.ZeroOrMore, Terminal = _ref.Terminal, NonTerminal = _ref.NonTerminal, Comment = _ref.Comment, Skip = _ref.Skip, Group = _ref.Group;

  makeLiteral = function(text) {
    var part, parts, sequence, _i, _len;
    if (text === " ") {
      return NonTerminal("SP");
    } else {
      parts = text.split(/(^ +| {2,}| +$)/);
      sequence = [];
      for (_i = 0, _len = parts.length; _i < _len; _i++) {
        part = parts[_i];
        if (!part.length) {
          continue;
        }
        if (/^ +$/.test(part)) {
          if (part.length === 1) {
            sequence.push(NonTerminal("SP"));
          } else {
            sequence.push(OneOrMore(NonTerminal("SP"), Comment("" + part.length + " times")));
          }
        } else {
          sequence.push(Terminal(part));
        }
      }
      if (sequence.length === 1) {
        return sequence[0];
      } else {
        return new Sequence(sequence);
      }
    }
  };

  rx2rr = function(node, options) {
    var alternatives, body, char, charset, i, list, literal, max, min, n, sequence, x, _i, _j, _len, _len1, _ref1, _ref2;
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
              sequence.push(makeLiteral(literal));
              literal = null;
            }
            sequence.push(rx2rr(n));
          }
        }
        if (literal != null) {
          sequence.push(makeLiteral(literal));
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
        if (!(min < max)) {
          throw new Error("Minimum quantifier (" + min + ") must be lower than ", +("maximum quantifier (" + max + ")"));
        }
        switch (min) {
          case 0:
            if (max === 1) {
              return Optional(body);
            } else {
              if (max === 0) {
                return ZeroOrMore(body, Comment("" + max + " times"));
              } else if (max !== Infinity) {
                return ZeroOrMore(body, Comment("0 to " + max + " times"));
              } else {
                return ZeroOrMore(body);
              }
            }
            break;
          case 1:
            if (max === 1) {
              return OneOrMore(body, Comment("once"));
            } else if (max !== Infinity) {
              return OneOrMore(body, Comment("1 to " + max + " times"));
            } else {
              return OneOrMore(body);
            }
            break;
          default:
            if (max === min) {
              return OneOrMore(body, Comment("" + max + " times"));
            } else if (max !== Infinity) {
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
        return makeLiteral(node.body);
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
          char = charset[0];
          if (char === " ") {
            char = "SP";
          }
          if (node.invert) {
            return NonTerminal("not " + charset[0]);
          } else {
            return Terminal(charset[0]);
          }
        } else {
          list = charset.slice(0, -1).join(", ");
          for (i = _j = 0, _len1 = list.length; _j < _len1; i = ++_j) {
            x = list[i];
            if (x === " ") {
              list[i] = "SP";
            }
          }
          if (node.invert) {
            return NonTerminal("not " + list + " and " + charset.slice(-1));
          } else {
            return NonTerminal("" + list + " or " + charset.slice(-1));
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG9KQUFBOztBQUFBLEVBQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxRQUFSLENBQVIsQ0FBQTs7QUFBQSxFQUVBLE9BQ3VDLE9BQUEsQ0FBUSxxQkFBUixDQUR2QyxFQUFDLGVBQUEsT0FBRCxFQUFVLGdCQUFBLFFBQVYsRUFBb0IsY0FBQSxNQUFwQixFQUE0QixnQkFBQSxRQUE1QixFQUFzQyxpQkFBQSxTQUF0QyxFQUFpRCxrQkFBQSxVQUFqRCxFQUE2RCxnQkFBQSxRQUE3RCxFQUNDLG1CQUFBLFdBREQsRUFDYyxlQUFBLE9BRGQsRUFDdUIsWUFBQSxJQUR2QixFQUM2QixhQUFBLEtBSDdCLENBQUE7O0FBQUEsRUFLQSxXQUFBLEdBQWMsU0FBQyxJQUFELEdBQUE7QUFFWixRQUFBLCtCQUFBO0FBQUEsSUFBQSxJQUFHLElBQUEsS0FBUSxHQUFYO2FBQ0UsV0FBQSxDQUFZLElBQVosRUFERjtLQUFBLE1BQUE7QUFHRSxNQUFBLEtBQUEsR0FBUSxJQUFJLENBQUMsS0FBTCxDQUFXLGlCQUFYLENBQVIsQ0FBQTtBQUFBLE1BQ0EsUUFBQSxHQUFXLEVBRFgsQ0FBQTtBQUVBLFdBQUEsNENBQUE7eUJBQUE7QUFDRSxRQUFBLElBQUEsQ0FBQSxJQUFvQixDQUFDLE1BQXJCO0FBQUEsbUJBQUE7U0FBQTtBQUNBLFFBQUEsSUFBRyxNQUFNLENBQUMsSUFBUCxDQUFZLElBQVosQ0FBSDtBQUNFLFVBQUEsSUFBRyxJQUFJLENBQUMsTUFBTCxLQUFlLENBQWxCO0FBQ0UsWUFBQSxRQUFRLENBQUMsSUFBVCxDQUFjLFdBQUEsQ0FBWSxJQUFaLENBQWQsQ0FBQSxDQURGO1dBQUEsTUFBQTtBQUdFLFlBQUEsUUFBUSxDQUFDLElBQVQsQ0FBYyxTQUFBLENBQVUsV0FBQSxDQUFZLElBQVosQ0FBVixF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
//# sourceURL=/Users/andytlr/.atom/packages/regex-railroad-diagram/lib/regex-to-railroad.coffee