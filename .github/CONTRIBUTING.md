# Contributing

Contribution are most welcome!
We've already accepted a lot of new features, command-line flags, and general bug fixes.

That being said, if it's something sizeable or a brand new feature,
it's a good idea to open an issue beforehand to discuss it openly and gather some feedback.

## Quick design notes

```
bin/tldr
  |
lib/tldr
  |
  | --> platform --> cache --> remote
  |
  | --> parser --> render
```

## Dev notes

The best way to submit a change is a pull-request from a feature branch.
Once you've cloned the project:

```bash
$ git checkout -b fix-for-blah
$ npm install
$ npm test
```

Everything should be passing!
Don't forget to keep the tests green on your branch - or to add some where necessary.

## License

`tldr-node-client` is under MIT license, which means you're free to modify or redistribute the source.
That being said, but why not contribute over here? :)

Also, if you create a new client, don't forget to ping us at
[tldr-pages](https://github.com/tldr-pages) so we can add it to the organisation &amp; in the README.
