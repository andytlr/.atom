(function() {
  var actionDecorator, atomActionName, editorProxy, emmet, emmetActions, fs, getUserHome, interactive, loadExtensions, multiSelectionActionDecorator, path, registerInteractiveActions, resources, runAction, singleSelectionActions, toggleCommentSyntaxes;

  path = require('path');

  fs = require('fs');

  emmet = require('emmet');

  emmetActions = require('emmet/lib/action/main');

  resources = require('emmet/lib/assets/resources');

  editorProxy = require('./editor-proxy');

  interactive = require('./interactive');

  singleSelectionActions = ['prev_edit_point', 'next_edit_point', 'merge_lines', 'reflect_css_value', 'select_next_item', 'select_previous_item', 'wrap_with_abbreviation', 'update_tag'];

  toggleCommentSyntaxes = ['html', 'css', 'less', 'scss'];

  getUserHome = function() {
    if (process.platform === 'win32') {
      return process.env.USERPROFILE;
    }
    return process.env.HOME;
  };

  actionDecorator = function(action) {
    return function(editorView, evt) {
      editorProxy.setup(editorView);
      return editorProxy.editor.transact((function(_this) {
        return function() {
          return runAction(action, evt);
        };
      })(this));
    };
  };

  multiSelectionActionDecorator = function(action) {
    return function(editorView, evt) {
      editorProxy.setup(editorView);
      return editorProxy.editor.transact((function(_this) {
        return function() {
          return editorProxy.exec(function(i) {
            runAction(action, evt);
            if (evt.keyBindingAborted) {
              return false;
            }
          });
        };
      })(this));
    };
  };

  runAction = function(action, evt) {
    var activeEditor, result, se, syntax;
    syntax = editorProxy.getSyntax();
    if (action === 'expand_abbreviation_with_tab') {
      activeEditor = editorProxy.editor;
      if (!resources.hasSyntax(syntax) || !activeEditor.getSelection().isEmpty()) {
        return evt.abortKeyBinding();
      }
      if (activeEditor.snippetExpansion) {
        se = activeEditor.snippetExpansion;
        if (se.tabStopIndex + 1 >= se.tabStopMarkers.length) {
          se.destroy();
        } else {
          return evt.abortKeyBinding();
        }
      }
    }
    if (action === 'toggle_comment' && toggleCommentSyntaxes.indexOf(syntax) === -1) {
      return evt.abortKeyBinding();
    }
    if (action === 'insert_formatted_line_break_only') {
      if (syntax !== 'html' || !atom.config.get('emmet.formatLineBreaks')) {
        return evt.abortKeyBinding();
      }
      result = emmet.run(action, editorProxy);
      if (!result) {
        return evt.abortKeyBinding();
      } else {
        return true;
      }
    }
    return emmet.run(action, editorProxy);
  };

  atomActionName = function(name) {
    return 'emmet:' + name.replace(/_/g, '-');
  };

  registerInteractiveActions = function(actions) {
    var name, _i, _len, _ref, _results;
    _ref = ['wrap_with_abbreviation', 'update_tag', 'interactive_expand_abbreviation'];
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      name = _ref[_i];
      _results.push((function(name) {
        var atomAction;
        atomAction = atomActionName(name);
        return actions[atomAction] = function(editorView, evt) {
          editorProxy.setup(editorView);
          return interactive.run(name, editorProxy);
        };
      })(name));
    }
    return _results;
  };

  loadExtensions = function() {
    var extPath, files;
    extPath = atom.config.get('emmet.extensionsPath');
    console.log('Loading Emmet extensions from', extPath);
    if (!extPath) {
      return;
    }
    if (extPath[0] === '~') {
      extPath = getUserHome() + extPath.substr(1);
    }
    if (fs.existsSync(extPath)) {
      emmet.resetUserData();
      files = fs.readdirSync(extPath);
      files = files.map(function(item) {
        return path.join(extPath, item);
      }).filter(function(file) {
        return !fs.statSync(file).isDirectory();
      });
      return emmet.loadExtensions(files);
    } else {
      return console.warn('Emmet: no such extension folder:', extPath);
    }
  };

  module.exports = {
    editorSubscription: null,
    configDefaults: {
      extensionsPath: '~/emmet',
      formatLineBreaks: true
    },
    activate: function(state) {
      var action, atomAction, cmd, _i, _len, _ref;
      this.state = state;
      if (!this.actions) {
        atom.config.observe('emmet.extensionsPath', loadExtensions);
        this.actions = {};
        registerInteractiveActions(this.actions);
        _ref = emmetActions.getList();
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          action = _ref[_i];
          atomAction = atomActionName(action.name);
          if (this.actions[atomAction] != null) {
            continue;
          }
          cmd = singleSelectionActions.indexOf(action.name) !== -1 ? actionDecorator(action.name) : multiSelectionActionDecorator(action.name);
          this.actions[atomAction] = cmd;
        }
      }
      return this.editorViewSubscription = atom.workspaceView.eachEditorView((function(_this) {
        return function(editorView) {
          var name, _ref1, _results;
          if (editorView.attached && !editorView.mini) {
            _ref1 = _this.actions;
            _results = [];
            for (name in _ref1) {
              action = _ref1[name];
              _results.push((function(name, action) {
                return editorView.command(name, function(e) {
                  return action(editorView, e);
                });
              })(name, action));
            }
            return _results;
          }
        };
      })(this));
    },
    deactivate: function() {
      var _ref;
      if ((_ref = this.editorViewSubscription) != null) {
        _ref.off();
      }
      return this.editorViewSubscription = null;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFQQUFBOztBQUFBLEVBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBQVAsQ0FBQTs7QUFBQSxFQUNBLEVBQUEsR0FBTyxPQUFBLENBQVEsSUFBUixDQURQLENBQUE7O0FBQUEsRUFHQSxLQUFBLEdBQWUsT0FBQSxDQUFRLE9BQVIsQ0FIZixDQUFBOztBQUFBLEVBSUEsWUFBQSxHQUFlLE9BQUEsQ0FBUSx1QkFBUixDQUpmLENBQUE7O0FBQUEsRUFLQSxTQUFBLEdBQWUsT0FBQSxDQUFRLDRCQUFSLENBTGYsQ0FBQTs7QUFBQSxFQU9BLFdBQUEsR0FBZSxPQUFBLENBQVEsZ0JBQVIsQ0FQZixDQUFBOztBQUFBLEVBUUEsV0FBQSxHQUFlLE9BQUEsQ0FBUSxlQUFSLENBUmYsQ0FBQTs7QUFBQSxFQVVBLHNCQUFBLEdBQXlCLENBQ3ZCLGlCQUR1QixFQUNKLGlCQURJLEVBQ2UsYUFEZixFQUV2QixtQkFGdUIsRUFFRixrQkFGRSxFQUVrQixzQkFGbEIsRUFHdkIsd0JBSHVCLEVBR0csWUFISCxDQVZ6QixDQUFBOztBQUFBLEVBZ0JBLHFCQUFBLEdBQXdCLENBQUMsTUFBRCxFQUFTLEtBQVQsRUFBZ0IsTUFBaEIsRUFBd0IsTUFBeEIsQ0FoQnhCLENBQUE7O0FBQUEsRUFrQkEsV0FBQSxHQUFjLFNBQUEsR0FBQTtBQUNaLElBQUEsSUFBRyxPQUFPLENBQUMsUUFBUixLQUFvQixPQUF2QjtBQUNFLGFBQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFuQixDQURGO0tBQUE7V0FHQSxPQUFPLENBQUMsR0FBRyxDQUFDLEtBSkE7RUFBQSxDQWxCZCxDQUFBOztBQUFBLEVBNkJBLGVBQUEsR0FBa0IsU0FBQyxNQUFELEdBQUE7V0FDaEIsU0FBQyxVQUFELEVBQWEsR0FBYixHQUFBO0FB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
//# sourceURL=/Users/andytlr/.atom/packages/emmet/lib/emmet.coffee