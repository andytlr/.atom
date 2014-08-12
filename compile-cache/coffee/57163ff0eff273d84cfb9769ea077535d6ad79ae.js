(function() {
  var $, AtomColorHighlightView, DotMarkerView, MarkerView, Subscriber, View, _, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ = require('underscore-plus');

  _ref = require('atom'), View = _ref.View, $ = _ref.$;

  Subscriber = require('emissary').Subscriber;

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
      return this.subscribe(this.editor, 'selection-added', (function(_this) {
        return function() {
          return setImmediate(function() {
            return _this.updateSelections;
          });
        };
      })(this));
    };

    AtomColorHighlightView.prototype.unsubscribeFromEditor = function() {
      if (this.editor == null) {
        return;
      }
      return this.unsubscribe(this.editor, 'selection-added');
    };

    AtomColorHighlightView.prototype.updateSelections = function() {
      var selection, selections, selectionsToBeRemoved, _i, _j, _len, _len1;
      selections = this.editor.getSelections();
      selectionsToBeRemoved = this.selections.concat();
      for (_i = 0, _len = selections.length; _i < _len; _i++) {
        selection = selections[_i];
        if (__indexOf.call(this.selections, selection) >= 0) {
          _.remove(selectionsToBeRemoved, selection);
        } else {
          this.subscribeToSelection(selection);
        }
      }
      for (_j = 0, _len1 = selectionsToBeRemoved.length; _j < _len1; _j++) {
        selection = selectionsToBeRemoved[_j];
        this.unsubscribeFromSelection(selection);
      }
      this.selections = selections;
      return this.selectionChanged();
    };

    AtomColorHighlightView.prototype.subscribeToSelection = function(selection) {
      this.subscribe(selection, 'screen-range-changed', this.selectionChanged);
      return this.subscribe(selection, 'destroyed', this.updateSelections);
    };

    AtomColorHighlightView.prototype.unsubscribeFromSelection = function(selection) {
      this.unsubscribe(selection, 'screen-range-changed', this.selectionChanged);
      return this.unsubscribe(selection, 'destroyed');
    };

    AtomColorHighlightView.prototype.destroy = function() {
      var selection, _i, _len, _ref1;
      this.unsubscribe(this.editor, 'selection-added');
      _ref1 = this.editor.getSelections();
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        selection = _ref1[_i];
        this.unsubscribeFromSelection(selection);
      }
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
      var id, range, selection, view, viewRange, viewsToBeDisplayed, _i, _len, _ref1, _ref2, _results;
      viewsToBeDisplayed = _.clone(this.markerViews);
      _ref1 = this.markerViews;
      for (id in _ref1) {
        view = _ref1[id];
        view.removeClass('selected');
        _ref2 = this.selections;
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          selection = _ref2[_i];
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
      var id, marker, markerView, markerViewsToRemoveById, markersByRows, _i, _len, _ref1, _results;
      this.markers = markers;
      markerViewsToRemoveById = _.clone(this.markerViews);
      markersByRows = {};
      _ref1 = this.markers;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        marker = _ref1[_i];
        if (this.markerViews[marker.id] != null) {
          delete markerViewsToRemoveById[marker.id];
        } else {
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
          this.markerViews[marker.id] = markerView;
        }
      }
      _results = [];
      for (id in markerViewsToRemoveById) {
        markerView = markerViewsToRemoveById[id];
        delete this.markerViews[id];
        _results.push(markerView.remove());
      }
      return _results;
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtFQUFBO0lBQUE7Ozt5SkFBQTs7QUFBQSxFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FBSixDQUFBOztBQUFBLEVBQ0EsT0FBWSxPQUFBLENBQVEsTUFBUixDQUFaLEVBQUMsWUFBQSxJQUFELEVBQU8sU0FBQSxDQURQLENBQUE7O0FBQUEsRUFFQyxhQUFjLE9BQUEsQ0FBUSxVQUFSLEVBQWQsVUFGRCxDQUFBOztBQUFBLEVBSUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSLENBSmIsQ0FBQTs7QUFBQSxFQUtBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLG1CQUFSLENBTGhCLENBQUE7O0FBQUEsRUFPQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osNkNBQUEsQ0FBQTs7QUFBQSxJQUFBLFVBQVUsQ0FBQyxXQUFYLENBQXVCLHNCQUF2QixDQUFBLENBQUE7O0FBQUEsSUFFQSxzQkFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxPQUFBLEVBQU8sc0JBQVA7T0FBTCxFQURRO0lBQUEsQ0FGVixDQUFBOztBQUthLElBQUEsZ0NBQUMsS0FBRCxFQUFRLFVBQVIsR0FBQTtBQUNYLDZEQUFBLENBQUE7QUFBQSw2REFBQSxDQUFBO0FBQUEsaUVBQUEsQ0FBQTtBQUFBLGlFQUFBLENBQUE7QUFBQSxNQUFBLHlEQUFBLFNBQUEsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsVUFBRCxHQUFjLEVBRGQsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLFdBQUQsR0FBZSxFQUZmLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FKQSxDQUFBO0FBQUEsTUFLQSxJQUFDLENBQUEsYUFBRCxDQUFlLFVB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
//# sourceURL=/Users/andytlr/.atom/packages/atom-color-highlight/lib/atom-color-highlight-view.coffee