(function() {
  var $, AtomColorHighlightView, MarkerView, Subscriber, View, _, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ = require('underscore-plus');

  _ref = require('atom'), View = _ref.View, $ = _ref.$;

  Subscriber = require('emissary').Subscriber;

  MarkerView = require('./marker-view');

  module.exports = AtomColorHighlightView = (function(_super) {
    __extends(AtomColorHighlightView, _super);

    Subscriber.includeInto(AtomColorHighlightView);

    AtomColorHighlightView.content = function() {
      return this.div({
        "class": 'atom-color-highlight'
      });
    };

    function AtomColorHighlightView(model, editorView) {
      this.markersUpdated = __bind(this.markersUpdated, this);
      this.selectionChanged = __bind(this.selectionChanged, this);
      this.updateSelections = __bind(this.updateSelections, this);
      AtomColorHighlightView.__super__.constructor.apply(this, arguments);
      this.selections = [];
      this.markerViews = {};
      this.setEditorView(editorView);
      this.setModel(model);
      this.updateSelections();
    }

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
        _ref2 = this.selections;
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          selection = _ref2[_i];
          range = selection.getScreenRange();
          viewRange = view.getScreenRange();
          if (viewRange.intersectsWith(range)) {
            view.hide();
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
      var id, marker, markerView, markerViewsToRemoveById, _i, _len, _results;
      markerViewsToRemoveById = _.clone(this.markerViews);
      for (_i = 0, _len = markers.length; _i < _len; _i++) {
        marker = markers[_i];
        if (this.markerViews[marker.id] != null) {
          delete markerViewsToRemoveById[marker.id];
        } else {
          markerView = new MarkerView({
            editorView: this.editorView,
            marker: marker
          });
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

    AtomColorHighlightView.prototype.destroyAllViews = function() {
      this.empty();
      return this.markerViews = {};
    };

    return AtomColorHighlightView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGdFQUFBO0lBQUE7Ozt5SkFBQTs7QUFBQSxFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FBSixDQUFBOztBQUFBLEVBQ0EsT0FBWSxPQUFBLENBQVEsTUFBUixDQUFaLEVBQUMsWUFBQSxJQUFELEVBQU8sU0FBQSxDQURQLENBQUE7O0FBQUEsRUFFQyxhQUFjLE9BQUEsQ0FBUSxVQUFSLEVBQWQsVUFGRCxDQUFBOztBQUFBLEVBSUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSLENBSmIsQ0FBQTs7QUFBQSxFQU1BLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSiw2Q0FBQSxDQUFBOztBQUFBLElBQUEsVUFBVSxDQUFDLFdBQVgsQ0FBdUIsc0JBQXZCLENBQUEsQ0FBQTs7QUFBQSxJQUVBLHNCQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTyxzQkFBUDtPQUFMLEVBRFE7SUFBQSxDQUZWLENBQUE7O0FBS2EsSUFBQSxnQ0FBQyxLQUFELEVBQVEsVUFBUixHQUFBO0FBQ1gsNkRBQUEsQ0FBQTtBQUFBLGlFQUFBLENBQUE7QUFBQSxpRUFBQSxDQUFBO0FBQUEsTUFBQSx5REFBQSxTQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFVBQUQsR0FBYyxFQURkLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxXQUFELEdBQWUsRUFGZixDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsYUFBRCxDQUFlLFVBQWYsQ0FKQSxDQUFBO0FBQUEsTUFLQSxJQUFDLENBQUEsUUFBRCxDQUFVLEtBQVYsQ0FMQSxDQUFBO0FBQUEsTUFPQSxJQUFDLENBQUEsZ0JBQUQsQ0FBQSxDQVBBLENBRFc7SUFBQSxD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
//# sourceURL=/Users/andytlr/.atom/packages/atom-color-highlight/lib/atom-color-highlight-view.coffee