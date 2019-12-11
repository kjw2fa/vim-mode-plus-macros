"use babel";

const { CompositeDisposable } = require("atom");
const {
  recordCommand,
  typeCharacter,
  loadVmpCommands
} = require("./vim-mode-plus-macros");

module.exports = {
  activate() {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

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
