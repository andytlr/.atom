(function() {
  var $, AtomColorHighlightView, CompositeDisposable, DotMarkerView, MarkerView, Subscriber, View, _, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore-plus');

  _ref = require('atom'), View = _ref.View, $ = _ref.$;

  Subscriber = require('emissary').Subscriber;

  CompositeDisposable = require('event-kit').CompositeDisposable;

  MarkerView = require('./marker-view');

  DotMarkerView = require('./dot-marker-view');

  module.exports = AtomColorHighlightView = (function(_super) {
    __extends(AtomColorHighlightView, _super);

    Subscriber.includeInto(AtomColorHighlightView);

    AtomColorHighlightView.content = function() {
      return this.div({
        "class": 'atom-color-highlight'
      });
    };

    function AtomColorHighlightView(model, editorView) {
      this.rebuildMarkers = __bind(this.rebuildMarkers, this);
      this.markersUpdated = __bind(this.markersUpdated, this);
      this.updateSelections = __bind(this.updateSelections, this);
      this.requestSelectionUpdate = __bind(this.requestSelectionUpdate, this);
      AtomColorHighlightView.__super__.constructor.apply(this, arguments);
      this.selections = [];
      this.markerViews = {};
      this.subscriptions = new CompositeDisposable;
      this.observeConfig();
      this.setEditorView(editorView);
      this.setModel(model);
      this.updateSelections();
    }

    AtomColorHighlightView.prototype.observeConfig = function() {
      atom.config.observe('atom-color-highlight.hideMarkersInComments', this.rebuildMarkers);
      atom.config.observe('atom-color-highlight.hideMarkersInStrings', this.rebuildMarkers);
      atom.config.observe('atom-color-highlight.markersAtEndOfLine', this.rebuildMarkers);
      atom.config.observe('atom-color-highlight.dotMarkersSize', this.rebuildMarkers);
      return atom.config.observe('atom-color-highlight.dotMarkersSpading', this.rebuildMarkers);
    };

    AtomColorHighlightView.prototype.setModel = function(model) {
      this.unsubscribeFromModel();
      this.model = model;
      return this.subscribeToModel();
    };

    AtomColorHighlightView.prototype.setEditorView = function(editorView) {
      this.unsubscribeFromEditor();
      this.editorView = editorView;
      this.editor = this.editorView.editor;
      return this.subscribeToEditor();
    };

    AtomColorHighlightView.prototype.subscribeToModel = function() {
      if (this.model == null) {
        return;
      }
      return this.subscribe(this.model, 'updated', this.markersUpdated);
    };

    AtomColorHighlightView.prototype.unsubscribeFromModel = function() {
      if (this.model == null) {
        return;
      }
      return this.unsubscribe(this.model, 'updated');
    };

    AtomColorHighlightView.prototype.subscribeToEditor = function() {
      if (this.editor == null) {
        return;
      }
      this.subscriptions.add(this.editor.onDidAddCursor(this.requestSelectionUpdate));
      this.subscriptions.add(this.editor.onDidRemoveCursor(this.requestSelectionUpdate));
      this.subscriptions.add(this.editor.onDidChangeCursorPosition(this.requestSelectionUpdate));
      this.subscriptions.add(this.editor.onDidAddSelection(this.requestSelectionUpdate));
      this.subscriptions.add(this.editor.onDidRemoveSelection(this.requestSelectionUpdate));
      return this.subscriptions.add(this.editor.onDidChangeSelectionRange(this.requestSelectionUpdate));
    };

    AtomColorHighlightView.prototype.requestSelectionUpdate = function() {
      if (this.updateRequested) {
        return;
      }
      this.updateRequested = true;
      return requestAnimationFrame((function(_this) {
        return function() {
          _this.updateSelections();
          return _this.updateRequested = false;
        };
      })(this));
    };

    AtomColorHighlightView.prototype.unsubscribeFromEditor = function() {
      if (this.editor == null) {
        return;
      }
      return this.editorSubscriptions.dispose();
    };

    AtomColorHighlightView.prototype.updateSelections = function() {
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

    AtomColorHighlightView.prototype.destroy = function() {
      this.subscriptions.dispose();
      this.destroyAllViews();
      return this.detach();
    };

    AtomColorHighlightView.prototype.getMarkerAt = function(position) {
      var id, view, _ref1;
      _ref1 = this.markerViews;
      for (id in _ref1) {
        view = _ref1[id];
        if (view.marker.bufferMarker.containsPoint(position)) {
          return view;
        }
      }
    };

    AtomColorHighlightView.prototype.removeMarkers = function() {
      var id, markerView, _ref1;
      _ref1 = this.markerViews;
      for (id in _ref1) {
        markerView = _ref1[id];
        markerView.remove();
      }
      return this.markerViews = {};
    };

    AtomColorHighlightView.prototype.markersUpdated = function(markers) {
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
            markerView = new DotMarkerView({
              editorView: this.editorView,
              marker: marker,
              markersByRows: markersByRows
            });
            sortedMarkers.push(markerView);
          } else {
            markerView = new MarkerView({
              editorView: this.editorView,
              marker: marker
            });
          }
          this.append(markerView.element);
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

    AtomColorHighlightView.prototype.rebuildMarkers = function() {
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
          markerView = new DotMarkerView({
            editorView: this.editorView,
            marker: marker,
            markersByRows: markersByRows
          });
        } else {
          markerView = new MarkerView({
            editorView: this.editorView,
            marker: marker
          });
        }
        this.append(markerView.element);
        _results.push(this.markerViews[marker.id] = markerView);
      }
      return _results;
    };

    AtomColorHighlightView.prototype.destroyAllViews = function() {
      this.empty();
      return this.markerViews = {};
    };

    return AtomColorHighlightView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG9HQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQSxPQUFZLE9BQUEsQ0FBUSxNQUFSLENBQVosRUFBQyxZQUFBLElBQUQsRUFBTyxTQUFBLENBRFAsQ0FBQTs7QUFBQSxFQUVDLGFBQWMsT0FBQSxDQUFRLFVBQVIsRUFBZCxVQUZELENBQUE7O0FBQUEsRUFHQyxzQkFBdUIsT0FBQSxDQUFRLFdBQVIsRUFBdkIsbUJBSEQsQ0FBQTs7QUFBQSxFQUtBLFVBQUEsR0FBYSxPQUFBLENBQVEsZUFBUixDQUxiLENBQUE7O0FBQUEsRUFNQSxhQUFBLEdBQWdCLE9BQUEsQ0FBUSxtQkFBUixDQU5oQixDQUFBOztBQUFBLEVBUUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLDZDQUFBLENBQUE7O0FBQUEsSUFBQSxVQUFVLENBQUMsV0FBWCxDQUF1QixzQkFBdkIsQ0FBQSxDQUFBOztBQUFBLElBRUEsc0JBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsT0FBQSxFQUFPLHNCQUFQO09BQUwsRUFEUTtJQUFBLENBRlYsQ0FBQTs7QUFLYSxJQUFBLGdDQUFDLEtBQUQsRUFBUSxVQUFSLEdBQUE7QUFDWCw2REFBQSxDQUFBO0FBQUEsNkRBQUEsQ0FBQTtBQUFBLGlFQUFBLENBQUE7QUFBQSw2RUFBQSxDQUFBO0FBQUEsTUFBQSx5REFBQSxTQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFVBQUQsR0FBYyxFQURkLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxXQUFELEdBQWUsRUFGZixDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsYUFB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
//# sourceURL=/Users/andytlr/.atom/packages/atom-color-highlight/lib/atom-color-highlight-view.coffee