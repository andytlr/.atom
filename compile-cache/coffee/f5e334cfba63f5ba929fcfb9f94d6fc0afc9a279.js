(function() {
  var BracketMatcherView, _;

  _ = require('underscore-plus');

  BracketMatcherView = require('./bracket-matcher-view');

  module.exports = {
    pairedCharacters: {
      '(': ')',
      '[': ']',
      '{': '}',
      '"': '"',
      "'": "'"
    },
    activate: function() {
      atom.workspaceView.eachEditorView((function(_this) {
        return function(editorView) {
          if (editorView.attached && (editorView.getPane() != null)) {
            return new BracketMatcherView(editorView);
          }
        };
      })(this));
      return atom.project.eachEditor((function(_this) {
        return function(editor) {
          return _this.subscribeToEditor(editor);
        };
      })(this));
    },
    subscribeToEditor: function(editor) {
      this.bracketMarkers = [];
      _.adviseBefore(editor, 'insertText', (function(_this) {
        return function(text) {
          var autoCompleteOpeningBracket, bracketMarker, cursorBufferPosition, hasQuoteBeforeCursor, hasWordAfterCursor, hasWordBeforeCursor, nextCharacter, previousCharacter, range, skipOverExistingClosingBracket;
          if (editor.hasMultipleCursors()) {
            return true;
          }
          cursorBufferPosition = editor.getCursorBufferPosition();
          previousCharacter = editor.getTextInBufferRange([cursorBufferPosition.add([0, -1]), cursorBufferPosition]);
          nextCharacter = editor.getTextInBufferRange([cursorBufferPosition, cursorBufferPosition.add([0, 1])]);
          if (_this.isOpeningBracket(text) && !editor.getSelection().isEmpty()) {
            _this.wrapSelectionInBrackets(editor, text);
            return false;
          }
          hasWordAfterCursor = /\w/.test(nextCharacter);
          hasWordBeforeCursor = /\w/.test(previousCharacter);
          hasQuoteBeforeCursor = previousCharacter === text[0];
          autoCompleteOpeningBracket = _this.isOpeningBracket(text) && !hasWordAfterCursor && !(_this.isQuote(text) && (hasWordBeforeCursor || hasQuoteBeforeCursor));
          skipOverExistingClosingBracket = false;
          if (_this.isClosingBracket(text) && nextCharacter === text) {
            if (bracketMarker = _.find(_this.bracketMarkers, function(marker) {
              return marker.isValid() && marker.getBufferRange().end.isEqual(cursorBufferPosition);
            })) {
              skipOverExistingClosingBracket = true;
            }
          }
          if (skipOverExistingClosingBracket) {
            bracketMarker.destroy();
            _.remove(_this.bracketMarkers, bracketMarker);
            editor.moveCursorRight();
            return false;
          } else if (autoCompleteOpeningBracket) {
            editor.insertText(text + _this.pairedCharacters[text]);
            editor.moveCursorLeft();
            range = [cursorBufferPosition, cursorBufferPosition.add([0, text.length])];
            _this.bracketMarkers.push(editor.markBufferRange(range));
            return false;
          }
        };
      })(this));
      _.adviseBefore(editor, 'insertNewline', (function(_this) {
        return function() {
          var cursorBufferPosition, nextCharacter, previousCharacter;
          if (editor.hasMultipleCursors()) {
            return;
          }
          if (!editor.getSelection().isEmpty()) {
            return;
          }
          cursorBufferPosition = editor.getCursorBufferPosition();
          previousCharacter = editor.getTextInBufferRange([cursorBufferPosition.add([0, -1]), cursorBufferPosition]);
          nextCharacter = editor.getTextInBufferRange([cursorBufferPosition, cursorBufferPosition.add([0, 1])]);
          if (_this.pairedCharacters[previousCharacter] === nextCharacter) {
            editor.transact(function() {
              var cursorRow;
              editor.insertText("\n\n");
              editor.moveCursorUp();
              cursorRow = editor.getCursorBufferPosition().row;
              return editor.autoIndentBufferRows(cursorRow, cursorRow + 1);
            });
            return false;
          }
        };
      })(this));
      return _.adviseBefore(editor, 'backspace', (function(_this) {
        return function() {
          var cursorBufferPosition, nextCharacter, previousCharacter;
          if (editor.hasMultipleCursors()) {
            return;
          }
          if (!editor.getSelection().isEmpty()) {
            return;
          }
          cursorBufferPosition = editor.getCursorBufferPosition();
          previousCharacter = editor.getTextInBufferRange([cursorBufferPosition.add([0, -1]), cursorBufferPosition]);
          nextCharacter = editor.getTextInBufferRange([cursorBufferPosition, cursorBufferPosition.add([0, 1])]);
          if (_this.pairedCharacters[previousCharacter] === nextCharacter) {
            editor.transact(function() {
              editor.moveCursorLeft();
              editor["delete"]();
              return editor["delete"]();
            });
            return false;
          }
        };
      })(this));
    },
    wrapSelectionInBrackets: function(editor, bracket) {
      var pair;
      pair = this.pairedCharacters[bracket];
      return editor.mutateSelectedText((function(_this) {
        return function(selection) {
          var options, range, selectionEnd, selectionStart;
          if (selection.isEmpty()) {
            return;
          }
          range = selection.getBufferRange();
          options = {
            isReversed: selection.isReversed()
          };
          selection.insertText("" + bracket + (selection.getText()) + pair);
          selectionStart = range.start.add([0, 1]);
          if (range.start.row === range.end.row) {
            selectionEnd = range.end.add([0, 1]);
          } else {
            selectionEnd = range.end;
          }
          return selection.setBufferRange([selectionStart, selectionEnd], options);
        };
      })(this));
    },
    isQuote: function(string) {
      return /'|"/.test(string);
    },
    getInvertedPairedCharacters: function() {
      var close, open, _ref;
      if (this.invertedPairedCharacters) {
        return this.invertedPairedCharacters;
      }
      this.invertedPairedCharacters = {};
      _ref = this.pairedCharacters;
      for (open in _ref) {
        close = _ref[open];
        this.invertedPairedCharacters[close] = open;
      }
      return this.invertedPairedCharacters;
    },
    isOpeningBracket: function(string) {
      return this.pairedCharacters.hasOwnProperty(string);
    },
    isClosingBracket: function(string) {
      return this.getInvertedPairedCharacters().hasOwnProperty(string);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFCQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQSxrQkFBQSxHQUFxQixPQUFBLENBQVEsd0JBQVIsQ0FEckIsQ0FBQTs7QUFBQSxFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLGdCQUFBLEVBQ0U7QUFBQSxNQUFBLEdBQUEsRUFBSyxHQUFMO0FBQUEsTUFDQSxHQUFBLEVBQUssR0FETDtBQUFBLE1BRUEsR0FBQSxFQUFLLEdBRkw7QUFBQSxNQUdBLEdBQUEsRUFBSyxHQUhMO0FBQUEsTUFJQSxHQUFBLEVBQUssR0FKTDtLQURGO0FBQUEsSUFTQSxRQUFBLEVBQVUsU0FBQSxHQUFBO0FBQ1IsTUFBQSxJQUFJLENBQUMsYUFBYSxDQUFDLGNBQW5CLENBQWtDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLFVBQUQsR0FBQTtBQUNoQyxVQUFBLElBQUcsVUFBVSxDQUFDLFFBQVgsSUFBd0IsOEJBQTNCO21CQUNNLElBQUEsa0JBQUEsQ0FBbUIsVUFBbkIsRUFETjtXQURnQztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxDLENBQUEsQ0FBQTthQUlBLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBYixDQUF3QixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxNQUFELEdBQUE7aUJBQ3RCLEtBQUMsQ0FBQSxpQkFBRCxDQUFtQixNQUFuQixFQURzQjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXhCLEVBTFE7SUFBQSxDQVRWO0FBQUEsSUFpQkEsaUJBQUEsRUFBbUIsU0FBQyxNQUFELEdBQUE7QUFDakIsTUFBQSxJQUFDLENBQUEsY0FBRCxHQUFrQixFQUFsQixDQUFBO0FBQUEsTUFFQSxDQUFDLENBQUMsWUFBRixDQUFlLE1BQWYsRUFBdUIsWUFBdkIsRUFBcUMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsSUFBRCxHQUFBO0FBQ25DLGNBQUEsdU1BQUE7QUFBQSxVQUFBLElBQWUsTUFBTSxDQUFDLGtCQUFQLENBQUEsQ0FBZjtBQUFBLG1CQUFPLElBQVAsQ0FBQTtXQUFBO0FBQUEsVUFFQSxvQkFBQSxHQUF1QixNQUFNLENBQUMsdUJBQVAsQ0FBQSxDQUZ2QixDQUFBO0FBQUEsVUFHQSxpQkFBQSxHQUFvQixNQUFNLENBQUMsb0JBQVAsQ0FBNEIsQ0FBQyxvQkFBb0IsQ0FBQyxHQUFyQixDQUF5QixDQUFDLENBQUQsRUFBSSxDQUFBLENBQUosQ0FBekIsQ0FBRCxFQUFvQyxvQkFBcEMsQ0FBNUIsQ0FIcEIsQ0FBQTtBQUFBLFVBSUEsYUFBQSxHQUFnQixNQUFNLENBQUMsb0JBQVAsQ0FBNEIsQ0FBQyxvQkFBRCxFQUF1QixvQkFBb0IsQ0FBQyxHQUFyQixDQUF5QixDQUFDLENBQUQsRUFBRyxDQUFILENBQXpCLENBQXZCLENBQTVCLENBSmhCLENBQUE7QUFNQSxVQUFBLElBQUcsS0FBQyxDQUFBLGdCQUFELENBQWtCLElBQWxCLENBQUEsSUFBNEIsQ0FBQSxNQUFVLENBQUMsWUFBUCxDQUFBLENBQXFCLENBQUMsT0FBdEIsQ0FBQSxDQUFuQztBQUNFLFlBQUEsS0FBQyxDQUFBLHVCQUFELENBQXlCLE1BQXpCLEVBQWlDLElBQWpDLENBQUEsQ0FBQTtBQUNBLG1CQUFPLEtBQVAsQ0FGRjtXQU5BO0FBQUEsVUFVQSxrQkFBQSxHQUFxQixJQUFJLENBQUMsSUFBTCxDQUFVLGFBQVYsQ0FWckIsQ0FBQTtBQUFBLFVBV0EsbUJBQUEsR0FBc0IsSUFBSSxDQUFDLElBQUwsQ0FBVSxpQkFBVixDQVh0QixDQUFBO0FBQUEsVUFZQSxvQkFBQSxHQUF1QixpQkFBQSxLQUFxQixJQUFLLENBQUEsQ0FBQSxDQVpqRCxDQUFBO0FBQUEsVUFjQSwwQkFBQSxHQUE2QixLQUFDLENBQUEsZ0JBQUQsQ0FBa0IsSUFBbEIsQ0FBQSxJQUE0QixDQUFBLGtCQUE1QixJQUF1RCxDQUFBLENBQUssS0FBQyxDQUFBLE9BQUQsQ0FBUyxJQUFULENBQUEsSUFBbUIsQ0FBQyxtQkFBQSxJQUF1QixvQkFBeEIsQ0FBcEIsQ0FkeEYsQ0FBQTtBQUFBLFVBZUEsOEJBQUEsR0FBaUMsS0FmakMsQ0FBQTtBQWdCQSxVQUFBLElBQUcsS0FBQyxDQUFBLGdCQUFELENBQWtCLElBQWxCLENBQUEsSUFBNEIsYUFBQSxLQUFpQixJQUFoRDtBQUNFLFlBQUEsSUFBRyxhQUFBLEdBQWdCLENBQUMsQ0FBQyxJQUFGLENBQU8sS0FBQyxDQUFBLGNBQVIsRUFBd0IsU0FBQyxNQUFELEdBQUE7cUJBQVksTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFBLElBQXFCLE1BQU0sQ0FBQyxjQUFQLENBQUEsQ0FBdUIsQ0FBQyxHQUFHLENBQUMsT0FBNUIsQ0FBb0Msb0JBQXBDLEVBQWpDO1lBQUEsQ0FBeEIsQ0FBbkI7QUFDRSxjQUFBLDhCQUFBLEdBQWlDLElBQWpDLENBREY7YUFERjtXQWhCQTtBQW9CQSxVQUFBLElBQUcsOEJBQUg7QUFDRSxZQUFBLGFBQWEsQ0FBQyxPQUFkLENBQUEsQ0FBQSxDQUFBO0FBQUEsWUFDQSxDQUFDLENBQUMsTUFBRixDQUFTLEtBQUMsQ0FBQSxjQUFWLEVBQTBCLGFBQTFCLENBREEsQ0FBQTtBQUFBLFlBRUEsTUFBTSxDQUFDLGVBQVAsQ0FBQSxDQUZBLENBQUE7bUJBR0EsTUFKRjtXQUFBLE1BS0ssSUFBRywwQkFBSDtBQUNILFlBQUEsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsSUFBQSxHQUFPLEtBQUMsQ0FBQSxnQkFBaUIsQ0FBQSxJQUFBLENBQTNDLENBQUEsQ0FBQTtBQUFBLFlBQ0EsTUFBTSxDQUFDLGNBQVAsQ0FBQSxDQURBLENBQUE7QUFBQSxZQUVBLEtBQUEsR0FBUSxDQUFDLG9CQUFELEVBQXVCLG9CQUFvQixDQUFDLEdBQXJCLENBQXlCLENBQUMsQ0FBRCxFQUFJLElBQUksQ0FBQyxNQUFULENBQXpCLENBQXZCLENBRlIsQ0FBQTtBQUFBLFlBR0EsS0FBQyxDQUFBLGNBQWMsQ0FBQyxJQUFoQixDQUFxQixNQUFNLENBQUMsZUFBUCxDQUF1QixLQUF2QixDQUFyQixDQUhBLENBQUE7bUJBSUEsTUFMRztXQTFCOEI7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFyQyxDQUZBLENBQUE7QUFBQSxNQW1DQSxDQUFDLENBQUMsWUFBRixDQUFlLE1BQWYsRUFBdUIsZUFBdkIsRUFBd0MsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUN0QyxjQUFBLHNEQUFBO0FBQUEsVUFBQSxJQUFVLE1BQU0sQ0FBQyxrQkFBUCxDQUFBLENBQVY7QUFBQSxrQkFBQSxDQUFBO1dBQUE7QUFDQSxVQUFBLElBQUEsQ0FBQSxNQUFvQixDQUFDLFlBQVAsQ0FBQSxDQUFxQixDQUFDLE9BQXRCLENBQUEsQ0FBZDtBQUFBLGtCQUFBLENBQUE7V0FEQTtBQUFBLFVBR0Esb0JBQUEsR0FBdUIsTUFBTSxDQUFDLHVCQUFQLENBQUEsQ0FIdkIsQ0FBQTtBQUFBLFVBSUEsaUJBQUEsR0FBb0IsTUFBTSxDQUFDLG9CQUFQLENBQTRCLENBQUMsb0JBQW9CLENBQUMsR0FBckIsQ0FBeUIsQ0FBQyxDQUFELEVBQUksQ0FBQSxDQUFKLENBQXpCLENBQUQsRUFBb0Msb0JBQXBDLENBQTVCLENBSnBCLENBQUE7QUFBQSxVQUtBLGFBQUEsR0FBZ0IsTUFBTSxDQUFDLG9CQUFQLENBQTRCLENBQUMsb0JBQUQsRUFBdUIsb0JBQW9CLENBQUMsR0FBckIsQ0FBeUIsQ0FBQyxDQUFELEVBQUcsQ0FBSCxDQUF6QixDQUF2QixDQUE1QixDQUxoQixDQUFBO0FBTUEsVUFBQSxJQUFHLEtBQUMsQ0FBQSxnQkFBaUIsQ0FBQSxpQkFBQSxDQUFsQixLQUF3QyxhQUEzQztBQUNFLFlBQUEsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsU0FBQSxHQUFBO0FBQ2Qsa0JBQUEsU0FBQTtBQUFBLGNBQUEsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsTUFBbEIsQ0FBQSxDQUFBO0FBQUEsY0FDQSxNQUFNLENBQUMsWUFBUCxDQUFBLENBREEsQ0FBQTtBQUFBLGNBRUEsU0FBQSxHQUFZLE1BQU0sQ0FBQyx1QkFBUCxDQUFBLENBQWdDLENBQUMsR0FGN0MsQ0FBQTtxQkFHQSxNQUFNLENBQUMsb0JBQVAsQ0FBNEIsU0FBNUIsRUFBdUMsU0FBQSxHQUFZLENBQW5ELEVBSmM7WUFBQSxDQUFoQixDQUFBLENBQUE7bUJBS0EsTUFORjtXQVBzQztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXhDLENBbkNBLENBQUE7YUFrREEsQ0FBQyxDQUFDLFlBQUYsQ0FBZSxNQUFmLEVBQXVCLFdBQXZCLEVBQW9DLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDbEMsY0FBQSxzREFBQTtBQUFBLFVBQUEsSUFBVSxNQUFNLENBQUMsa0JBQVAsQ0FBQSxDQUFWO0FBQUEsa0JBQUEsQ0FBQTtXQUFBO0FBQ0EsVUFBQSxJQUFBLENBQUEsTUFBb0IsQ0FBQyxZQUFQLENBQUEsQ0FBcUIsQ0FBQyxPQUF0QixDQUFBLENBQWQ7QUFBQSxrQkFBQSxDQUFBO1dBREE7QUFBQSxVQUdBLG9CQUFBLEdBQXVCLE1BQU0sQ0FBQyx1QkFBUCxDQUFBLENBSHZCLENBQUE7QUFBQSxVQUlBLGlCQUFBLEdBQW9CLE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixDQUFDLG9CQUFvQixDQUFDLEdBQXJCLENBQXlCLENBQUMsQ0FBRCxFQUFJLENBQUEsQ0FBSixDQUF6QixDQUFELEVBQW9DLG9CQUFwQyxDQUE1QixDQUpwQixDQUFBO0FBQUEsVUFLQSxhQUFBLEdBQWdCLE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixDQUFDLG9CQUFELEVBQXVCLG9CQUFvQixDQUFDLEdBQXJCLENBQXlCLENBQUMsQ0FBRCxFQUFHLENBQUgsQ0FBekIsQ0FBdkIsQ0FBNUIsQ0FMaEIsQ0FBQTtBQU1BLFVBQUEsSUFBRyxLQUFDLENBQUEsZ0JBQWlCLENBQUEsaUJBQUEsQ0FBbEIsS0FBd0MsYUFBM0M7QUFDRSxZQUFBLE1BQU0sQ0FBQyxRQUFQLENBQWdCLFNBQUEsR0FBQTtBQUNkLGNBQUEsTUFBTSxDQUFDLGNBQVAsQ0FBQSxDQUFBLENBQUE7QUFBQSxjQUNBLE1BQU0sQ0FBQyxRQUFELENBQU4sQ0FBQSxDQURBLENBQUE7cUJBRUEsTUFBTSxDQUFDLFFBQUQsQ0FBTixDQUFBLEVBSGM7WUFBQSxDQUFoQixDQUFBLENBQUE7bUJBSUEsTUFMRjtXQVBrQztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXBDLEVBbkRpQjtJQUFBLENBakJuQjtBQUFBLElBa0ZBLHVCQUFBLEVBQXlCLFNBQUMsTUFBRCxFQUFTLE9BQVQsR0FBQTtBQUN2QixVQUFBLElBQUE7QUFBQSxNQUFBLElBQUEsR0FBTyxJQUFDLENBQUEsZ0JBQWlCLENBQUEsT0FBQSxDQUF6QixDQUFBO2FBQ0EsTUFBTSxDQUFDLGtCQUFQLENBQTBCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLFNBQUQsR0FBQTtBQUN4QixjQUFBLDRDQUFBO0FBQUEsVUFBQSxJQUFVLFNBQVMsQ0FBQyxPQUFWLENBQUEsQ0FBVjtBQUFBLGtCQUFBLENBQUE7V0FBQTtBQUFBLFVBRUEsS0FBQSxHQUFRLFNBQVMsQ0FBQyxjQUFWLENBQUEsQ0FGUixDQUFBO0FBQUEsVUFHQSxPQUFBLEdBQVU7QUFBQSxZQUFBLFVBQUEsRUFBWSxTQUFTLENBQUMsVUFBVixDQUFBLENBQVo7V0FIVixDQUFBO0FBQUEsVUFJQSxTQUFTLENBQUMsVUFBVixDQUFxQixFQUFBLEdBQUUsT0FBRixHQUFZLENBQUEsU0FBUyxDQUFDLE9BQVYsQ0FBQSxDQUFBLENBQVosR0FBa0MsSUFBdkQsQ0FKQSxDQUFBO0FBQUEsVUFLQSxjQUFBLEdBQWlCLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBWixDQUFnQixDQUFDLENBQUQsRUFBSSxDQUFKLENBQWhCLENBTGpCLENBQUE7QUFNQSxVQUFBLElBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFaLEtBQW1CLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBaEM7QUFDRSxZQUFBLFlBQUEsR0FBZSxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQVYsQ0FBYyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQWQsQ0FBZixDQURGO1dBQUEsTUFBQTtBQUdFLFlBQUEsWUFBQSxHQUFlLEtBQUssQ0FBQyxHQUFyQixDQUhGO1dBTkE7aUJBVUEsU0FBUyxDQUFDLGNBQVYsQ0FBeUIsQ0FBQyxjQUFELEVBQWlCLFlBQWpCLENBQXpCLEVBQXlELE9BQXpELEVBWHdCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBMUIsRUFGdUI7SUFBQSxDQWxGekI7QUFBQSxJQWlHQSxPQUFBLEVBQVMsU0FBQyxNQUFELEdBQUE7YUFDUCxLQUFLLENBQUMsSUFBTixDQUFXLE1BQVgsRUFETztJQUFBLENBakdUO0FBQUEsSUFvR0EsMkJBQUEsRUFBNkIsU0FBQSxHQUFBO0FBQzNCLFVBQUEsaUJBQUE7QUFBQSxNQUFBLElBQW9DLElBQUMsQ0FBQSx3QkFBckM7QUFBQSxlQUFPLElBQUMsQ0FBQSx3QkFBUixDQUFBO09BQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSx3QkFBRCxHQUE0QixFQUY1QixDQUFBO0FBR0E7QUFBQSxXQUFBLFlBQUE7MkJBQUE7QUFDRSxRQUFBLElBQUMsQ0FBQSx3QkFBeUIsQ0FBQSxLQUFBLENBQTFCLEdBQW1DLElBQW5DLENBREY7QUFBQSxPQUhBO2FBS0EsSUFBQyxDQUFBLHlCQU4wQjtJQUFBLENBcEc3QjtBQUFBLElBNEdBLGdCQUFBLEVBQWtCLFNBQUMsTUFBRCxHQUFBO2FBQ2hCLElBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxjQUFsQixDQUFpQyxNQUFqQyxFQURnQjtJQUFBLENBNUdsQjtBQUFBLElBK0dBLGdCQUFBLEVBQWtCLFNBQUMsTUFBRCxHQUFBO2FBQ2hCLElBQUMsQ0FBQSwyQkFBRCxDQUFBLENBQThCLENBQUMsY0FBL0IsQ0FBOEMsTUFBOUMsRUFEZ0I7SUFBQSxDQS9HbEI7R0FKRixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/andytlr/github/bracket-matcher/lib/bracket-matcher.coffee