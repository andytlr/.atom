(function() {
  var CompositeDisposable, SelectListElement, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  CompositeDisposable = require('event-kit').CompositeDisposable;

  _ = require('underscore-plus');

  SelectListElement = (function(_super) {
    __extends(SelectListElement, _super);

    function SelectListElement() {
      this.destroyed = __bind(this.destroyed, this);
      return SelectListElement.__super__.constructor.apply(this, arguments);
    }

    SelectListElement.prototype.maxItems = 10;

    SelectListElement.prototype.createdCallback = function() {
      this.subscriptions = new CompositeDisposable;
      this.classList.add("popover-list");
      this.classList.add("select-list");
      this.classList.add("autocomplete-plus");
      return this.registerMouseHandling();
    };

    SelectListElement.prototype.registerMouseHandling = function() {
      this.onmousewheel = function(event) {
        return event.stopPropagation();
      };
      this.onmousedown = function(event) {
        var item, _ref, _ref1;
        item = event.target;
        while (!((_ref = item.dataset) != null ? _ref.index : void 0) && item !== this) {
          item = item.parentNode;
        }
        this.selectedIndex = (_ref1 = item.dataset) != null ? _ref1.index : void 0;
        return event.stopPropagation();
      };
      return this.onmouseup = function(event) {
        event.stopPropagation();
        return this.confirmSelection();
      };
    };

    SelectListElement.prototype.attachedCallback = function() {
      var _ref;
      if (!((_ref = this.component) != null ? _ref.isMounted() : void 0)) {
        return this.mountComponent();
      }
    };

    SelectListElement.prototype.getModel = function() {
      return this.model;
    };

    SelectListElement.prototype.setModel = function(model) {
      this.model = model;
      this.subscriptions.add(this.model.onDidChangeItems(this.itemsChanged.bind(this)));
      this.subscriptions.add(this.model.onDoSelectNext(this.moveSelectionDown.bind(this)));
      this.subscriptions.add(this.model.onDoSelectPrevious(this.moveSelectionUp.bind(this)));
      this.subscriptions.add(this.model.onDoConfirmSelection(this.confirmSelection.bind(this)));
      return this.subscriptions.add(this.model.onDidDispose(this.destroyed.bind(this)));
    };

    SelectListElement.prototype.itemsChanged = function() {
      this.selectedIndex = 0;
      this.renderItems();
      return setTimeout((function(_this) {
        return function() {
          var _ref;
          return (_ref = _this.input) != null ? _ref.focus() : void 0;
        };
      })(this), 0);
    };

    SelectListElement.prototype.moveSelectionUp = function() {
      if (!(this.selectedIndex <= 0)) {
        return this.setSelectedIndex(this.selectedIndex - 1);
      } else {
        return this.setSelectedIndex(this.visibleItems().length - 1);
      }
    };

    SelectListElement.prototype.moveSelectionDown = function() {
      if (!(this.selectedIndex >= (this.visibleItems().length - 1))) {
        return this.setSelectedIndex(this.selectedIndex + 1);
      } else {
        return this.setSelectedIndex(0);
      }
    };

    SelectListElement.prototype.setSelectedIndex = function(index) {
      this.selectedIndex = index;
      return this.renderItems();
    };

    SelectListElement.prototype.visibleItems = function() {
      var _ref, _ref1;
      return (_ref = this.model) != null ? (_ref1 = _ref.items) != null ? _ref1.slice(0, this.maxItems) : void 0 : void 0;
    };

    SelectListElement.prototype.getSelectedItem = function() {
      var _ref, _ref1;
      return (_ref = this.model) != null ? (_ref1 = _ref.items) != null ? _ref1[this.selectedIndex] : void 0 : void 0;
    };

    SelectListElement.prototype.confirmSelection = function() {
      var item;
      item = this.getSelectedItem();
      if (item != null) {
        return this.model.confirm(item);
      } else {
        return this.model.cancel();
      }
    };

    SelectListElement.prototype.mountComponent = function() {
      this.maxItems = atom.config.get('autocomplete-plus.maxSuggestions');
      if (!this.input) {
        this.renderInput();
      }
      if (!this.ol) {
        this.renderList();
      }
      return this.itemsChanged();
    };

    SelectListElement.prototype.renderInput = function() {
      this.input = document.createElement('input');
      this.appendChild(this.input);
      this.input.addEventListener('compositionstart', (function(_this) {
        return function() {
          _this.model.compositionInProgress = true;
          return null;
        };
      })(this));
      return this.input.addEventListener('compositionend', (function(_this) {
        return function() {
          _this.model.compositionInProgress = false;
          return null;
        };
      })(this));
    };

    SelectListElement.prototype.renderList = function() {
      this.ol = document.createElement('ol');
      this.appendChild(this.ol);
      return this.ol.className = "list-group";
    };

    SelectListElement.prototype.renderItems = function() {
      var itemToRemove, items, li, _ref;
      items = this.visibleItems() || [];
      items.forEach((function(_this) {
        return function(_arg, index) {
          var className, label, labelSpan, li, renderLabelAsHtml, word, wordSpan;
          word = _arg.word, label = _arg.label, renderLabelAsHtml = _arg.renderLabelAsHtml, className = _arg.className;
          li = _this.ol.childNodes[index];
          if (!li) {
            li = document.createElement('li');
            _this.ol.appendChild(li);
            li.dataset.index = index;
          }
          li.className = '';
          li.classList.add(className);
          if (index === _this.selectedIndex) {
            li.classList.add('selected');
          }
          if (index === _this.selectedIndex) {
            _this.selectedLi = li;
          }
          wordSpan = li.childNodes[0];
          if (!wordSpan) {
            wordSpan = document.createElement('span');
            li.appendChild(wordSpan);
            wordSpan.className = "word";
          }
          wordSpan.textContent = word;
          labelSpan = li.childNodes[1];
          if (label) {
            if (!labelSpan) {
              labelSpan = document.createElement('span');
              if (label) {
                li.appendChild(labelSpan);
              }
              labelSpan.className = "label";
            }
            if (renderLabelAsHtml) {
              return labelSpan.innerHTML = label;
            } else {
              return labelSpan.textContent = label;
            }
          } else {
            return labelSpan != null ? labelSpan.remove() : void 0;
          }
        };
      })(this));
      itemToRemove = items.length;
      while (li = this.ol.childNodes[itemToRemove++]) {
        li.remove();
      }
      return (_ref = this.selectedLi) != null ? _ref.scrollIntoView(false) : void 0;
    };

    SelectListElement.prototype.unmountComponent = function() {
      var _ref;
      if (!((_ref = this.component) != null ? _ref.isMounted() : void 0)) {
        return;
      }
      React.unmountComponentAtNode(this);
      return this.component = null;
    };

    SelectListElement.prototype.destroyed = function() {
      var _ref;
      this.subscriptions.dispose();
      return (_ref = this.parentNode) != null ? _ref.removeChild(this) : void 0;
    };

    return SelectListElement;

  })(HTMLElement);

  module.exports = SelectListElement = document.registerElement('select-list', {
    prototype: SelectListElement.prototype
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHlDQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUMsc0JBQXVCLE9BQUEsQ0FBUSxXQUFSLEVBQXZCLG1CQUFELENBQUE7O0FBQUEsRUFDQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBREosQ0FBQTs7QUFBQSxFQUdNO0FBQ0osd0NBQUEsQ0FBQTs7Ozs7S0FBQTs7QUFBQSxnQ0FBQSxRQUFBLEdBQVUsRUFBVixDQUFBOztBQUFBLGdDQUVBLGVBQUEsR0FBaUIsU0FBQSxHQUFBO0FBQ2YsTUFBQSxJQUFDLENBQUEsYUFBRCxHQUFpQixHQUFBLENBQUEsbUJBQWpCLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxTQUFTLENBQUMsR0FBWCxDQUFlLGNBQWYsQ0FEQSxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsU0FBUyxDQUFDLEdBQVgsQ0FBZSxhQUFmLENBRkEsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLFNBQVMsQ0FBQyxHQUFYLENBQWUsbUJBQWYsQ0FIQSxDQUFBO2FBSUEsSUFBQyxDQUFBLHFCQUFELENBQUEsRUFMZTtJQUFBLENBRmpCLENBQUE7O0FBQUEsZ0NBWUEscUJBQUEsR0FBdUIsU0FBQSxHQUFBO0FBQ3JCLE1BQUEsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsU0FBQyxLQUFELEdBQUE7ZUFBVyxLQUFLLENBQUMsZUFBTixDQUFBLEVBQVg7TUFBQSxDQUFoQixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsV0FBRCxHQUFlLFNBQUMsS0FBRCxHQUFBO0FBQ2IsWUFBQSxpQkFBQTtBQUFBLFFBQUEsSUFBQSxHQUFPLEtBQUssQ0FBQyxNQUFiLENBQUE7QUFDdUIsZUFBTSxDQUFBLHFDQUFjLENBQUUsY0FBZixDQUFELElBQTBCLElBQUEsS0FBUSxJQUF4QyxHQUFBO0FBQXZCLFVBQUEsSUFBQSxHQUFPLElBQUksQ0FBQyxVQUFaLENBQXVCO1FBQUEsQ0FEdkI7QUFBQSxRQUVBLElBQUMsQ0FBQSxhQUFELHlDQUE2QixDQUFFLGNBRi9CLENBQUE7ZUFJQSxLQUFLLENBQUMsZUFBTixDQUFBLEVBTGE7TUFBQSxDQURmLENBQUE7YUFRQSxJQUFDLENBQUEsU0FBRCxHQUFhLFNBQUMsS0FBRCxHQUFBO0FBQ1gsUUFBQSxLQUFLLENBQUMsZUFBTixDQUFBLENBQUEsQ0FBQTtlQUNBLElBQUMsQ0FBQSxnQkFBRCxDQUFBLEVBRlc7TUFBQSxFQVRRO0lBQUEsQ0FadkIsQ0FBQTs7QUFBQSxnQ0F5QkEsZ0JBQUEsR0FBa0IsU0FBQSxHQUFBO0FBQ2hCLFVBQUEsSUFBQTtBQUFBLE1BQUEsSUFBQSxDQUFBLHVDQUFtQyxDQUFFLFNBQVosQ0FBQSxXQUF6QjtlQUFBLElBQUMsQ0FBQSxjQUFELENBQUEsRUFBQTtPQURnQjtJQUFBLENBekJsQixDQUFBOztBQUFBLGdDQTRCQSxRQUFBLEdBQVUsU0FBQSxHQUFBO2FBQUcsSUFBQyxDQUFBLE1BQUo7SUFBQSxDQTVCVixDQUFBOztBQUFBLGdDQThCQSxRQUFBLEdBQVUsU0FBQyxLQUFELEdBQUE7QUFDUixNQUFBLElBQUMsQ0FBQSxLQUFELEdBQVMsS0FBVCxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLEtBQUssQ0FBQyxnQkFBUCxDQUF3QixJQUFDLENBQUEsWUFBWSxDQUFDLElBQWQsQ0FBbUIsSUFBbkIsQ0FBeEIsQ0FBbkIsQ0FEQSxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLEtBQUssQ0FBQyxjQUFQLENBQXNCLElBQUMsQ0FBQSxpQkFBaUIsQ0FBQyxJQUFuQixDQUF3QixJQUF4QixDQUF0QixDQUFuQixDQUZBLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsS0FBSyxDQUFDLGtCQUFQLENBQTBCLElBQUMsQ0FBQSxlQUFlLENBQUMsSUFBakIsQ0FBc0IsSUFBdEIsQ0FBMUIsQ0FBbkIsQ0FIQSxDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLEtBQUssQ0FBQyxvQkFBUCxDQUE0QixJQUFDLENBQUEsZ0JBQWdCLENBQUMsSUFBbEIsQ0FBdUIsSUFBdkIsQ0FBNUIsQ0FBbkIsQ0FKQSxDQUFBO2FBS0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxLQUFLLENBQUMsWUFBUCxDQUFvQixJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBZ0IsSUFBaEIsQ0FBcEIsQ0FBbkIsRUFOUTtJQUFBLENBOUJWLENBQUE7O0FBQUEsZ0NBc0NBLFlBQUEsR0FBYyxTQUFBLEdBQUE7QUFDWixNQUFBLElBQUMsQ0FBQSxhQUFELEdBQWlCLENBQWpCLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxXQUFELENBQUEsQ0FEQSxDQUFBO2FBRUEsVUFBQSxDQUFXLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDVCxjQUFBLElBQUE7b0RBQU0sQ0FBRSxLQUFSLENBQUEsV0FEUztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVgsRUFFRSxDQUZGLEVBSFk7SUFBQSxDQXRDZCxDQUFBOztBQUFBLGdDQTZDQSxlQUFBLEdBQWlCLFNBQUEsR0FBQTtBQUNmLE1BQUEsSUFBQSxDQUFBLENBQU8sSUFBQyxDQUFBLGFBQUQsSUFBa0IsQ0FBekIsQ0FBQTtlQUNFLElBQUMsQ0FBQSxnQkFBRCxDQUFrQixJQUFDLENBQUEsYUFBRCxHQUFpQixDQUFuQyxFQURGO09BQUEsTUFBQTtlQUdFLElBQUMsQ0FBQSxnQkFBRCxDQUFrQixJQUFDLENBQUEsWUFBRCxDQUFBLENBQWUsQ0FBQyxNQUFoQixHQUF5QixDQUEzQyxFQUhGO09BRGU7SUFBQSxDQTdDakIsQ0FBQTs7QUFBQSxnQ0FtREEsaUJBQUEsR0FBbUIsU0FBQSxHQUFBO0FBQ2pCLE1BQUEsSUFBQSxDQUFBLENBQU8sSUFBQyxDQUFBLGFBQUQsSUFBa0IsQ0FBQyxJQUFDLENBQUEsWUFBRCxDQUFBLENBQWUsQ0FBQyxNQUFoQixHQUF5QixDQUExQixDQUF6QixDQUFBO2VBQ0UsSUFBQyxDQUFBLGdCQUFELENBQWtCLElBQUMsQ0FBQSxhQUFELEdBQWlCLENBQW5DLEVBREY7T0FBQSxNQUFBO2VBR0UsSUFBQyxDQUFBLGdCQUFELENBQWtCLENBQWxCLEVBSEY7T0FEaUI7SUFBQSxDQW5EbkIsQ0FBQTs7QUFBQSxnQ0F5REEsZ0JBQUEsR0FBa0IsU0FBQyxLQUFELEdBQUE7QUFDaEIsTUFBQSxJQUFDLENBQUEsYUFBRCxHQUFpQixLQUFqQixDQUFBO2FBQ0EsSUFBQyxDQUFBLFdBQUQsQ0FBQSxFQUZnQjtJQUFBLENBekRsQixDQUFBOztBQUFBLGdDQTZEQSxZQUFBLEdBQWMsU0FBQSxHQUFBO0FBQ1osVUFBQSxXQUFBOytFQUFhLENBQUUsS0FBZixDQUFxQixDQUFyQixFQUF3QixJQUFDLENBQUEsUUFBekIsb0JBRFk7SUFBQSxDQTdEZCxDQUFBOztBQUFBLGdDQW1FQSxlQUFBLEdBQWlCLFNBQUEsR0FBQTtBQUNmLFVBQUEsV0FBQTsrRUFBZSxDQUFBLElBQUMsQ0FBQSxhQUFELG9CQURBO0lBQUEsQ0FuRWpCLENBQUE7O0FBQUEsZ0NBd0VBLGdCQUFBLEdBQWtCLFNBQUEsR0FBQTtBQUNoQixVQUFBLElBQUE7QUFBQSxNQUFBLElBQUEsR0FBTyxJQUFDLENBQUEsZUFBRCxDQUFBLENBQVAsQ0FBQTtBQUNBLE1BQUEsSUFBRyxZQUFIO2VBQ0UsSUFBQyxDQUFBLEtBQUssQ0FBQyxPQUFQLENBQWUsSUFBZixFQURGO09BQUEsTUFBQTtlQUdFLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxDQUFBLEVBSEY7T0FGZ0I7SUFBQSxDQXhFbEIsQ0FBQTs7QUFBQSxnQ0ErRUEsY0FBQSxHQUFnQixTQUFBLEdBQUE7QUFDZCxNQUFBLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGtDQUFoQixDQUFaLENBQUE7QUFDQSxNQUFBLElBQUEsQ0FBQSxJQUF1QixDQUFBLEtBQXZCO0FBQUEsUUFBQSxJQUFDLENBQUEsV0FBRCxDQUFBLENBQUEsQ0FBQTtPQURBO0FBRUEsTUFBQSxJQUFBLENBQUEsSUFBc0IsQ0FBQSxFQUF0QjtBQUFBLFFBQUEsSUFBQyxDQUFBLFVBQUQsQ0FBQSxDQUFBLENBQUE7T0FGQTthQUdBLElBQUMsQ0FBQSxZQUFELENBQUEsRUFKYztJQUFBLENBL0VoQixDQUFBOztBQUFBLGdDQXFGQSxXQUFBLEdBQWEsU0FBQSxHQUFBO0FBQ1gsTUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTLFFBQVEsQ0FBQyxhQUFULENBQXVCLE9BQXZCLENBQVQsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFdBQUQsQ0FBYSxJQUFDLENBQUEsS0FBZCxDQURBLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxLQUFLLENBQUMsZ0JBQVAsQ0FBd0Isa0JBQXhCLEVBQTRDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDMUMsVUFBQSxLQUFDLENBQUEsS0FBSyxDQUFDLHFCQUFQLEdBQStCLElBQS9CLENBQUE7aUJBQ0EsS0FGMEM7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE1QyxDQUZBLENBQUE7YUFNQSxJQUFDLENBQUEsS0FBSyxDQUFDLGdCQUFQLENBQXdCLGdCQUF4QixFQUEwQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQ3hDLFVBQUEsS0FBQyxDQUFBLEtBQUssQ0FBQyxxQkFBUCxHQUErQixLQUEvQixDQUFBO2lCQUNBLEtBRndDO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBMUMsRUFQVztJQUFBLENBckZiLENBQUE7O0FBQUEsZ0NBZ0dBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFDVixNQUFBLElBQUMsQ0FBQSxFQUFELEdBQU0sUUFBUSxDQUFDLGFBQVQsQ0FBdUIsSUFBdkIsQ0FBTixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsV0FBRCxDQUFhLElBQUMsQ0FBQSxFQUFkLENBREEsQ0FBQTthQUVBLElBQUMsQ0FBQSxFQUFFLENBQUMsU0FBSixHQUFnQixhQUhOO0lBQUEsQ0FoR1osQ0FBQTs7QUFBQSxnQ0FxR0EsV0FBQSxHQUFhLFNBQUEsR0FBQTtBQUNYLFVBQUEsNkJBQUE7QUFBQSxNQUFBLEtBQUEsR0FBUSxJQUFDLENBQUEsWUFBRCxDQUFBLENBQUEsSUFBbUIsRUFBM0IsQ0FBQTtBQUFBLE1BQ0EsS0FBSyxDQUFDLE9BQU4sQ0FBYyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxJQUFELEVBQThDLEtBQTlDLEdBQUE7QUFFWixjQUFBLGtFQUFBO0FBQUEsVUFGYyxZQUFBLE1BQU0sYUFBQSxPQUFPLHlCQUFBLG1CQUFtQixpQkFBQSxTQUU5QyxDQUFBO0FBQUEsVUFBQSxFQUFBLEdBQUssS0FBQyxDQUFBLEVBQUUsQ0FBQyxVQUFXLENBQUEsS0FBQSxDQUFwQixDQUFBO0FBQ0EsVUFBQSxJQUFBLENBQUEsRUFBQTtBQUNFLFlBQUEsRUFBQSxHQUFLLFFBQVEsQ0FBQyxhQUFULENBQXVCLElBQXZCLENBQUwsQ0FBQTtBQUFBLFlBQ0EsS0FBQyxDQUFBLEVBQUUsQ0FBQyxXQUFKLENBQWdCLEVBQWhCLENBREEsQ0FBQTtBQUFBLFlBRUEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFYLEdBQW1CLEtBRm5CLENBREY7V0FEQTtBQUFBLFVBTUEsRUFBRSxDQUFDLFNBQUgsR0FBZSxFQU5mLENBQUE7QUFBQSxVQU9BLEVBQUUsQ0FBQyxTQUFTLENBQUMsR0FBYixDQUFpQixTQUFqQixDQVBBLENBQUE7QUFRQSxVQUFBLElBQWdDLEtBQUEsS0FBUyxLQUFDLENBQUEsYUFBMUM7QUFBQSxZQUFBLEVBQUUsQ0FBQyxTQUFTLENBQUMsR0FBYixDQUFpQixVQUFqQixDQUFBLENBQUE7V0FSQTtBQVNBLFVBQUEsSUFBb0IsS0FBQSxLQUFTLEtBQUMsQ0FBQSxhQUE5QjtBQUFBLFlBQUEsS0FBQyxDQUFBLFVBQUQsR0FBYyxFQUFkLENBQUE7V0FUQTtBQUFBLFVBV0EsUUFBQSxHQUFXLEVBQUUsQ0FBQyxVQUFXLENBQUEsQ0FBQSxDQVh6QixDQUFBO0FBWUEsVUFBQSxJQUFBLENBQUEsUUFBQTtBQUNFLFlBQUEsUUFBQSxHQUFXLFFBQVEsQ0FBQyxhQUFULENBQXVCLE1BQXZCLENBQVgsQ0FBQTtBQUFBLFlBQ0EsRUFBRSxDQUFDLFdBQUgsQ0FBZSxRQUFmLENBREEsQ0FBQTtBQUFBLFlBRUEsUUFBUSxDQUFDLFNBQVQsR0FBcUIsTUFGckIsQ0FERjtXQVpBO0FBQUEsVUFpQkEsUUFBUSxDQUFDLFdBQVQsR0FBdUIsSUFqQnZCLENBQUE7QUFBQSxVQW1CQSxTQUFBLEdBQVksRUFBRSxDQUFDLFVBQVcsQ0FBQSxDQUFBLENBbkIxQixDQUFBO0FBb0JBLFVBQUEsSUFBRyxLQUFIO0FBQ0UsWUFBQSxJQUFBLENBQUEsU0FBQTtBQUNFLGNBQUEsU0FBQSxHQUFZLFFBQVEsQ0FBQyxhQUFULENBQXVCLE1BQXZCLENBQVosQ0FBQTtBQUNBLGNBQUEsSUFBNkIsS0FBN0I7QUFBQSxnQkFBQSxFQUFFLENBQUMsV0FBSCxDQUFlLFNBQWYsQ0FBQSxDQUFBO2VBREE7QUFBQSxjQUVBLFNBQVMsQ0FBQyxTQUFWLEdBQXNCLE9BRnRCLENBREY7YUFBQTtBQUtBLFlBQUEsSUFBRyxpQkFBSDtxQkFDRSxTQUFTLENBQUMsU0FBVixHQUFzQixNQUR4QjthQUFBLE1BQUE7cUJBR0UsU0FBUyxDQUFDLFdBQVYsR0FBd0IsTUFIMUI7YUFORjtXQUFBLE1BQUE7dUNBV0UsU0FBUyxDQUFFLE1BQVgsQ0FBQSxXQVhGO1dBdEJZO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBZCxDQURBLENBQUE7QUFBQSxNQW9DQSxZQUFBLEdBQWUsS0FBSyxDQUFDLE1BcENyQixDQUFBO0FBcUNZLGFBQU0sRUFBQSxHQUFLLElBQUMsQ0FBQSxFQUFFLENBQUMsVUFBVyxDQUFBLFlBQUEsRUFBQSxDQUExQixHQUFBO0FBQVosUUFBQSxFQUFFLENBQUMsTUFBSCxDQUFBLENBQUEsQ0FBWTtNQUFBLENBckNaO29EQXVDVyxDQUFFLGNBQWIsQ0FBNEIsS0FBNUIsV0F4Q1c7SUFBQSxDQXJHYixDQUFBOztBQUFBLGdDQStJQSxnQkFBQSxHQUFrQixTQUFBLEdBQUE7QUFDaEIsVUFBQSxJQUFBO0FBQUEsTUFBQSxJQUFBLENBQUEsdUNBQXdCLENBQUUsU0FBWixDQUFBLFdBQWQ7QUFBQSxjQUFBLENBQUE7T0FBQTtBQUFBLE1BQ0EsS0FBSyxDQUFDLHNCQUFOLENBQTZCLElBQTdCLENBREEsQ0FBQTthQUVBLElBQUMsQ0FBQSxTQUFELEdBQWEsS0FIRztJQUFBLENBL0lsQixDQUFBOztBQUFBLGdDQW9KQSxTQUFBLEdBQVcsU0FBQSxHQUFBO0FBQ1QsVUFBQSxJQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBQSxDQUFBLENBQUE7b0RBQ1csQ0FBRSxXQUFiLENBQXlCLElBQXpCLFdBRlM7SUFBQSxDQXBKWCxDQUFBOzs2QkFBQTs7S0FEOEIsWUFIaEMsQ0FBQTs7QUFBQSxFQTRKQSxNQUFNLENBQUMsT0FBUCxHQUFpQixpQkFBQSxHQUFvQixRQUFRLENBQUMsZUFBVCxDQUF5QixhQUF6QixFQUF3QztBQUFBLElBQUEsU0FBQSxFQUFXLGlCQUFpQixDQUFDLFNBQTdCO0dBQXhDLENBNUpyQyxDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/andytlr/.atom/packages/autocomplete-plus/lib/select-list-element.coffee