(function() {
  var AtomColorHighlightElement, CompositeDisposable, Disposable, DotMarkerElement, MarkerElement, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore-plus');

  _ref = require('event-kit'), CompositeDisposable = _ref.CompositeDisposable, Disposable = _ref.Disposable;

  MarkerElement = require('./marker-element');

  DotMarkerElement = require('./dot-marker-element');

  AtomColorHighlightElement = (function(_super) {
    __extends(AtomColorHighlightElement, _super);

    function AtomColorHighlightElement() {
      return AtomColorHighlightElement.__super__.constructor.apply(this, arguments);
    }

    AtomColorHighlightElement.prototype.createdCallback = function() {
      this.selections = [];
      this.markerViews = {};
      return this.subscriptions = new CompositeDisposable;
    };

    AtomColorHighlightElement.prototype.setModel = function(model) {
      this.model = model;
      this.editor = this.model.editor;
      this.editorElement = atom.views.getView(this.editor);
      this.subscriptions.add(this.model.onDidUpdateMarkers((function(_this) {
        return function(markers) {
          return _this.markersUpdated(markers);
        };
      })(this)));
      this.subscriptions.add(this.model.onDidDestroy((function(_this) {
        return function() {
          return _this.destroy();
        };
      })(this)));
      this.subscriptions.add(this.editor.onDidAddCursor((function(_this) {
        return function() {
          return _this.requestSelectionUpdate();
        };
      })(this)));
      this.subscriptions.add(this.editor.onDidRemoveCursor((function(_this) {
        return function() {
          return _this.requestSelectionUpdate();
        };
      })(this)));
      this.subscriptions.add(this.editor.onDidChangeCursorPosition((function(_this) {
        return function() {
          return _this.requestSelectionUpdate();
        };
      })(this)));
      this.subscriptions.add(this.editor.onDidAddSelection((function(_this) {
        return function() {
          return _this.requestSelectionUpdate();
        };
      })(this)));
      this.subscriptions.add(this.editor.onDidRemoveSelection((function(_this) {
        return function() {
          return _this.requestSelectionUpdate();
        };
      })(this)));
      this.subscriptions.add(this.editor.onDidChangeSelectionRange((function(_this) {
        return function() {
          return _this.requestSelectionUpdate();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('atom-color-highlight.hideMarkersInComments', (function(_this) {
        return function() {
          return _this.rebuildMarkers();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('atom-color-highlight.hideMarkersInStrings', (function(_this) {
        return function() {
          return _this.rebuildMarkers();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('atom-color-highlight.markersAtEndOfLine', (function(_this) {
        return function() {
          return _this.rebuildMarkers();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('atom-color-highlight.dotMarkersSize', (function(_this) {
        return function() {
          return _this.rebuildMarkers();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('atom-color-highlight.dotMarkersSpading', (function(_this) {
        return function() {
          return _this.rebuildMarkers();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('editor.lineHeight', (function(_this) {
        return function() {
          return _this.rebuildMarkers();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('editor.fontSize', (function(_this) {
        return function() {
          return _this.rebuildMarkers();
        };
      })(this)));
      return this.updateSelections();
    };

    AtomColorHighlightElement.prototype.requestSelectionUpdate = function() {
      if (this.updateRequested) {
        return;
      }
      this.updateRequested = true;
      return requestAnimationFrame((function(_this) {
        return function() {
          _this.updateRequested = false;
          if (_this.editor.getBuffer().isDestroyed()) {
            return;
          }
          return _this.updateSelections();
        };
      })(this));
    };

    AtomColorHighlightElement.prototype.updateSelections = function() {
      var id, range, selection, selections, view, viewRange, viewsToBeDisplayed, _i, _len, _ref1, _ref2, _results;
      if (((_ref1 = this.markers) != null ? _ref1.length : void 0) === 0) {
        return;
      }
      selections = this.editor.getSelections();
      viewsToBeDisplayed = _.clone(this.markerViews);
      _ref2 = this.markerViews;
      for (id in _ref2) {
        view = _ref2[id];
        view.removeClass('selected');
        for (_i = 0, _len = selections.length; _i < _len; _i++) {
          selection = selections[_i];
          range = selection.getScreenRange();
          viewRange = view.getScreenRange();
          if (viewRange.intersectsWith(range)) {
            view.addClass('selected');
            delete viewsToBeDisplayed[id];
          }
        }
      }
      _results = [];
      for (id in viewsToBeDisplayed) {
        view = viewsToBeDisplayed[id];
        _results.push(view.show());
      }
      return _results;
    };

    AtomColorHighlightElement.prototype.destroy = function() {
      var _ref1;
      this.subscriptions.dispose();
      this.destroyAllViews();
      return (_ref1 = this.parentNode) != null ? _ref1.removeChild(this) : void 0;
    };

    AtomColorHighlightElement.prototype.getMarkerAt = function(position) {
      var id, view, _ref1;
      _ref1 = this.markerViews;
      for (id in _ref1) {
        view = _ref1[id];
        if (view.marker.bufferMarker.containsPoint(position)) {
          return view;
        }
      }
    };

    AtomColorHighlightElement.prototype.removeMarkers = function() {
      var id, markerView, _ref1;
      _ref1 = this.markerViews;
      for (id in _ref1) {
        markerView = _ref1[id];
        markerView.remove();
      }
      return this.markerViews = {};
    };

    AtomColorHighlightElement.prototype.markersUpdated = function(markers) {
      var id, marker, markerView, markerViewsToRemoveById, markersByRows, sortedMarkers, useDots, _i, _j, _len, _len1, _ref1, _results;
      this.markers = markers;
      markerViewsToRemoveById = _.clone(this.markerViews);
      markersByRows = {};
      useDots = atom.config.get('atom-color-highlight.markersAtEndOfLine');
      sortedMarkers = [];
      _ref1 = this.markers;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        marker = _ref1[_i];
        if (this.markerViews[marker.id] != null) {
          delete markerViewsToRemoveById[marker.id];
          if (useDots) {
            sortedMarkers.push(this.markerViews[marker.id]);
          }
        } else {
          if (useDots) {
            markerView = this.createDotMarkerElement(marker, markersByRows);
            sortedMarkers.push(markerView);
          } else {
            markerView = this.createMarkerElement(marker);
          }
          this.appendChild(markerView);
          this.markerViews[marker.id] = markerView;
        }
      }
      for (id in markerViewsToRemoveById) {
        markerView = markerViewsToRemoveById[id];
        delete this.markerViews[id];
        markerView.remove();
      }
      if (useDots) {
        markersByRows = {};
        _results = [];
        for (_j = 0, _len1 = sortedMarkers.length; _j < _len1; _j++) {
          markerView = sortedMarkers[_j];
          markerView.markersByRows = markersByRows;
          markerView.updateNeeded = true;
          markerView.clearPosition = true;
          _results.push(markerView.updateDisplay());
        }
        return _results;
      }
    };

    AtomColorHighlightElement.prototype.rebuildMarkers = function() {
      var marker, markerView, markersByRows, _i, _len, _ref1, _results;
      if (!this.markers) {
        return;
      }
      markersByRows = {};
      _ref1 = this.markers;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        marker = _ref1[_i];
        if (this.markerViews[marker.id] != null) {
          this.markerViews[marker.id].remove();
        }
        if (atom.config.get('atom-color-highlight.markersAtEndOfLine')) {
          markerView = this.createDotMarkerElement(marker, markersByRows);
        } else {
          markerView = this.createMarkerElement(marker);
        }
        this.appendChild(markerView);
        _results.push(this.markerViews[marker.id] = markerView);
      }
      return _results;
    };

    AtomColorHighlightElement.prototype.destroyAllViews = function() {
      while (this.firstChild) {
        this.removeChild(this.firstChild);
      }
      return this.markerViews = {};
    };

    AtomColorHighlightElement.prototype.createMarkerElement = function(marker) {
      var element;
      element = new MarkerElement;
      element.init({
        editorElement: this.editorElement,
        editor: this.editor,
        marker: marker
      });
      return element;
    };

    AtomColorHighlightElement.prototype.createDotMarkerElement = function(marker, markersByRows) {
      var element;
      element = new DotMarkerElement;
      element.init({
        editorElement: this.editorElement,
        editor: this.editor,
        marker: marker,
        markersByRows: markersByRows
      });
      return element;
    };

    return AtomColorHighlightElement;

  })(HTMLElement);

  module.exports = AtomColorHighlightElement = document.registerElement('atom-color-highlight', {
    prototype: AtomColorHighlightElement.prototype
  });

  AtomColorHighlightElement.registerViewProvider = function(modelClass) {
    return atom.views.addViewProvider(modelClass, function(model) {
      var element;
      element = new AtomColorHighlightElement;
      element.setModel(model);
      return element;
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG9HQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBQUosQ0FBQTs7QUFBQSxFQUNBLE9BQW9DLE9BQUEsQ0FBUSxXQUFSLENBQXBDLEVBQUMsMkJBQUEsbUJBQUQsRUFBc0Isa0JBQUEsVUFEdEIsQ0FBQTs7QUFBQSxFQUdBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGtCQUFSLENBSGhCLENBQUE7O0FBQUEsRUFJQSxnQkFBQSxHQUFtQixPQUFBLENBQVEsc0JBQVIsQ0FKbkIsQ0FBQTs7QUFBQSxFQU1NO0FBRUosZ0RBQUEsQ0FBQTs7OztLQUFBOztBQUFBLHdDQUFBLGVBQUEsR0FBaUIsU0FBQSxHQUFBO0FBQ2YsTUFBQSxJQUFDLENBQUEsVUFBRCxHQUFjLEVBQWQsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFdBQUQsR0FBZSxFQURmLENBQUE7YUFFQSxJQUFDLENBQUEsYUFBRCxHQUFpQixHQUFBLENBQUEsb0JBSEY7SUFBQSxDQUFqQixDQUFBOztBQUFBLHdDQUtBLFFBQUEsR0FBVSxTQUFFLEtBQUYsR0FBQTtBQUNSLE1BRFMsSUFBQyxDQUFBLFFBQUEsS0FDVixDQUFBO0FBQUEsTUFBQyxJQUFDLENBQUEsU0FBVSxJQUFDLENBQUEsTUFBWCxNQUFGLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixJQUFDLENBQUEsTUFBcEIsQ0FEakIsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxLQUFLLENBQUMsa0JBQVAsQ0FBMEIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsT0FBRCxHQUFBO2lCQUMz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
//# sourceURL=/Users/andytlr/.atom/packages/atom-color-highlight/lib/atom-color-highlight-element.coffee