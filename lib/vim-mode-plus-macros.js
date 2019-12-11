/** @babel */

import { CompositeDisposable } from "atom";

let commandQueue = [];
let recording = false;

// All the characters we record keypresses of
// prettier-ignore
const characters = [
  'space', '!', '"', '#', '$', '%', '&', '\'', '(', ')', '*', '+', ',', '-',
  '.', '/', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ':', ';', '<',
  '=', '>', '?', '@', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K',
  'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  '[', '\\', ']', '^', '_', '`', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i',
  'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x',
  'y', 'z', '{', '|', '}', '~'
]

const ignoredCommands = new Set([
  "vim-mode-plus-macros:start-recording-macro",
  "vim-mode-plus-macros:apply-macro",
  "vim-mode-plus-macros:start-recording-macro"
]);

export default {
  activate() {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    const convertToCommand = (accumulator, character) => {
      const actualCharacter = character === "space" ? " " : character;
      accumulator[`vim-mode-plus-macros:insert-of-${character}`] = () =>
        this.typeCharacter(actualCharacter);
      return accumulator;
    };
    const characterCommands = characters.reduce(convertToCommand, {});

    this.subscriptions.add(
      atom.commands.add(
        "atom-workspace",
        Object.assign(characterCommands, {
          "vim-mode-plus-macros:start-recording-macro": () =>
            this.startRecordingMacro(),
          "vim-mode-plus-macros:stop-recording-macro": () =>
            this.stopRecordingMacro()
        })
      )
    );

    atom.commands.onDidDispatch(this.recordCommand);
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  consumeVim(service) {
    class ApplyMacro extends service.getClass("MiscCommand") {
      static commandPrefix = "vim-mode-plus-macros";

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
    this.subscriptions.add(ApplyMacro.registerCommand());
  },

  startRecordingMacro() {
    const workspaceView = atom.views.getView(atom.workspace);
    workspaceView.classList.add("recording-macro");
    commandQueue = []; // empty the queue
    recording = true;
    atom.notifications.addInfo("Recording macro");
  },

  stopRecordingMacro() {
    const workspaceView = atom.views.getView(atom.workspace);
    workspaceView.classList.remove("recording-macro");
    recording = false;
    atom.notifications.addInfo("Stopped recording macro");
  },

  recordCommand(event) {
    if (!recording) {
      return;
    }
    const commandName = event.type;
    if (ignoredCommands.has(commandName)) {
      return;
    }
    commandQueue.push(commandName);
  },

  typeCharacter(character) {
    const editor = this.activeEditor();
    editor.insertText(character);
  },

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
};
