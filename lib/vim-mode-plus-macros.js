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

const convertToCommand = (accumulator, character) => {
  const actualCharacter = character === "space" ? " " : character;
  accumulator[`vim-mode-plus-macros:insert-of-${character}`] = () =>
    typeCharacter(actualCharacter);
  return accumulator;
};
const characterCommands = characters.reduce(convertToCommand, {});

function recordCommand(event) {
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
}

function typeCharacter(character) {
  const editor = activeEditor();
  editor.insertText(character);
}

// When Searching, getActiveTextEditor is incorrect.
// This function correctly returns the active Text Editor
function activeEditor() {
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

function loadVmpCommands({ Base }) {
  class ApplyMacro extends Base.getClass("MiscCommand") {
    applyMacro(count) {
      atom.notifications.addInfo("Applying macro");
      commandQueue.unshift("vim-mode-plus:reset-normal-mode");
      for (let i = 0; i < count; i++) {
        commandQueue.forEach(command => {
          atom.commands.dispatch(atom.views.getView(activeEditor()), command);
        });
      }
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

module.exports = {
  characterCommands,
  recordCommand,
  loadVmpCommands
};
