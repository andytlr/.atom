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

    AtomColorHighlightElement.prototype.attach = function() {
      return requestAnimationFrame((function(_this) {
        return function() {
          var editorElement, editorRoot, _ref1, _ref2;
          editorElement = atom.views.getView(_this.model.editor);
          editorRoot = (_ref1 = editorElement.shadowRoot) != null ? _ref1 : editorElement;
          return (_ref2 = editorRoot.querySelector('.lines')) != null ? _ref2.appendChild(_this) : void 0;
        };
      })(this));
    };

    AtomColorHighlightElement.prototype.detachedCallback = function() {
      if (!this.model.isDestroyed()) {
        return this.attach();
      }
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG9HQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBQUosQ0FBQTs7QUFBQSxFQUNBLE9BQW9DLE9BQUEsQ0FBUSxXQUFSLENBQXBDLEVBQUMsMkJBQUEsbUJBQUQsRUFBc0Isa0JBQUEsVUFEdEIsQ0FBQTs7QUFBQSxFQUdBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGtCQUFSLENBSGhCLENBQUE7O0FBQUEsRUFJQSxnQkFBQSxHQUFtQixPQUFBLENBQVEsc0JBQVIsQ0FKbkIsQ0FBQTs7QUFBQSxFQU1NO0FBRUosZ0RBQUEsQ0FBQTs7OztLQUFBOztBQUFBLHdDQUFBLGVBQUEsR0FBaUIsU0FBQSxHQUFBO0FBQ2YsTUFBQSxJQUFDLENBQUEsVUFBRCxHQUFjLEVBQWQsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFdBQUQsR0FBZSxFQURmLENBQUE7YUFFQSxJQUFDLENBQUEsYUFBRCxHQUFpQixHQUFBLENBQUEsb0JBSEY7SUFBQSxDQUFqQixDQUFBOztBQUFBLHdDQUtBLE1BQUEsR0FBUSxTQUFBLEdBQUE7YUFDTixxQkFBQSxDQUFzQixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQ3BCLGNBQUEsdUNBQUE7QUFBQSxVQUFBLGFBQUEsR0FBZ0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLEtBQUMsQ0FBQSxLQUFLLENBQUMsTUFBMUIsQ0FBaEIsQ0FBQTtBQUFBLFVBQ0EsVUFBQSx3REFBd0MsYUFEeEMsQ0FBQTs2RUFFa0MsQ0FBRSxXQUFwQyxDQUFnRCxLQUFoRCxXQUhvQjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRCLEVBRE07SUFBQSxDQUxSLENBQUE7O0FBQUEsd0NB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
//# sourceURL=/Users/andytlr/.atom/packages/atom-color-highlight/lib/atom-color-highlight-element.coffee