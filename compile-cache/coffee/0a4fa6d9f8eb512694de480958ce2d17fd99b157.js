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
      this.selectionChanged = __bind(this.selectionChanged, this);
      this.updateSelections = __bind(this.updateSelections, this);
      AtomColorHighlightView.__super__.constructor.apply(this, arguments);
      this.selections = [];
      this.markerViews = {};
      this.editorSubscriptions = new CompositeDisposable;
      this.selectionSubscriptions = new CompositeDisposable;
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
      return this.editorSubscriptions.add(this.editor.onDidAddSelection((function(_this) {
        return function() {
          return setImmediate(function() {
            return _this.updateSelections;
          });
        };
      })(this)));
    };

    AtomColorHighlightView.prototype.unsubscribeFromEditor = function() {
      if (this.editor == null) {
        return;
      }
      return this.editorSubscriptions.dispose();
    };

    AtomColorHighlightView.prototype.updateSelections = function() {
      var selection, selections, _i, _len;
      selections = this.editor.getSelections();
      this.unsubscribeFromSelections();
      for (_i = 0, _len = selections.length; _i < _len; _i++) {
        selection = selections[_i];
        this.subscribeToSelection(selection);
      }
      this.selections = selections;
      return this.selectionChanged();
    };

    AtomColorHighlightView.prototype.subscribeToSelection = function(selection) {
      this.selectionSubscriptions.add(selection.onDidChangeRange(this.selectionChanged));
      return this.selectionSubscriptions.add(selection.onDidDestroy(this.updateSelections));
    };

    AtomColorHighlightView.prototype.unsubscribeFromSelections = function() {
      return this.selectionSubscriptions.dispose();
    };

    AtomColorHighlightView.prototype.destroy = function() {
      this.editorSubscriptions.dispose();
      this.unsubscribeFromSelections();
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

    AtomColorHighlightView.prototype.selectionChanged = function() {
      var id, range, selection, view, viewRange, viewsToBeDisplayed, _i, _len, _ref1, _ref2, _ref3, _results;
      if (((_ref1 = this.markers) != null ? _ref1.length : void 0) === 0) {
        return;
      }
      viewsToBeDisplayed = _.clone(this.markerViews);
      _ref2 = this.markerViews;
      for (id in _ref2) {
        view = _ref2[id];
        view.removeClass('selected');
        _ref3 = this.selections;
        for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
          selection = _ref3[_i];
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG9HQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQSxPQUFZLE9BQUEsQ0FBUSxNQUFSLENBQVosRUFBQyxZQUFBLElBQUQsRUFBTyxTQUFBLENBRFAsQ0FBQTs7QUFBQSxFQUVDLGFBQWMsT0FBQSxDQUFRLFVBQVIsRUFBZCxVQUZELENBQUE7O0FBQUEsRUFHQyxzQkFBdUIsT0FBQSxDQUFRLFdBQVIsRUFBdkIsbUJBSEQsQ0FBQTs7QUFBQSxFQUtBLFVBQUEsR0FBYSxPQUFBLENBQVEsZUFBUixDQUxiLENBQUE7O0FBQUEsRUFNQSxhQUFBLEdBQWdCLE9BQUEsQ0FBUSxtQkFBUixDQU5oQixDQUFBOztBQUFBLEVBUUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLDZDQUFBLENBQUE7O0FBQUEsSUFBQSxVQUFVLENBQUMsV0FBWCxDQUF1QixzQkFBdkIsQ0FBQSxDQUFBOztBQUFBLElBRUEsc0JBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsT0FBQSxFQUFPLHNCQUFQO09BQUwsRUFEUTtJQUFBLENBRlYsQ0FBQTs7QUFLYSxJQUFBLGdDQUFDLEtBQUQsRUFBUSxVQUFSLEdBQUE7QUFDWCw2REFBQSxDQUFBO0FBQUEsNkRBQUEsQ0FBQTtBQUFBLGlFQUFBLENBQUE7QUFBQSxpRUFBQSxDQUFBO0FBQUEsTUFBQSx5REFBQSxTQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFVBQUQsR0FBYyxFQURkLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxXQUFELEdBQWUsRUFGZixDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsbUJB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
//# sourceURL=/Users/andytlr/.atom/packages/atom-color-highlight/lib/atom-color-highlight-view.coffee