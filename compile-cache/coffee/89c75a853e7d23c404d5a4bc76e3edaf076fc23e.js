(function() {
  var concatPattern, isClosingTagLikePattern, isOpeningTagLikePattern, isTagLikePattern,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  concatPattern = /\s*[,|]+\s*/g;

  isTagLikePattern = /<(?![\!\/])([a-z]{1}[^>\s=\'\"]*)/i;

  isOpeningTagLikePattern = /<(?![\!\/])([a-z]{1}[^>\s=\'\"]*)/i;

  isClosingTagLikePattern = /<\/([a-z]{1}[^>\s=\'\"]*)/i;

  module.exports = {
    neverClose: [],
    forceInline: [],
    forceBlock: [],
    grammars: ['HTML'],
    makeNeverCLoseSelfClosing: false,
    ignoreGrammar: false,
    configDefaults: {
      closeOnEndOfOpeningTag: false,
      neverClose: 'br, hr, img, input, link, meta, area, base, col, command, embed, keygen, param, source, track, wbr',
      makeNeverCloseElementsSelfClosing: false,
      forceInline: 'title, h1, h2, h3, h4, h5, h6',
      forceBlock: '',
      additionalGrammars: ''
    },
    activate: function() {
      atom.config.observe('autoclose-html.ignoreGrammar', {
        callNow: true
      }, (function(_this) {
        return function(value) {
          if (value === true) {
            atom.config.set('autoclose-html.additionalGrammars', '*');
            _this.ignoreGrammar = true;
          }
          return atom.config.set('autoclose-html.ignoreGrammar', null);
        };
      })(this));
      atom.config.observe('autoclose-html.neverClose', {
        callNow: true
      }, (function(_this) {
        return function(value) {
          return _this.neverClose = value.split(concatPattern);
        };
      })(this));
      atom.config.observe('autoclose-html.forceInline', {
        callNow: true
      }, (function(_this) {
        return function(value) {
          return _this.forceInline = value.split(concatPattern);
        };
      })(this));
      atom.config.observe('autoclose-html.forceBlock', {
        callNow: true
      }, (function(_this) {
        return function(value) {
          return _this.forceBlock = value.split(concatPattern);
        };
      })(this));
      atom.config.observe('autoclose-html.additionalGrammars', {
        callNow: true
      }, (function(_this) {
        return function(value) {
          if (value.indexOf('*') > -1) {
            return _this.ignoreGrammar = true;
          } else {
            return _this.grammars = ['HTML'].concat(value.split(concatPattern));
          }
        };
      })(this));
      atom.config.observe('autoclose-html.makeNeverCloseElementsSelfClosing', {
        callNow: true
      }, (function(_this) {
        return function(value) {
          return _this.makeNeverCLoseSelfClosing = value;
        };
      })(this));
      return this._events();
    },
    isInline: function(eleTag) {
      var ele, ret, _ref, _ref1, _ref2;
      ele = document.createElement(eleTag);
      if (_ref = eleTag.toLowerCase(), __indexOf.call(this.forceBlock, _ref) >= 0) {
        return false;
      } else if (_ref1 = eleTag.toLowerCase(), __indexOf.call(this.forceInline, _ref1) >= 0) {
        return true;
      }
      document.body.appendChild(ele);
      ret = (_ref2 = window.getComputedStyle(ele).getPropertyValue('display')) === 'inline' || _ref2 === 'inline-block' || _ref2 === 'none';
      document.body.removeChild(ele);
      return ret;
    },
    isNeverClosed: function(eleTag) {
      var _ref;
      return _ref = eleTag.toLowerCase(), __indexOf.call(this.neverClose, _ref) >= 0;
    },
    execAutoclose: function(changedEvent) {
      var eleTag, isInline, line, matches, partial;
      if (changedEvent.newText === '>') {
        line = atom.workspaceView.getActiveView().editor.buffer.getLines()[changedEvent.newRange.end.row];
        partial = line.substr(0, changedEvent.newRange.start.column);
        if (partial.substr(partial.length - 1, 1) === '/') {
          return;
        }
        if ((matches = partial.substr(partial.lastIndexOf('<')).match(isOpeningTagLikePattern)) == null) {
          return;
        }
        eleTag = matches[matches.length - 1];
        if (this.isNeverClosed(eleTag)) {
          if (this.makeNeverCLoseSelfClosing) {
            setTimeout(function() {
              var tag;
              tag = '/>';
              if (partial.substr(partial.length - 1, 1 !== ' ')) {
                tag = ' ' + tag;
              }
              atom.workspace.activePaneItem.backspace();
              return atom.workspace.activePaneItem.insertText(tag);
            });
          }
          return;
        }
        isInline = this.isInline(eleTag);
        return setTimeout(function() {
          if (!isInline) {
            atom.workspace.activePaneItem.insertNewline();
            atom.workspace.activePaneItem.insertNewline();
          }
          atom.workspace.activePaneItem.insertText('</' + eleTag + '>');
          if (isInline) {
            return atom.workspace.activePaneItem.setCursorBufferPosition(changedEvent.newRange.end);
          } else {
            atom.workspace.activePaneItem.autoIndentBufferRow(changedEvent.newRange.end.row + 1);
            return atom.workspace.activePaneItem.setCursorBufferPosition([changedEvent.newRange.end.row + 1, atom.workspace.activePaneItem.getTabText().length * atom.workspace.activePaneItem.indentationForBufferRow(changedEvent.newRange.end.row + 1)]);
          }
        });
      }
    },
    _events: function() {
      this.autocloseFcn = (function(_this) {
        return function(e) {
          if ((e != null ? e.newText : void 0) === '>') {
            return _this.execAutoclose(e);
          }
        };
      })(this);
      return atom.workspaceView.eachEditorView((function(_this) {
        return function(editorView) {
          editorView.command('editor:grammar-changed', {}, function() {
            var grammar, _ref, _ref1;
            grammar = editorView.editor.getGrammar();
            if (((_ref = grammar.name) != null ? _ref.length : void 0) > 0 && (_this.ignoreGrammar || (_ref1 = grammar.name, __indexOf.call(_this.grammars, _ref1) >= 0))) {
              editorView.editor.buffer.off('changed.autoclose-html');
              return editorView.editor.buffer.on('changed.autoclose-html', _this.autocloseFcn);
            } else {
              return editorView.editor.buffer.off('changed.autoclose-html');
            }
          });
          return editorView.trigger('editor:grammar-changed');
        };
      })(this));
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlGQUFBO0lBQUEscUpBQUE7O0FBQUEsRUFBQSxhQUFBLEdBQWdCLGNBQWhCLENBQUE7O0FBQUEsRUFDQSxnQkFBQSxHQUFtQixvQ0FEbkIsQ0FBQTs7QUFBQSxFQUVBLHVCQUFBLEdBQTBCLG9DQUYxQixDQUFBOztBQUFBLEVBR0EsdUJBQUEsR0FBMEIsNEJBSDFCLENBQUE7O0FBQUEsRUFLQSxNQUFNLENBQUMsT0FBUCxHQUVJO0FBQUEsSUFBQSxVQUFBLEVBQVcsRUFBWDtBQUFBLElBQ0EsV0FBQSxFQUFhLEVBRGI7QUFBQSxJQUVBLFVBQUEsRUFBWSxFQUZaO0FBQUEsSUFHQSxRQUFBLEVBQVUsQ0FBQyxNQUFELENBSFY7QUFBQSxJQUlBLHlCQUFBLEVBQTJCLEtBSjNCO0FBQUEsSUFLQSxhQUFBLEVBQWUsS0FMZjtBQUFBLElBTUEsY0FBQSxFQUVJO0FBQUEsTUFBQSxzQkFBQSxFQUF3QixLQUF4QjtBQUFBLE1BQ0EsVUFBQSxFQUFZLG9HQURaO0FBQUEsTUFFQSxpQ0FBQSxFQUFtQyxLQUZuQztBQUFBLE1BR0EsV0FBQSxFQUFhLCtCQUhiO0FBQUEsTUFJQSxVQUFBLEVBQVksRUFKWjtBQUFBLE1BS0Esa0JBQUEsRUFBb0IsRUFMcEI7S0FSSjtBQUFBLElBZUEsUUFBQSxFQUFVLFNBQUEsR0FBQTtBQUdOLE1BQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLDhCQUFwQixFQUFvRDtBQUFBLFFBQUEsT0FBQSxFQUFRLElBQVI7T0FBcEQsRUFBa0UsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsS0FBRCxHQUFBO0FBQzlELFVBQUEsSUFBRyxLQUFBLEtBQVMsSUFBWjtBQUNJLFlBQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLG1DQUFoQixF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
//# sourceURL=/Users/andytlr/.atom/packages/autoclose-html/lib/autoclose-html.coffee