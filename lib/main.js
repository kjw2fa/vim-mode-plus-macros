"use babel";

const { CompositeDisposable } = require("atom");
const {
  characterCommands,
  recordCommand,
  loadVmpCommands
} = require("./vim-mode-plus-macros");

module.exports = {
  activate() {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(
      atom.commands.add("atom-workspace", characterCommands)
    );

    atom.commands.onDidDispatch(recordCommand);
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  consumeVim(service) {
    const commands = loadVmpCommands(service);
    for (const command of Object.values(commands)) {
      command.commandPrefix = "vim-mode-plus-macros";
      this.subscriptions.add(command.registerCommand());
    }
  }
};
