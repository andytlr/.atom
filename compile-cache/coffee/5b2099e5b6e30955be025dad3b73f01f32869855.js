(function() {
  var $, AtomColorHighlightView, CompositeDisposable, Disposable, DotMarkerView, MarkerView, Subscriber, View, _, _ref, _ref1,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore-plus');

  _ref = require('atom'), View = _ref.View, $ = _ref.$;

  Subscriber = require('emissary').Subscriber;

  _ref1 = require('event-kit'), CompositeDisposable = _ref1.CompositeDisposable, Disposable = _ref1.Disposable;

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
      this.subscriptions.add(this.asDisposable(atom.config.observe('atom-color-highlight.hideMarkersInComments', this.rebuildMarkers)));
      this.subscriptions.add(this.asDisposable(atom.config.observe('atom-color-highlight.hideMarkersInStrings', this.rebuildMarkers)));
      this.subscriptions.add(this.asDisposable(atom.config.observe('atom-color-highlight.markersAtEndOfLine', this.rebuildMarkers)));
      this.subscriptions.add(this.asDisposable(atom.config.observe('atom-color-highlight.dotMarkersSize', this.rebuildMarkers)));
      this.subscriptions.add(this.asDisposable(atom.config.observe('atom-color-highlight.dotMarkersSpading', this.rebuildMarkers)));
      this.subscriptions.add(this.asDisposable(atom.config.observe('editor.lineHeight', this.rebuildMarkers)));
      return this.subscriptions.add(this.asDisposable(atom.config.observe('editor.fontSize', this.rebuildMarkers)));
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
      var id, range, selection, selections, view, viewRange, viewsToBeDisplayed, _i, _len, _ref2, _ref3, _results;
      if (((_ref2 = this.markers) != null ? _ref2.length : void 0) === 0) {
        return;
      }
      selections = this.editor.getSelections();
      viewsToBeDisplayed = _.clone(this.markerViews);
      _ref3 = this.markerViews;
      for (id in _ref3) {
        view = _ref3[id];
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
      var id, view, _ref2;
      _ref2 = this.markerViews;
      for (id in _ref2) {
        view = _ref2[id];
        if (view.marker.bufferMarker.containsPoint(position)) {
          return view;
        }
      }
    };

    AtomColorHighlightView.prototype.removeMarkers = function() {
      var id, markerView, _ref2;
      _ref2 = this.markerViews;
      for (id in _ref2) {
        markerView = _ref2[id];
        markerView.remove();
      }
      return this.markerViews = {};
    };

    AtomColorHighlightView.prototype.markersUpdated = function(markers) {
      var id, marker, markerView, markerViewsToRemoveById, markersByRows, sortedMarkers, useDots, _i, _j, _len, _len1, _ref2, _results;
      this.markers = markers;
      markerViewsToRemoveById = _.clone(this.markerViews);
      markersByRows = {};
      useDots = atom.config.get('atom-color-highlight.markersAtEndOfLine');
      sortedMarkers = [];
      _ref2 = this.markers;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        marker = _ref2[_i];
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
      var marker, markerView, markersByRows, _i, _len, _ref2, _results;
      if (!this.markers) {
        return;
      }
      markersByRows = {};
      _ref2 = this.markers;
      _results = [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        marker = _ref2[_i];
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

    AtomColorHighlightView.prototype.asDisposable = function(subscription) {
      return new Disposable(function() {
        return subscription.off();
      });
    };

    return AtomColorHighlightView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVIQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQSxPQUFZLE9BQUEsQ0FBUSxNQUFSLENBQVosRUFBQyxZQUFBLElBQUQsRUFBTyxTQUFBLENBRFAsQ0FBQTs7QUFBQSxFQUVDLGFBQWMsT0FBQSxDQUFRLFVBQVIsRUFBZCxVQUZELENBQUE7O0FBQUEsRUFHQSxRQUFvQyxPQUFBLENBQVEsV0FBUixDQUFwQyxFQUFDLDRCQUFBLG1CQUFELEVBQXNCLG1CQUFBLFVBSHRCLENBQUE7O0FBQUEsRUFLQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGVBQVIsQ0FMYixDQUFBOztBQUFBLEVBTUEsYUFBQSxHQUFnQixPQUFBLENBQVEsbUJBQVIsQ0FOaEIsQ0FBQTs7QUFBQSxFQVFBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSiw2Q0FBQSxDQUFBOztBQUFBLElBQUEsVUFBVSxDQUFDLFdBQVgsQ0FBdUIsc0JBQXZCLENBQUEsQ0FBQTs7QUFBQSxJQUVBLHNCQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTyxzQkFBUDtPQUFMLEVBRFE7SUFBQSxDQUZWLENBQUE7O0FBS2EsSUFBQSxnQ0FBQyxLQUFELEVBQVEsVUFBUixHQUFBO0FBQ1gsNkRBQUEsQ0FBQTtBQUFBLDZEQUFBLENBQUE7QUFBQSxpRUFBQSxDQUFBO0FBQUEsNkVBQUEsQ0FBQTtBQUFBLE1BQUEseURBQUEsU0FBQSxDQUFBLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxVQUFELEdBQWMsRUFEZCxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsV0FBRCxHQUFlLEVBRmYs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
//# sourceURL=/Users/andytlr/.atom/packages/atom-color-highlight/lib/atom-color-highlight-view.coffee