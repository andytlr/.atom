(function() {
  var $, $$, Keys, SimpleSelectListView, View, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require("atom"), $ = _ref.$, $$ = _ref.$$, View = _ref.View;

  _ = require("underscore-plus");

  Keys = {
    Escape: 27,
    Enter: 13,
    Tab: 9
  };

  SimpleSelectListView = (function(_super) {
    __extends(SimpleSelectListView, _super);

    function SimpleSelectListView() {
      return SimpleSelectListView.__super__.constructor.apply(this, arguments);
    }

    SimpleSelectListView.prototype.maxItems = 10;

    SimpleSelectListView.content = function() {
      return this.div({
        "class": "select-list popover-list"
      }, (function(_this) {
        return function() {
          _this.input({
            "class": "hidden-input",
            outlet: "hiddenInput"
          });
          return _this.ol({
            "class": "list-group",
            outlet: "list"
          });
        };
      })(this));
    };


    /*
     * Listens to events, delegates them to instance methods
     * @private
     */

    SimpleSelectListView.prototype.initialize = function() {
      this.on("autocomplete-plus:confirm", (function(_this) {
        return function() {
          return _this.confirmSelection();
        };
      })(this));
      this.list.on("mousedown", "li", (function(_this) {
        return function(e) {
          e.preventDefault();
          e.stopPropagation();
          return _this.selectItemView($(e.target).closest("li"));
        };
      })(this));
      return this.list.on("mouseup", "li", (function(_this) {
        return function(e) {
          e.preventDefault();
          e.stopPropagation();
          if ($(e.target).closest("li").hasClass("selected")) {
            return _this.confirmSelection();
          }
        };
      })(this));
    };


    /*
     * Selects the previous item view
     * @private
     */

    SimpleSelectListView.prototype.selectPreviousItemView = function() {
      var view;
      view = this.getSelectedItemView().prev();
      if (!view.length) {
        view = this.list.find("li:last");
      }
      this.selectItemView(view);
      return false;
    };


    /*
     * Selects the next item view
     * @private
     */

    SimpleSelectListView.prototype.selectNextItemView = function() {
      var view;
      view = this.getSelectedItemView().next();
      if (!view.length) {
        view = this.list.find("li:first");
      }
      this.selectItemView(view);
      return false;
    };


    /*
     * Sets the items, displays the list
     * @param {Array} items
     * @private
     */

    SimpleSelectListView.prototype.setItems = function(items) {
      if (items == null) {
        items = [];
      }
      this.items = items;
      return this.populateList();
    };


    /*
     * Unselects all views, selects the given view
     * @param  {jQuery} view
     * @private
     */

    SimpleSelectListView.prototype.selectItemView = function(view) {
      if (!view.length) {
        return;
      }
      this.list.find(".selected").removeClass("selected");
      view.addClass("selected");
      return this.scrollToItemView(view);
    };


    /*
     * Sets the scroll position to match the given view's position
     * @param  {jQuery} view
     * @private
     */

    SimpleSelectListView.prototype.scrollToItemView = function(view) {
      var desiredBottom, desiredTop, scrollTop;
      scrollTop = this.list.scrollTop();
      desiredTop = view.position().top + scrollTop;
      desiredBottom = desiredTop + view.outerHeight();
      if (desiredTop < scrollTop) {
        return this.list.scrollTop(desiredTop);
      } else {
        return this.list.scrollBottom(desiredBottom);
      }
    };


    /*
     * Returns the currently selected item view
     * @return {jQuery}
     * @private
     */

    SimpleSelectListView.prototype.getSelectedItemView = function() {
      return this.list.find("li.selected");
    };


    /*
     * Returns the currently selected item (NOT the view)
     * @return {Object}
     * @private
     */

    SimpleSelectListView.prototype.getSelectedItem = function() {
      return this.getSelectedItemView().data("select-list-item");
    };


    /*
     * Confirms the currently selected item or cancels the list view
     * if no item has been selected
     * @private
     */

    SimpleSelectListView.prototype.confirmSelection = function() {
      var item;
      item = this.getSelectedItem();
      if (item != null) {
        return this.confirmed(item);
      } else {
        return this.cancel();
      }
    };


    /*
     * Focuses the hidden input, starts listening to keyboard events
     * @private
     */

    SimpleSelectListView.prototype.setActive = function() {
      this.active = true;
      return this.hiddenInput.focus();
    };


    /*
     * Re-builds the list with the current items
     * @private
     */

    SimpleSelectListView.prototype.populateList = function() {
      var i, item, itemView, _i, _ref1;
      if (this.items == null) {
        return;
      }
      this.list.empty();
      for (i = _i = 0, _ref1 = Math.min(this.items.length, this.maxItems); 0 <= _ref1 ? _i < _ref1 : _i > _ref1; i = 0 <= _ref1 ? ++_i : --_i) {
        item = this.items[i];
        itemView = this.viewForItem(item);
        $(itemView).data("select-list-item", item);
        this.list.append(itemView);
      }
      return this.selectItemView(this.list.find("li:first"));
    };


    /*
     * Creates a view for the given item
     * @return {jQuery}
     * @private
     */

    SimpleSelectListView.prototype.viewForItem = function(_arg) {
      var word;
      word = _arg.word;
      return $$(function() {
        return this.li((function(_this) {
          return function() {
            return _this.span(word);
          };
        })(this));
      });
    };


    /*
     * Clears the list, detaches the element
     * @private
     */

    SimpleSelectListView.prototype.cancel = function() {
      if (!this.active) {
        return;
      }
      this.active = false;
      this.list.empty();
      return this.detach();
    };

    return SimpleSelectListView;

  })(View);

  module.exports = SimpleSelectListView;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGdEQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxPQUFnQixPQUFBLENBQVEsTUFBUixDQUFoQixFQUFDLFNBQUEsQ0FBRCxFQUFJLFVBQUEsRUFBSixFQUFRLFlBQUEsSUFBUixDQUFBOztBQUFBLEVBQ0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQURKLENBQUE7O0FBQUEsRUFHQSxJQUFBLEdBQ0U7QUFBQSxJQUFBLE1BQUEsRUFBUSxFQUFSO0FBQUEsSUFDQSxLQUFBLEVBQU8sRUFEUDtBQUFBLElBRUEsR0FBQSxFQUFLLENBRkw7R0FKRixDQUFBOztBQUFBLEVBUU07QUFDSiwyQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsbUNBQUEsUUFBQSxHQUFVLEVBQVYsQ0FBQTs7QUFBQSxJQUNBLG9CQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTywwQkFBUDtPQUFMLEVBQXdDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDdEMsVUFBQSxLQUFDLENBQUEsS0FBRCxDQUFPO0FBQUEsWUFBQSxPQUFBLEVBQU8sY0FBUDtBQUFBLFlBQXVCLE1BQUEsRUFBUSxhQUEvQjtXQUFQLENBQUEsQ0FBQTtpQkFDQSxLQUFDLENBQUEsRUFBRCxDQUFJO0FBQUEsWUFBQSxPQUFBLEVBQU8sWUFBUDtBQUFBLFlBQXFCLE1BQUEsRUFBUSxNQUE3QjtXQUFKLEVBRnNDO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBeEMsRUFEUTtJQUFBLENBRFYsQ0FBQTs7QUFNQTtBQUFBOzs7T0FOQTs7QUFBQSxtQ0FVQSxVQUFBLEdBQVksU0FBQSxHQUFBO0FBRVYsTUFBQSxJQUFD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
//# sourceURL=/Users/andytlr/.atom/packages/autocomplete-plus/lib/simple-select-list-view.coffee