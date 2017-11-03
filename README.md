# tldr-node-client

[![NPM version][npm-image]][npm-url]
[![Travs CI Build Status][travis-image]][travis-url]
[![AppVeyor CI Build status][appveyor-image]][appveyor-url]
[![Gitter chat][gitter-image]][gitter-url]
[![Snap Status](https://build.snapcraft.io/badge/tldr-pages/tldr-node-client.svg)](https://build.snapcraft.io/user/tldr-pages/tldr-node-client)

A `Node.js` based command-line client for [tldr](https://github.com/tldr-pages/tldr).

![tldr screenshot](screenshot.png)
*tldr-node-client's output for the `tar` page, using a custom color theme*

## Installing

```bash
npm install -g tldr
```

## Install from the snap store

In any of the [supported Linux distros](https://snapcraft.io/docs/core/install):

```bash
sudo snap install tldr --edge
```

(Note that this is an experimental and unstable release, at the moment)

## Usage

To see tldr pages:

- `tldr <command>` show examples for this command
- `tldr <command> --os=<platform>` show command page for the given platform (`linux`, `osx`, `sunos`)
- `tldr --linux <command>` show command page for Linux
- `tldr  --osx <command>` show command page for OSX
- `tldr --sunos <command>` show command page for SunOS
- `tldr --list` show all pages for current platform
- `tldr --list-all` show all available pages
- `tldr --random` show a page at random
- `tldr --random-example` show a single random example
- `tldr --markdown` show the original markdown format page

The client caches a copy of all pages locally, in `~/.tldr`.
There are more commands to control the local cache:

- `tldr --update` download the latest pages
- `tldr --clear-cache` delete the entire local cache

As a contributor, you might also need the following commands:

- `tldr --render <path>` render a local page for testing purposes

## Configuration

You can configure the `tldr` client by adding a `.tldrrc` file in your HOME directory. You can copy the contents of the `config.json` file from the repo to get the basic structure to start with, and modify it to suit your needs.

The default color theme is the one named `"simple"`. You can change the theme by assigning a different value to the `"theme"` variable -- either to one of the pre-configured themes, or to a new theme that you have previously created in the `"themes"` section. Note that the colors and text effects you can choose are limited. Refer to the [chalk documentation](https://github.com/chalk/chalk#styles) for all options.

```json
{
  "themes": {
    "ocean": {
      "commandName": "bold, cyan",
      "mainDescription": "",
      "exampleDescription": "green",
      "exampleCode": "cyan",
      "exampleToken": "dim"
    },
    "myOwnCoolTheme": {
      "commandName": "bold, red",
      "mainDescription": "underline",
      "exampleDescription": "yellow",
      "exampleCode": "underline, green",
      "exampleToken": ""
    }
  },
  "theme": "ocean"
}
```

If you regularly need pages for a different platform (e.g. Linux),
you can put it in the config file:

```json
{
  "platform": "linux"
}
```

The default platform value can be overwritten with command-line option:

```shell
tldr du --os=osx
```

As a contributor, you can also point to your own fork or branch:

```js
{
  "repository" : "myfork/tldr",
  // or
  "repository" : "myfork/tldr#mybranch",
}
```

## Command-line Autocompletion

Currently we only support command-line autocompletion for zsh.
Pull requests for other shells are most welcome!

### zsh

It's easiest for
[oh-my-zsh](https://github.com/robbyrussell/oh-my-zsh)
users, so let's start with that.

```
mkdir -p $ZSH_CUSTOM/plugins/tldr
ln -s bin/autocompletion.zsh $ZSH_CUSTOM/plugins/tldr/_tldr
```

Then add tldr to your oh-my-zsh plugins,
usually defined in `~/.zshrc`,
resulting in something looking like this:

```
plugins=(git tmux tldr)
```

Fret not regular zsh user!
Copy or symlink `bin/autocompletion.zsh` to
`my/completions/_tldr`
(note the filename).
Then add the containing directory to your fpath:
```
fpath = (my/completions $fpath)
```

## FAQ

#### `npm install -g tldr` throws an error

You probably have a permission problem, which you can solve [Here](https://docs.npmjs.com/getting-started/fixing-npm-permissions).

#### Colors under Cygwin

Colors can't be shown under Mintty or PuTTY, because the dependency `colors.js` has a bug.
Please show support to [this pull request](https://github.com/Marak/colors.js/pull/154), so it can be merged.

Meanwhile, you can do one of the following to fix this issue:

* Add the following script to your shell's rc file (`.zshrc`, `.bashrc`, etc.): (RECOMMENDED)

```bash
tldr_path="$(which tldr)"
function tldr() {
	eval "$tldr_path" $@ "--color"
}
```
* Add `alias tldr="tldr --color=true"` to your shell's rc file.
* Prepend `process.stdout.isTTY = true;` to `tldr.js` (NOT RECOMMENDED)
* Fix `colors.js`'s logic (NOT RECOMMENDED)
  * Go to `%appdata%\npm\node_modules\tldr\node_modules\colors\lib\system\`
  * Overwrite `supports-colors.js` with [supports-colors.js](https://raw.githubusercontent.com/RShadowhand/colors.js/master/lib/system/supports-colors.js) from my repo.
* Use `CMD.exe`.

## Contributing

Contribution are most welcome!
Have a look [over here](https://github.com/tldr-pages/tldr-node-client/blob/master/.github/CONTRIBUTING.md)
for a few rough guidelines.

[npm-url]: https://www.npmjs.com/package/tldr
[npm-image]: https://img.shields.io/npm/v/tldr.svg

[travis-url]: https://travis-ci.org/tldr-pages/tldr-node-client
[travis-image]: https://img.shields.io/travis/tldr-pages/tldr-node-client.svg?label=linux

[appveyor-image]: https://img.shields.io/appveyor/ci/igorshubovych/tldr-node-client-bnut4.svg?label=windows
[appveyor-url]: https://ci.appveyor.com/project/igorshubovych/tldr-node-client-bnut4

[dep-url]: https://david-dm.org/tldr-pages/tldr-node-client
[dep-image]: https://david-dm.org/tldr-pages/tldr-node-client.svg?theme=shields.io

[dev-dep-url]: https://david-dm.org/tldr-pages/tldr-node-client#info=devDependencies
[dev-dep-image]: https://david-dm.org/tldr-pages/tldr-node-client/dev-status.svg?theme=shields.io

[gitter-url]: https://gitter.im/tldr-pages/tldr
[gitter-image]: https://badges.gitter.im/tldr-pages/tldr.png
