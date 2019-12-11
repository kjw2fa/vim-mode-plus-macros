/** @babel */

import { CompositeDisposable } from "atom";

let commandQueue = [];
let recording = false;

module.exports = {
  recordCommand(event) {
    if (!recording) {
      return;
    }
    const ignoredCommands = new Set([
      "vim-mode-plus-macros:start-recording-macro",
      "vim-mode-plus-macros:apply-macro",
      "vim-mode-plus-macros:start-recording-macro"
    ]);

    const commandName = event.type;
    if (ignoredCommands.has(commandName)) {
      return;
    }
    commandQueue.push(commandName);
  },

  typeCharacter(character) {
    let editor = atom.workspace.getActiveTextEditor();
    const editorView = atom.views.getView(editor);
    const className = "vim-mode-plus-search-input-focused";
    if (editorView.classList.contains(className)) {
      const allEditors = atom.textEditors.editorsWithMaintainedConfig;
      allEditors.forEach(e => {
        if (e.mini) {
          editor = e;
          return;
        }
      });
    }
    editor.insertText(character);
  },

  // When Searching, getActiveTextEditor is incorrect.
  // This function correctly returns the active Text Editor
  activeEditor() {},

  loadVmpCommands({ Base }) {
    class ApplyMacro extends Base.getClass("MiscCommand") {
      applyMacro(count) {
        atom.notifications.addInfo("Applying macro");
        commandQueue.unshift("vim-mode-plus:reset-normal-mode");
        for (let i = 0; i < count; i++) {
          commandQueue.forEach(command => {
            atom.commands.dispatch(
              atom.views.getView(this.activeEditor()),
              command
            );
          });
        }
      }

      // When Searching, getActiveTextEditor is incorrect.
      // This function correctly returns the active Text Editor
      activeEditor() {
        let editor = atom.workspace.getActiveTextEditor();
        const editorView = atom.views.getView(editor);
        const className = "vim-mode-plus-search-input-focused";
        if (editorView.classList.contains(className)) {
          const allEditors = atom.textEditors.editorsWithMaintainedConfig;
          allEditors.forEach(e => {
            if (e.mini) {
              editor = e;
              return false;
            }
          });
        }
        return editor;
      }

      execute() {
        this.applyMacro(this.getCount());
      }
    }

    class StartRecordingMacro extends Base.getClass("MiscCommand") {
      startRecordingMacro() {
        const workspaceView = atom.views.getView(atom.workspace);
        workspaceView.classList.add("recording-macro");
        commandQueue = []; // empty the queue
        recording = true;
        atom.notifications.addInfo("Recording macro");
      }

      execute() {
        this.startRecordingMacro();
      }
    }

    class StopRecordingMacro extends Base.getClass("MiscCommand") {
      stopRecordingMacro() {
        const workspaceView = atom.views.getView(atom.workspace);
        workspaceView.classList.remove("recording-macro");
        recording = false;
        atom.notifications.addInfo("Stopped recording macro");
      }

      execute() {
        this.stopRecordingMacro();
      }
    }

    return {
      ApplyMacro,
      StartRecordingMacro,
      StopRecordingMacro
    };
  }
};
