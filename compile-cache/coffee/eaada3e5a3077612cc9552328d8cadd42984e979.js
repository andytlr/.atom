(function() {
  var BracketMatcherView, Range, View, endPairMatches, startPairMatches, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore-plus');

  _ref = require('atom'), Range = _ref.Range, View = _ref.View;

  startPairMatches = {
    '(': ')',
    '[': ']',
    '{': '}'
  };

  endPairMatches = {
    ')': '(',
    ']': '[',
    '}': '{'
  };

  module.exports = BracketMatcherView = (function(_super) {
    __extends(BracketMatcherView, _super);

    function BracketMatcherView() {
      return BracketMatcherView.__super__.constructor.apply(this, arguments);
    }

    BracketMatcherView.content = function() {
      return this.div((function(_this) {
        return function() {
          _this.div({
            "class": 'bracket-matcher',
            style: 'display: none',
            outlet: 'startView'
          });
          return _this.div({
            "class": 'bracket-matcher',
            style: 'display: none',
            outlet: 'endView'
          });
        };
      })(this));
    };

    BracketMatcherView.prototype.initialize = function(editorView) {
      this.editorView = editorView;
      this.editor = this.editorView.editor;
      this.pairHighlighted = false;
      this.subscribe(atom.config.observe('editor.fontSize', (function(_this) {
        return function() {
          return _this.updateMatch();
        };
      })(this)));
      this.subscribe(this.editor.getCursor(), 'moved', (function(_this) {
        return function() {
          return _this.updateMatch();
        };
      })(this));
      this.subscribeToCommand(this.editorView, 'bracket-matcher:go-to-matching-bracket', (function(_this) {
        return function() {
          return _this.goToMatchingPair();
        };
      })(this));
      this.subscribeToCommand(this.editorView, 'bracket-matcher:go-to-enclosing-bracket', (function(_this) {
        return function() {
          return _this.goToEnclosingPair();
        };
      })(this));
      this.editorView.underlayer.append(this);
      return this.updateMatch();
    };

    BracketMatcherView.prototype.updateMatch = function() {
      var currentPair, matchPosition, matchingPair, position, _ref1, _ref2;
      if (this.pairHighlighted) {
        this.startView.hide();
        this.endView.hide();
      }
      this.pairHighlighted = false;
      if (!this.editor.getSelection().isEmpty()) {
        return;
      }
      if (this.editor.isFoldedAtCursorRow()) {
        return;
      }
      _ref1 = this.findCurrentPair(startPairMatches), position = _ref1.position, currentPair = _ref1.currentPair, matchingPair = _ref1.matchingPair;
      if (position) {
        matchPosition = this.findMatchingEndPair(position, currentPair, matchingPair);
      } else {
        _ref2 = this.findCurrentPair(endPairMatches), position = _ref2.position, currentPair = _ref2.currentPair, matchingPair = _ref2.matchingPair;
        if (position) {
          matchPosition = this.findMatchingStartPair(position, matchingPair, currentPair);
        }
      }
      if ((position != null) && (matchPosition != null)) {
        this.moveHighlightViews([position, matchPosition]);
        return this.pairHighlighted = true;
      }
    };

    BracketMatcherView.prototype.findMatchingEndPair = function(startPairPosition, startPair, endPair) {
      var endPairPosition, regex, scanRange, unpairedCount;
      scanRange = new Range(startPairPosition.translate([0, 1]), this.editor.buffer.getEndPosition());
      regex = new RegExp("[" + (_.escapeRegExp(startPair + endPair)) + "]", 'g');
      endPairPosition = null;
      unpairedCount = 0;
      this.editor.scanInBufferRange(regex, scanRange, (function(_this) {
        return function(_arg) {
          var match, range, stop;
          match = _arg.match, range = _arg.range, stop = _arg.stop;
          if (match[0] === startPair) {
            return unpairedCount++;
          } else if (match[0] === endPair) {
            unpairedCount--;
            endPairPosition = range.start;
            if (unpairedCount < 0) {
              return stop();
            }
          }
        };
      })(this));
      return endPairPosition;
    };

    BracketMatcherView.prototype.findMatchingStartPair = function(endPairPosition, startPair, endPair) {
      var regex, scanRange, startPairPosition, unpairedCount;
      scanRange = new Range([0, 0], endPairPosition);
      regex = new RegExp("[" + (_.escapeRegExp(startPair + endPair)) + "]", 'g');
      startPairPosition = null;
      unpairedCount = 0;
      this.editor.backwardsScanInBufferRange(regex, scanRange, (function(_this) {
        return function(_arg) {
          var match, range, stop;
          match = _arg.match, range = _arg.range, stop = _arg.stop;
          if (match[0] === endPair) {
            return unpairedCount++;
          } else if (match[0] === startPair) {
            unpairedCount--;
            startPairPosition = range.start;
            if (unpairedCount < 0) {
              return stop();
            }
          }
        };
      })(this));
      return startPairPosition;
    };

    BracketMatcherView.prototype.findAnyStartPair = function(cursorPosition) {
      var combinedRegExp, endPair, endPairRegExp, scanRange, startPair, startPairRegExp, startPosition, unpairedCount;
      scanRange = new Range([0, 0], cursorPosition);
      startPair = _.escapeRegExp(_.keys(startPairMatches).join(''));
      endPair = _.escapeRegExp(_.keys(endPairMatches).join(''));
      combinedRegExp = new RegExp("[" + startPair + endPair + "]", 'g');
      startPairRegExp = new RegExp("[" + startPair + "]", 'g');
      endPairRegExp = new RegExp("[" + endPair + "]", 'g');
      startPosition = null;
      unpairedCount = 0;
      this.editor.backwardsScanInBufferRange(combinedRegExp, scanRange, (function(_this) {
        return function(_arg) {
          var match, range, stop;
          match = _arg.match, range = _arg.range, stop = _arg.stop;
          if (match[0].match(endPairRegExp)) {
            return unpairedCount++;
          } else if (match[0].match(startPairRegExp)) {
            unpairedCount--;
            startPosition = range.start;
            if (unpairedCount < 0) {
              return stop();
            }
          }
        };
      })(this));
      return startPosition;
    };

    BracketMatcherView.prototype.moveHighlightView = function(view, bufferPosition, pixelPosition) {
      var element;
      view.bufferPosition = bufferPosition;
      element = view[0];
      element.style.display = 'block';
      element.style.top = "" + pixelPosition.top + "px";
      element.style.left = "" + pixelPosition.left + "px";
      element.style.width = "" + this.editorView.charWidth + "px";
      return element.style.height = "" + this.editorView.lineHeight + "px";
    };

    BracketMatcherView.prototype.moveHighlightViews = function(bufferRange) {
      var end, endPixelPosition, start, startPixelPosition, _ref1;
      _ref1 = Range.fromObject(bufferRange), start = _ref1.start, end = _ref1.end;
      startPixelPosition = this.editorView.pixelPositionForBufferPosition(start);
      endPixelPosition = this.editorView.pixelPositionForBufferPosition(end);
      this.moveHighlightView(this.startView, start, startPixelPosition);
      return this.moveHighlightView(this.endView, end, endPixelPosition);
    };

    BracketMatcherView.prototype.findCurrentPair = function(matches) {
      var currentPair, matchingPair, position;
      position = this.editor.getCursorBufferPosition();
      currentPair = this.editor.getTextInRange(Range.fromPointWithDelta(position, 0, 1));
      if (!matches[currentPair]) {
        position = position.translate([0, -1]);
        currentPair = this.editor.getTextInRange(Range.fromPointWithDelta(position, 0, 1));
      }
      if (matchingPair = matches[currentPair]) {
        return {
          position: position,
          currentPair: currentPair,
          matchingPair: matchingPair
        };
      } else {
        return {};
      }
    };

    BracketMatcherView.prototype.goToMatchingPair = function() {
      var endPosition, position, previousPosition, startPosition;
      if (!this.pairHighlighted) {
        return this.goToEnclosingPair();
      }
      if (!this.editorView.underlayer.isVisible()) {
        return;
      }
      position = this.editor.getCursorBufferPosition();
      previousPosition = position.translate([0, -1]);
      startPosition = this.startView.bufferPosition;
      endPosition = this.endView.bufferPosition;
      if (position.isEqual(startPosition)) {
        return this.editor.setCursorBufferPosition(endPosition.translate([0, 1]));
      } else if (previousPosition.isEqual(startPosition)) {
        return this.editor.setCursorBufferPosition(endPosition);
      } else if (position.isEqual(endPosition)) {
        return this.editor.setCursorBufferPosition(startPosition.translate([0, 1]));
      } else if (previousPosition.isEqual(endPosition)) {
        return this.editor.setCursorBufferPosition(startPosition);
      }
    };

    BracketMatcherView.prototype.goToEnclosingPair = function() {
      var matchPosition, position;
      if (this.pairHighlighted) {
        return;
      }
      if (!this.editorView.underlayer.isVisible()) {
        return;
      }
      position = this.editor.getCursorBufferPosition();
      matchPosition = this.findAnyStartPair(position);
      if (matchPosition) {
        return this.editor.setCursorBufferPosition(matchPosition);
      }
    };

    return BracketMatcherView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDBFQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBQUosQ0FBQTs7QUFBQSxFQUNBLE9BQWdCLE9BQUEsQ0FBUSxNQUFSLENBQWhCLEVBQUMsYUFBQSxLQUFELEVBQVEsWUFBQSxJQURSLENBQUE7O0FBQUEsRUFHQSxnQkFBQSxHQUNFO0FBQUEsSUFBQSxHQUFBLEVBQUssR0FBTDtBQUFBLElBQ0EsR0FBQSxFQUFLLEdBREw7QUFBQSxJQUVBLEdBQUEsRUFBSyxHQUZMO0dBSkYsQ0FBQTs7QUFBQSxFQVFBLGNBQUEsR0FDRTtBQUFBLElBQUEsR0FBQSxFQUFLLEdBQUw7QUFBQSxJQUNBLEdBQUEsRUFBSyxHQURMO0FBQUEsSUFFQSxHQUFBLEVBQUssR0FGTDtHQVRGLENBQUE7O0FBQUEsRUFhQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0oseUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsa0JBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQ0gsVUFBQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsWUFBQSxPQUFBLEVBQU8saUJBQVA7QUFBQSxZQUEwQixLQUFBLEVBQU8sZUFBakM7QUFBQSxZQUFrRCxNQUFBLEVBQVEsV0FBMUQ7V0FBTCxDQUFBLENBQUE7aUJBQ0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsT0FBQSxFQUFPLGlCQUFQO0FBQUEsWUFBMEIsS0FBQSxFQUFPLGVBQWpDO0FBQUEsWUFBa0QsTUFBQSxFQUFRLFNBQTFEO1dBQUwsRUFGRztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FB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
//# sourceURL=/Users/andytlr/github/bracket-matcher/lib/bracket-matcher-view.coffee