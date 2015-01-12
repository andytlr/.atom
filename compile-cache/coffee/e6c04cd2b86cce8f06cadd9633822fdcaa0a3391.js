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
      this.subscriptions.add(this.editorElement.onDidAttach((function(_this) {
        return function() {
          _this.updateSelections();
          return _this.updateMarkers();
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
      if (this.editor.displayBuffer.isDestroyed()) {
        return;
      }
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

    AtomColorHighlightElement.prototype.updateMarkers = function() {
      var id, markerView, _ref1, _results;
      _ref1 = this.markerViews;
      _results = [];
      for (id in _ref1) {
        markerView = _ref1[id];
        _results.push(markerView.updateDisplay());
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