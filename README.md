# tldr-node-client

[![NPM version][npm-image]][npm-url]
[![Travs CI Build Status][travis-image]][travis-url]
[![AppVeyor CI Build status][appveyor-image]][appveyor-url]
[![David DM Dependency Status][dep-image]][dep-url]
[![David DM devDependency Status][dev-dep-image]][dev-dep-url]
[![Gitter chat][gitter-image]][gitter-url]

A `Node.js` based command-line client for [tldr](https://github.com/tldr-pages/tldr).

![tldr screenshot](http://raw.github.com/tldr-pages/tldr-node-client/master/screenshot.png)

## Installing

```bash
$ npm install -g tldr
```

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

The client caches a copy of all pages locally, in `~/.tldr`.
There are more commands to control the local cache:

- `tldr --update` download the latest pages
- `tldr --clear-cache` delete the entire local cache

As a contributor, you might also need the following commands:

- `tldr --render <path>` render a local page for testing purposes

## Configuration

You can configure the `tldr` client by adding a `.tldrrc` file in your HOME directory.
This file has to be valid JSON:

```json
{
  "colors": {
    "text": "green",
    "command-background": "black",
    "command-foreground": "red",
    "command-token": "white"
  }
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

## Contributing

Contribution are most welcome!
Have a look [over here](https://github.com/tldr-pages/tldr-node-client/blob/master/CONTRIBUTING.md)
for a few rough guidelines.

[npm-url]: https://www.npmjs.com/package/tldr
[npm-image]: https://img.shields.io/npm/v/tldr.svg

[travis-url]: https://travis-ci.org/tldr-pages/tldr-node-client
[travis-image]: https://img.shields.io/travis/tldr-pages/tldr-node-client.svg

[appveyor-image]: https://ci.appveyor.com/api/projects/status/8n8ge8cei0rfs0q5?svg=true
[appveyor-url]: https://ci.appveyor.com/project/tldr-pages/tldr-node-client

[dep-url]: https://david-dm.org/tldr-pages/tldr-node-client
[dep-image]: https://david-dm.org/tldr-pages/tldr-node-client.svg?theme=shields.io

[dev-dep-url]: https://david-dm.org/tldr-pages/tldr-node-client#info=devDependencies
[dev-dep-image]: https://david-dm.org/tldr-pages/tldr-node-client/dev-status.svg?theme=shields.io

[gitter-url]: https://gitter.im/tldr-pages/tldr
[gitter-image]: https://badges.gitter.im/tldr-pages/tldr.png
