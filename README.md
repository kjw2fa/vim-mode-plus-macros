# Macros for vim mode plus

This package is still under construction, but the basic functionality works. You can create a single macro and apply it many times.

## Install

`apm install vim-mode-plus-macros` at the command line, or `ctrl-,`, click on install, then type vim-mode-plus-macros and click install.

Make sure you also have vim-mode-plus installed, this package requires it.

## Usage

`q` in normal mode to start recording a macro

`q` in normal mode while recording a macro to stop recording the macro

`@` to apply the macro

`[num]@` to apply the macro [num] times ex. `12@`

## Roadmap

- [x] a macro can be recorded
- [x] a macro can be replayed
- [x] macros can include typing in insert mode
- [x] indicate macro recording state to user
- [x] add searching with '/'
- [x] allow prefixing with number to replay
- [ ] add undoing the entire macro in one undo
- [ ] add searching with 'f', 'F', 't', 'T'
- [ ] macros can be saved to (and recalled from) the 26 letters (e.g. `qa` and `@a`)
- [ ] macros can be named and saved (maybe use a fuzzy finder?)
- [ ] specs
