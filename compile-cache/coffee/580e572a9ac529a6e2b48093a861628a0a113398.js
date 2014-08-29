(function() {
  var $, EditorView, InputView, SearchModel, View, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom'), $ = _ref.$, View = _ref.View, EditorView = _ref.EditorView;

  SearchModel = require('./search-model');

  module.exports = InputView = (function(_super) {
    __extends(InputView, _super);

    function InputView() {
      this.toggleCaseOption = __bind(this.toggleCaseOption, this);
      this.toggleRegexOption = __bind(this.toggleRegexOption, this);
      return InputView.__super__.constructor.apply(this, arguments);
    }

    InputView.content = function() {
      return this.div({
        tabIndex: -1,
        "class": 'isearch tool-panel panel-bottom'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'block'
          }, function() {
            _this.span({
              outlet: 'descriptionLabel',
              "class": 'description'
            }, 'Incremental Search');
            return _this.span({
              outlet: 'optionsLabel',
              "class": 'options'
            });
          });
          return _this.div({
            "class": 'find-container block'
          }, function() {
            _this.div({
              "class": 'editor-container'
            }, function() {
              return _this.subview('findEditor', new EditorView({
                mini: true,
                placeholderText: 'search'
              }));
            });
            return _this.div({
              "class": 'btn-group btn-toggle btn-group-options'
            }, function() {
              _this.button({
                outlet: 'regexOptionButton',
                "class": 'btn'
              }, '.*');
              return _this.button({
                outlet: 'caseOptionButton',
                "class": 'btn'
              }, 'Aa');
            });
          });
        };
      })(this));
    };

    InputView.prototype.initialize = function(serializeState) {
      serializeState = serializeState || {};
      this.searchModel = new SearchModel(serializeState.modelState);
      return this.handleEvents();
    };

    InputView.prototype.handleEvents = function() {
      this.on('core:cancel core:close', (function(_this) {
        return function() {
          return _this.cancelSearch();
        };
      })(this));
      this.findEditor.on('core:confirm', (function(_this) {
        return function() {
          return _this.stopSearch();
        };
      })(this));
      this.findEditor.getEditor().on('contents-modified', (function(_this) {
        return function() {
          return _this.updateSearchText();
        };
      })(this));
      this.command('incremental-search:toggle-regex-option', this.toggleRegexOption);
      this.command('incremental-search:toggle-case-option', this.toggleCaseOption);
      this.command('incremental-search:focus-editor', (function(_this) {
        return function() {
          return _this.focusEditor();
        };
      })(this));
      this.command('incremental-search:slurp', (function(_this) {
        return function() {
          return _this.slurp();
        };
      })(this));
      return this.searchModel.on('updatedOptions', (function(_this) {
        return function() {
          _this.updateOptionButtons();
          return _this.updateOptionsLabel();
        };
      })(this));
    };

    InputView.prototype.afterAttach = function() {
      if (!this.tooltipsInitialized) {
        this.regexOptionButton.setTooltip("Use Regex", {
          command: 'incremental-search:toggle-regex-option',
          commandElement: this.findEditor
        });
        this.caseOptionButton.setTooltip("Match Case", {
          command: 'incremental-search:toggle-case-option',
          commandElement: this.findEditor
        });
        return this.tooltipsInitialized = true;
      }
    };

    InputView.prototype.hideAllTooltips = function() {
      this.regexOptionButton.hideTooltip();
      return this.caseOptionButton.hideTooltip();
    };

    InputView.prototype.slurp = function() {
      this.searchModel.slurp();
      return this.findEditor.setText(this.searchModel.pattern);
    };

    InputView.prototype.toggleRegexOption = function() {
      this.searchModel.update({
        pattern: this.findEditor.getText(),
        useRegex: !this.searchModel.useRegex
      });
      this.updateOptionsLabel();
      return this.updateOptionButtons();
    };

    InputView.prototype.toggleCaseOption = function() {
      this.searchModel.update({
        pattern: this.findEditor.getText(),
        caseSensitive: !this.searchModel.caseSensitive
      });
      this.updateOptionsLabel();
      return this.updateOptionButtons();
    };

    InputView.prototype.updateSearchText = function() {
      var pattern;
      pattern = this.findEditor.getText();
      return this.searchModel.update({
        pattern: pattern
      });
    };

    InputView.prototype.serialize = function() {
      return {
        modelState: this.searchModel.serialize()
      };
    };

    InputView.prototype.destroy = function() {
      return this.detach();
    };

    InputView.prototype.detach = function() {
      this.hideAllTooltips();
      atom.workspaceView.focus();
      return InputView.__super__.detach.call(this);
    };

    InputView.prototype.trigger = function(direction) {
      var pattern;
      this.searchModel.direction = direction;
      this.updateOptionsLabel();
      this.updateOptionButtons();
      if (!this.hasParent()) {
        atom.workspaceView.prependToBottom(this);
        pattern = '';
        this.findEditor.setText(pattern);
        this.searchModel.start(pattern);
      }
      if (!this.findEditor.hasClass('is-focused')) {
        this.findEditor.focus();
        return;
      }
      if (this.findEditor.getText()) {
        return this.searchModel.findNext();
      } else {
        if (this.searchModel.history.length) {
          pattern = this.searchModel.history[this.searchModel.history.length - 1];
          this.findEditor.setText(pattern);
          return this.searchModel.update({
            pattern: pattern
          });
        }
      }
    };

    InputView.prototype.stopSearch = function() {
      this.searchModel.stopSearch(this.findEditor.getText());
      return this.detach();
    };

    InputView.prototype.cancelSearch = function() {
      this.searchModel.cancelSearch();
      return this.detach();
    };

    InputView.prototype.updateOptionsLabel = function() {
      var label;
      label = [];
      if (this.searchModel.useRegex) {
        label.push('regex');
      }
      if (this.searchModel.caseSensitive) {
        label.push('case sensitive');
      } else {
        label.push('case insensitive');
      }
      return this.optionsLabel.text(' (' + label.join(', ') + ')');
    };

    InputView.prototype.updateOptionButtons = function() {
      this.setOptionButtonState(this.regexOptionButton, this.searchModel.useRegex);
      return this.setOptionButtonState(this.caseOptionButton, this.searchModel.caseSensitive);
    };

    InputView.prototype.setOptionButtonState = function(optionButton, selected) {
      if (selected) {
        return optionButton.addClass('selected');
      } else {
        return optionButton.removeClass('selected');
      }
    };

    InputView.prototype.focusEditor = function() {
      if (this.searchModel.lastPosition) {
        this.searchModel.moveCursorToCurrent();
        return atom.workspaceView.getActiveView().focus();
      }
    };

    return InputView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlEQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsT0FBd0IsT0FBQSxDQUFRLE1BQVIsQ0FBeEIsRUFBQyxTQUFBLENBQUQsRUFBSSxZQUFBLElBQUosRUFBVSxrQkFBQSxVQUFWLENBQUE7O0FBQUEsRUFFQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSLENBRmQsQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixnQ0FBQSxDQUFBOzs7Ozs7S0FBQTs7QUFBQSxJQUFBLFNBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsUUFBQSxFQUFVLENBQUEsQ0FBVjtBQUFBLFFBQWMsT0FBQSxFQUFPLGlDQUFyQjtPQUFMLEVBQTZELENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDM0QsVUFBQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsWUFBQSxPQUFBLEVBQU8sT0FBUDtXQUFMLEVBQXFCLFNBQUEsR0FBQTtBQUNuQixZQUFBLEtBQUMsQ0FBQSxJQUFELENBQU07QUFBQSxjQUFBLE1BQUEsRUFBUSxrQkFBUjtBQUFBLGNBQTRCLE9BQUEsRUFBTyxhQUFuQzthQUFOLEVBQXdELG9CQUF4RCxDQUFBLENBQUE7bUJBQ0EsS0FBQyxDQUFBLElBQUQsQ0FBTTtBQUFBLGNBQUEsTUFBQSxFQUFRLGNBQVI7QUFBQSxjQUF3QixPQUFBLEVBQU8sU0FBL0I7YUFBTixFQUZtQjtVQUFBLENBQXJCLENBQUEsQ0FBQTtpQkFJQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsWUFBQSxPQUFBLEVBQU8sc0JBQVA7V0FBTCxFQUFvQyxTQUFBLEdBQUE7QUFDbEMsWUFBQSxLQUFDLENBQUEsR0FB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
//# sourceURL=/Users/andytlr/.atom/packages/incremental-search/lib/input-view.coffee