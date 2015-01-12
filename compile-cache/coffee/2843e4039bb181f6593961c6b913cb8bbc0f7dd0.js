(function() {
  var ProjectColorsResultsView, ScrollView,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ScrollView = require('atom-space-pen-views').ScrollView;

  module.exports = ProjectColorsResultsView = (function(_super) {
    __extends(ProjectColorsResultsView, _super);

    function ProjectColorsResultsView() {
      return ProjectColorsResultsView.__super__.constructor.apply(this, arguments);
    }

    ProjectColorsResultsView.content = function() {
      return this.div({
        "class": 'preview-pane pane-item'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'panel-heading'
          }, function() {
            _this.span({
              outlet: 'previewCount',
              "class": 'preview-count inline-block'
            });
            return _this.div({
              outlet: 'loadingMessage',
              "class": 'inline-block'
            }, function() {
              _this.div({
                "class": 'loading loading-spinner-tiny inline-block'
              });
              return _this.div({
                outlet: 'searchedCountBlock',
                "class": 'inline-block'
              }, function() {
                _this.span({
                  outlet: 'searchedCount',
                  "class": 'searched-count'
                });
                return _this.span(' paths searched');
              });
            });
          });
          return _this.ol({
            outlet: 'resultsList',
            "class": 'search-colors-results results-view list-tree focusable-panel has-collapsable-children',
            tabindex: -1
          });
        };
      })(this));
    };

    ProjectColorsResultsView.prototype.initialize = function() {
      ProjectColorsResultsView.__super__.initialize.apply(this, arguments);
      this.files = 0;
      this.colors = 0;
      return this.loadingMessage.hide();
    };

    ProjectColorsResultsView.prototype.getTitle = function() {
      return 'Project Colors Search';
    };

    ProjectColorsResultsView.prototype.getURI = function() {
      return 'palette://search';
    };

    ProjectColorsResultsView.prototype.appendResult = function(res) {
      this.files++;
      this.colors += res.results.length;
      this.resultsList.append(res);
      return this.previewCount.html(this.getCountMessage());
    };

    ProjectColorsResultsView.prototype.searchComplete = function() {
      this.previewCount.html(this.getCountMessage());
      if (this.colors === 0) {
        this.addClass('no-results');
        return this.resultsList.after("<ul class='centered background-message no-results-overlay'>\n  <li>No Results</li>\n</ul>");
      }
    };

    ProjectColorsResultsView.prototype.getCountMessage = function() {
      var filesString;
      filesString = this.files === 1 ? 'file' : 'files';
      if (this.colors > 0) {
        return "<span class='text-info'>" + this.colors + " colors</span> found in <span class='text-info'>" + this.files + " " + filesString + "</span>";
      } else {
        return "No colors found in " + this.files + " " + filesString;
      }
    };

    return ProjectColorsResultsView;

  })(ScrollView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG9DQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxhQUFjLE9BQUEsQ0FBUSxzQkFBUixFQUFkLFVBQUQsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSiwrQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSx3QkFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxPQUFBLEVBQU8sd0JBQVA7T0FBTCxFQUFzQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQ3BDLFVBQUEsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsT0FBQSxFQUFPLGVBQVA7V0FBTCxFQUE2QixTQUFBLEdBQUE7QUFDM0IsWUFBQSxLQUFDLENBQUEsSUFBRCxDQUFNO0FBQUEsY0FBQSxNQUFBLEVBQVEsY0FBUjtBQUFBLGNBQXdCLE9BQUEsRUFBTyw0QkFBL0I7YUFBTixDQUFBLENBQUE7bUJBQ0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLGNBQUEsTUFBQSxFQUFRLGdCQUFSO0FBQUEsY0FBMEIsT0FBQSxFQUFPLGNBQWpDO2FBQUwsRUFBc0QsU0FBQSxHQUFBO0FBQ3BELGNBQUEsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLGdCQUFBLE9BQUEsRUFBTywyQ0FBUDtlQUFMLENBQUEsQ0FBQTtxQkFDQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsZ0JBQUEsTUFBQSxFQUFRLG9CQUFSO0FBQUEsZ0JBQThCLE9BQUEsRUFBTyxjQUFyQztlQUFMLEVBQTBELFNBQUEsR0FBQTtBQUN4RCxnQkFBQSxLQUFDLENBQUEsSUFBRCxDQUFNO0FBQUEsa0JBQUEsTUFBQSxFQUFRLGVBQVI7QUFBQSxrQkFB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
//# sourceURL=/Users/andytlr/.atom/packages/project-palette-finder/lib/project-colors-results-view.coffee