(function() {
  var $, $$, EditorView, FancyNewFileView, View, fs, mkdirp, path, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom'), $ = _ref.$, $$ = _ref.$$, View = _ref.View, EditorView = _ref.EditorView;

  fs = require('fs');

  path = require('path');

  mkdirp = require('mkdirp');

  module.exports = FancyNewFileView = (function(_super) {
    __extends(FancyNewFileView, _super);

    function FancyNewFileView() {
      return FancyNewFileView.__super__.constructor.apply(this, arguments);
    }

    FancyNewFileView.prototype.fancyNewFileView = null;

    FancyNewFileView.configDefaults = {
      suggestCurrentFilePath: false
    };

    FancyNewFileView.activate = function(state) {
      return this.fancyNewFileView = new FancyNewFileView(state.fancyNewFileViewState);
    };

    FancyNewFileView.deactivate = function() {
      return this.fancyNewFileView.detach();
    };

    FancyNewFileView.content = function(params) {
      return this.div({
        "class": 'fancy-new-file overlay from-top'
      }, (function(_this) {
        return function() {
          _this.p({
            outlet: 'message',
            "class": 'icon icon-file-add'
          }, "Enter the path for the new file/directory. Directories end with a '" + path.sep + "'.");
          _this.subview('miniEditor', new EditorView({
            mini: true
          }));
          return _this.ul({
            "class": 'list-group',
            outlet: 'directoryList'
          });
        };
      })(this));
    };

    FancyNewFileView.detaching = false;

    FancyNewFileView.prototype.initialize = function(serializeState) {
      var consumeKeypress;
      atom.workspaceView.command("fancy-new-file:toggle", (function(_this) {
        return function() {
          return _this.toggle();
        };
      })(this));
      this.miniEditor.setPlaceholderText(path.join('path', 'to', 'file.txt'));
      this.on('core:confirm', (function(_this) {
        return function() {
          return _this.confirm();
        };
      })(this));
      this.on('core:cancel', (function(_this) {
        return function() {
          return _this.detach();
        };
      })(this));
      this.miniEditor.hiddenInput.on('focusout', (function(_this) {
        return function() {
          if (!_this.detaching) {
            return _this.detach();
          }
        };
      })(this));
      consumeKeypress = (function(_this) {
        return function(ev) {
          ev.preventDefault();
          return ev.stopPropagation();
        };
      })(this);
      this.miniEditor.getEditor().getBuffer().on('changed', (function(_this) {
        return function(ev) {
          return _this.update();
        };
      })(this));
      this.miniEditor.on('keydown', (function(_this) {
        return function(ev) {
          if (ev.keyCode === 9) {
            return consumeKeypress(ev);
          }
        };
      })(this));
      return this.miniEditor.on('keyup', (function(_this) {
        return function(ev) {
          if (ev.keyCode === 9) {
            consumeKeypress(ev);
            return _this.autocomplete(_this.miniEditor.getEditor().getText());
          }
        };
      })(this));
    };

    FancyNewFileView.prototype.referenceDir = function() {
      var homeDir;
      homeDir = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
      return atom.project.getPath() || homeDir;
    };

    FancyNewFileView.prototype.inputPath = function() {
      var input;
      input = this.miniEditor.getEditor().getText();
      return path.join(this.referenceDir(), input.substr(0, input.lastIndexOf(path.sep)));
    };

    FancyNewFileView.prototype.getDirs = function(callback) {
      var input;
      input = this.miniEditor.getEditor().getText();
      return fs.readdir(this.inputPath(), (function(_this) {
        return function(err, files) {
          files = files != null ? files.filter(function(fileName) {
            var fragment, isDir;
            fragment = input.substr(input.lastIndexOf(path.sep) + 1, input.length);
            isDir = fs.statSync(path.join(_this.inputPath(), fileName)).isDirectory();
            return isDir && fileName.toLowerCase().indexOf(fragment) === 0;
          }) : void 0;
          return callback.apply(_this, [files]);
        };
      })(this));
    };

    FancyNewFileView.prototype.autocomplete = function(str) {
      return this.getDirs(function(files) {
        var newPath, relativePath;
        if ((files != null ? files.length : void 0) === 1) {
          newPath = path.join(this.inputPath(), files[0]);
          relativePath = atom.project.relativize(newPath) + path.sep;
          return this.miniEditor.getEditor().setText(relativePath);
        } else {
          return atom.beep();
        }
      });
    };

    FancyNewFileView.prototype.update = function() {
      this.getDirs(function(files) {
        return this.renderDirList(files);
      });
      if (/\/$/.test(this.miniEditor.getEditor().getText())) {
        return this.setMessage('file-directory-create');
      } else {
        return this.setMessage('file-add');
      }
    };

    FancyNewFileView.prototype.setMessage = function(icon, str) {
      this.message.removeClass('icon' + ' icon-file-add' + ' icon-file-directory-create' + ' icon-alert');
      if (icon != null) {
        this.message.addClass('icon icon-' + icon);
      }
      return this.message.text(str || "Enter the path for the new file/directory. Directories end with a '" + path.sep + "'.");
    };

    FancyNewFileView.prototype.renderDirList = function(dirs) {
      this.directoryList.empty();
      return dirs != null ? dirs.forEach((function(_this) {
        return function(file) {
          return _this.directoryList.append($$(function() {
            this.li({
              "class": 'list-item'
            }, (function(_this) {
              return function() {};
            })(this));
            return this.span({
              "class": 'icon icon-file-directory'
            }, file);
          }));
        };
      })(this)) : void 0;
    };

    FancyNewFileView.prototype.confirm = function() {
      var error, pathToCreate, relativePath;
      relativePath = this.miniEditor.getEditor().getText();
      pathToCreate = path.join(this.referenceDir(), relativePath);
      try {
        if (/\/$/.test(relativePath)) {
          mkdirp(pathToCreate);
        } else {
          atom.open({
            pathsToOpen: [pathToCreate]
          });
        }
      } catch (_error) {
        error = _error;
        this.setMessage('alert', error.message);
      }
      return this.detach();
    };

    FancyNewFileView.prototype.detach = function() {
      var miniEditorFocused;
      if (!this.hasParent()) {
        return;
      }
      this.detaching = true;
      this.miniEditor.getEditor().setText('');
      this.setMessage();
      this.directoryList.empty();
      miniEditorFocused = this.miniEditor.isFocused;
      FancyNewFileView.__super__.detach.apply(this, arguments);
      if (miniEditorFocused) {
        this.restoreFocus();
      }
      return this.detaching = false;
    };

    FancyNewFileView.prototype.attach = function() {
      this.suggestPath();
      this.previouslyFocusedElement = $(':focus');
      atom.workspaceView.append(this);
      this.miniEditor.focus();
      return this.getDirs(function(files) {
        return this.renderDirList(files);
      });
    };

    FancyNewFileView.prototype.suggestPath = function() {
      var activeDir, activePath, suggestedPath, _ref1;
      if (atom.config.get('fancy-new-file.suggestCurrentFilePath')) {
        activePath = (_ref1 = atom.workspace.getActiveEditor()) != null ? _ref1.getPath() : void 0;
        if (activePath) {
          activeDir = path.dirname(activePath) + '/';
          suggestedPath = path.relative(this.referenceDir(), activeDir);
          return this.miniEditor.getEditor().setText(suggestedPath + '/');
        }
      }
    };

    FancyNewFileView.prototype.toggle = function() {
      if (this.hasParent()) {
        return this.detach();
      } else {
        return this.attach();
      }
    };

    FancyNewFileView.prototype.restoreFocus = function() {
      var _ref1;
      if ((_ref1 = this.previouslyFocusedElement) != null ? _ref1.isOnDom() : void 0) {
        return this.previouslyFocusedElement.focus();
      } else {
        return atom.workspaceView.focus();
      }
    };

    return FancyNewFileView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlFQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxPQUE0QixPQUFBLENBQVEsTUFBUixDQUE1QixFQUFDLFNBQUEsQ0FBRCxFQUFJLFVBQUEsRUFBSixFQUFRLFlBQUEsSUFBUixFQUFjLGtCQUFBLFVBQWQsQ0FBQTs7QUFBQSxFQUNBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQURMLENBQUE7O0FBQUEsRUFFQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FGUCxDQUFBOztBQUFBLEVBR0EsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSLENBSFQsQ0FBQTs7QUFBQSxFQUtBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSix1Q0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsK0JBQUEsZ0JBQUEsR0FBa0IsSUFBbEIsQ0FBQTs7QUFBQSxJQUNBLGdCQUFDLENBQUEsY0FBRCxHQUNFO0FBQUEsTUFBQSxzQkFBQSxFQUF3QixLQUF4QjtLQUZGLENBQUE7O0FBQUEsSUFJQSxnQkFBQyxDQUFBLFFBQUQsR0FBVyxTQUFDLEtBQUQsR0FBQTthQUNULElBQUMsQ0FBQSxnQkFBRCxHQUF3QixJQUFBLGdCQUFBLENBQWlCLEtBQUssQ0FBQyxxQkFBdkIsRUFEZjtJQUFBLENBSlgsQ0FBQTs7QUFBQSxJQU9BLGdCQUFDLENBQUEsVUFBRCxHQUFhLFNBQUEsR0FBQTthQUNYLElBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxNQUFsQixDQUFBLEVBRFc7SUFBQSxDQVBiLENBQUE7O0FBQUEsSUFVQSxnQkFBQyxDQUFBLE9BQUQsR0FBVSxTQUFDLE1BQUQsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTyxpQ0FBUDtPQUFMLEVBQStDLENBQUEsU0FBQSxLQUFBLEdBQUE7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
//# sourceURL=/Users/andytlr/.atom/packages/fancy-new-file/lib/fancy-new-file-view.coffee