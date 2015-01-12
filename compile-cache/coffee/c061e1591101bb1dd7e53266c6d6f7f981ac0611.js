(function() {
  var $, AtomColorHighlightView, CompositeDisposable, Disposable, DotMarkerView, MarkerView, Subscriber, View, _, _ref, _ref1,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore-plus');

  _ref = require('space-pen'), View = _ref.View, $ = _ref.$;

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

    function AtomColorHighlightView(model, editor, editorElement) {
      this.editor = editor;
      this.rebuildMarkers = __bind(this.rebuildMarkers, this);
      this.markersUpdated = __bind(this.markersUpdated, this);
      this.updateSelections = __bind(this.updateSelections, this);
      this.requestSelectionUpdate = __bind(this.requestSelectionUpdate, this);
      this.editorDestroyed = __bind(this.editorDestroyed, this);
      AtomColorHighlightView.__super__.constructor.apply(this, arguments);
      this.selections = [];
      this.markerViews = {};
      this.subscriptions = new CompositeDisposable;
      this.observeConfig();
      this.setEditorView(editorElement);
      this.setModel(model);
      this.updateSelections();
    }

    AtomColorHighlightView.prototype.observeConfig = function() {
      this.subscriptions.add(atom.config.observe('atom-color-highlight.hideMarkersInComments', this.rebuildMarkers));
      this.subscriptions.add(atom.config.observe('atom-color-highlight.hideMarkersInStrings', this.rebuildMarkers));
      this.subscriptions.add(atom.config.observe('atom-color-highlight.markersAtEndOfLine', this.rebuildMarkers));
      this.subscriptions.add(atom.config.observe('atom-color-highlight.dotMarkersSize', this.rebuildMarkers));
      this.subscriptions.add(atom.config.observe('atom-color-highlight.dotMarkersSpading', this.rebuildMarkers));
      this.subscriptions.add(atom.config.observe('editor.lineHeight', this.rebuildMarkers));
      return this.subscriptions.add(atom.config.observe('editor.fontSize', this.rebuildMarkers));
    };

    AtomColorHighlightView.prototype.setModel = function(model) {
      this.unsubscribeFromModel();
      this.model = model;
      return this.subscribeToModel();
    };

    AtomColorHighlightView.prototype.setEditorView = function(editorElement) {
      this.editorElement = editorElement;
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
      this.subscriptions.add(this.editor.onDidDestroy(this.editorDestroyed));
      this.subscriptions.add(this.editor.onDidAddCursor(this.requestSelectionUpdate));
      this.subscriptions.add(this.editor.onDidRemoveCursor(this.requestSelectionUpdate));
      this.subscriptions.add(this.editor.onDidChangeCursorPosition(this.requestSelectionUpdate));
      this.subscriptions.add(this.editor.onDidAddSelection(this.requestSelectionUpdate));
      this.subscriptions.add(this.editor.onDidRemoveSelection(this.requestSelectionUpdate));
      return this.subscriptions.add(this.editor.onDidChangeSelectionRange(this.requestSelectionUpdate));
    };

    AtomColorHighlightView.prototype.editorDestroyed = function() {
      return this.destroy();
    };

    AtomColorHighlightView.prototype.requestSelectionUpdate = function() {
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
      this.unsubscribeFromModel();
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
              editorElement: this.editorElement,
              editor: this.editor,
              marker: marker,
              markersByRows: markersByRows
            });
            sortedMarkers.push(markerView);
          } else {
            markerView = new MarkerView({
              editorElement: this.editorElement,
              editor: this.editor,
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
            editorElement: this.editorElement,
            marker: marker,
            markersByRows: markersByRows
          });
        } else {
          markerView = new MarkerView({
            editorElement: this.editorElement,
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVIQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQSxPQUFZLE9BQUEsQ0FBUSxXQUFSLENBQVosRUFBQyxZQUFBLElBQUQsRUFBTyxTQUFBLENBRFAsQ0FBQTs7QUFBQSxFQUVDLGFBQWMsT0FBQSxDQUFRLFVBQVIsRUFBZCxVQUZELENBQUE7O0FBQUEsRUFHQSxRQUFvQyxPQUFBLENBQVEsV0FBUixDQUFwQyxFQUFDLDRCQUFBLG1CQUFELEVBQXNCLG1CQUFBLFVBSHRCLENBQUE7O0FBQUEsRUFLQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGVBQVIsQ0FMYixDQUFBOztBQUFBLEVBTUEsYUFBQSxHQUFnQixPQUFBLENBQVEsbUJBQVIsQ0FOaEIsQ0FBQTs7QUFBQSxFQVFBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSiw2Q0FBQSxDQUFBOztBQUFBLElBQUEsVUFBVSxDQUFDLFdBQVgsQ0FBdUIsc0JBQXZCLENBQUEsQ0FBQTs7QUFBQSxJQUVBLHNCQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTyxzQkFBUDtPQUFMLEVBRFE7SUFBQSxDQUZWLENBQUE7O0FBS2EsSUFBQSxnQ0FBQyxLQUFELEVBQVMsTUFBVCxFQUFpQixhQUFqQixHQUFBO0FBQ1gsTUFEbUIsSUFBQyxDQUFBLFNBQUEsTUFDcEIsQ0FBQTtBQUFBLDZEQUFBLENBQUE7QUFBQSw2REFBQSxDQUFBO0FBQUEsaUVBQUEsQ0FBQTtBQUFBLDZFQUFBLENBQUE7QUFBQSwrREFBQSxDQUFBO0FBQUEsTUFBQSx5REFBQSxTQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0Es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
//# sourceURL=/Users/andytlr/.atom/packages/atom-color-highlight/lib/atom-color-highlight-view.coffee