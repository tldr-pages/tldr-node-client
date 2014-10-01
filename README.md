[![Travis CI](https://api.travis-ci.org/tldr-pages/tldr-node-client.png)](https://travis-ci.org/tldr-pages/tldr-node-client) [![Dependency Status](https://david-dm.org/tldr-pages/tldr-node-client.png?theme=shields.io)](https://david-dm.org/tldr-pages/tldr-node-client) [![devDependency Status](https://david-dm.org/tldr-pages/tldr-node-client/dev-status.png?theme=shields.io)](https://david-dm.org/tldr-pages/tldr-node-client#info=devDependencies)

# tldr-node-client

A `Node.js` based command-line client for [tldr](https://github.com/tldr-pages/tldr).

![tldr screenshot](http://raw.github.com/tldr-pages/tldr-node-client/master/screenshot.png)

## Installing

[![NPM](https://nodei.co/npm/tldr.png)](https://www.npmjs.org/package/tldr)

```bash
$ npm install -g tldr
```

*Note: TLDR is still in early versions.
We try to minimise breaking changes, but if you run into issues
please try to download the latest package again.*

## Usage

To see tldr pages:

- `tldr <command>`
- `tldr --list` show all available pages
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
This file has to be valid JSON, and all entries are optional:

```json
{
  "repository" : "tldr-pages/tldr",
  "cache": "~/.tldr",
  "colors": {
    "text": "green",
    "command-background": "black",
    "command-foreground": "red",
    "command-token": "white"
  }
}
```

As a contributor, you can also point to your own fork or branch:

```json
"repository" : "myfork/tldr",
"repository" : "myfork/tldr#mybranch",
```

## Contributing

Contribution are most welcome!
Have a look [over here](https://github.com/tldr-pages/tldr-node-client/blob/master/CONTRIBUTING.md)
for a few rough guidelines.
