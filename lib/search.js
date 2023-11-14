'use strict';

const fs = require('fs-extra');
const path = require('path');
const natural = require('natural');

const config = require('./config');
const utils = require('./utils');
const index = require('./index');
const platforms = require('./platforms');

const CACHE_FOLDER = path.join(config.get().cache, 'cache');

const filepath = CACHE_FOLDER + '/search-corpus.json';

let corpus = {};

corpus.fileWords = {};
corpus.fileLengths = {};
corpus.invertedIndex = {};
corpus.allTokens = new Set();
corpus.tfidf = {};

let query = {};

query.raw = null;
query.tokens = null;
query.frequency = {};
query.score = {};
query.ranks = [];

let getTokens = (data) => {
  let tokenizer = new natural.WordTokenizer();
  let tokens = tokenizer.tokenize(data);
  tokens.forEach((word, index) => {
    word = word.toLowerCase();
    word = natural.PorterStemmer.stem(word);
    tokens[index] = word;
  });

  return tokens;
};

let createFileIndex = (tokens, name) => {
  // Creates word frequency index for each file.
  corpus.fileWords[name] = {};
  tokens.forEach((word) => {
    corpus.allTokens.add(word);
    if (corpus.fileWords[name][word]) { // Word already exists. Increment count.
      corpus.fileWords[name][word]++;
    } else {
      corpus.fileWords[name][word] = 1;
    }
  });
};

let createInvertedIndex = (tokens) => {
  tokens.forEach((word) => {
    Object.keys(corpus.fileWords).forEach((name) => {
      if (corpus.fileWords[name][word]) {
        if (corpus.invertedIndex[word]) {
          corpus.invertedIndex[word].push(name);
        } else {
          corpus.invertedIndex[word] = [name];
        }
      }
    });
  });
};

let getTf = (word, filename) => {
  let worddata = corpus.fileWords[filename];
  let frequency = worddata[word] || 0;
  let length = 0;
  Object.keys(worddata).forEach((key) => {
    length += worddata[key];
  });
  let tf = frequency / length;
  return tf;
};

let getIdf = (word) => {
  let allFiles = Object.keys(corpus.fileWords).length;
  let wordFiles = corpus.invertedIndex[word].length;
  let idf = Math.log(allFiles / wordFiles);
  return idf;
};

let createTfIdf = () => {
  corpus.tfidf = {};
  Object.keys(corpus.fileWords).forEach((file) => {
    corpus.tfidf[file] = {};
    Object.keys(corpus.fileWords[file]).forEach((word) => {
      let tfidf = getTf(word, file) * getIdf(word);
      corpus.tfidf[file][word] = tfidf;
    });
  });
};

let processRawDocument = (data, name) => {
  let tokens = getTokens(data);
  createFileIndex(tokens, name);
};

let createFileLengths = () => {
  Object.keys(corpus.tfidf).forEach((name) => {
    let len = 0;
    Object.keys(corpus.tfidf[name]).forEach((word) => {
      len += corpus.tfidf[name][word] * corpus.tfidf[name][word];
    });
    corpus.fileLengths[name] = Math.sqrt(len);
  });
};

let writeCorpus = () => {
  corpus.allTokens = Array.from(corpus.allTokens);
  let json = JSON.stringify(corpus);
  return fs.writeFile(filepath, json, 'utf8')
    .then(() => {
      return Promise.resolve('JSON written to disk at: ' + filepath);
    })
    .catch((err) => {
      return Promise.reject(err);
    });
};

let readCorpus = () => {
  return fs.readFile(filepath, 'utf8')
    .then((data) => {
      corpus = JSON.parse(data.toString());
      return Promise.resolve();
    })
    .catch((err) => {
      return Promise.reject(err);
    });
};

let processQuery = (rawquery) => {
  query.raw = rawquery;
  query.tokens = getTokens(rawquery);
  //calculate word frequency in the query
  query.frequency = {};
  query.tokens.forEach((word) => {
    if (query.frequency[word]) { // Word already exists. Increment count.
      query.frequency[word]++;
    } else {
      query.frequency[word] = 1;
    }
  });
  let numberOfFiles = Object.keys(corpus.fileWords).length;
  // calculate score of each file for the query.
  query.score = {};
  query.tokens.forEach((word) => {
    if (corpus.invertedIndex[word]) {
      let logbase = 10;
      let df = corpus.invertedIndex[word].length;
      let idf = Math.log(numberOfFiles / df, logbase);
      let wordWeight = idf * (1 + Math.log(query.frequency[word], logbase));
      corpus.invertedIndex[word].forEach((file) => {
        let fileWeight = corpus.tfidf[file][word];
        if (query.score[file]) {
          query.score[file] += fileWeight * wordWeight;
        } else {
          query.score[file] = fileWeight * wordWeight;
        }
      });
    }
  });
  // rank the files by the score and sort
  Object.keys(query.score).forEach((file) => {
    query.score[file] = query.score[file] / corpus.fileLengths[file];
    let rankobj = {};
    rankobj.file = file;
    rankobj.score = query.score[file];
    query.ranks.push(rankobj);
  });
  query.ranks.sort((a, b) => {
    if (a.score > b.score) {
      return -1;
    }
    if (a.score < b.score) {
      return 1;
    }
    return 0;
  });
};

exports.printResults = (results, config) => {
  // Prints the passed results to the console.
  // If the command is not available for the current platform,
  // it lists the available platforms instead.
  // Example: tldr --search print directory tree --platform sunos prints:
  //              $ tree (Available on: linux, osx)
  index.getShortIndex().then((shortIndex) => {
    let outputs = new Set();
    let preferredPlatform = platforms.getPreferredPlatform(config);
    results.forEach((elem) => {
      let cmdname = utils.parsePagename(elem.file);
      let output = '    $ ' + cmdname;
      let targets = shortIndex[cmdname]['targets'];
      let platforms = targets.map((t) => {return t.platform;});
      if (platforms.indexOf('common') === -1 && platforms.indexOf(preferredPlatform) === -1) {
        output += ' (Available on: ' + platforms.join(', ') + ')';
      }
      outputs.add(output);
    });

    console.log('Searching for:', query.raw.trim());
    console.log();
    Array.from(outputs).forEach((elem) => {
      console.log(elem);
    });
    console.log();
    console.log('Run tldr <command> to see specific pages.');
  });
};

exports.createIndex = () => {
  return utils.glob(CACHE_FOLDER + '/pages/**/*.md', {})
    .then((files) => {
      let promises = [];
      files.forEach((file) => {
        let promise = fs.readFile(file).then((data) => {
          processRawDocument(data.toString(), file);
        });
        promises.push(promise);
      });
      return Promise.all(promises)
        .then(() => {
          createInvertedIndex(corpus.allTokens);
          createTfIdf();
          createFileLengths();
          return writeCorpus();
        })
        .then(() => {
          return Promise.resolve(corpus);
        })
        .catch((error) => {
          console.error('Error in creating corpus. Exiting.');
          return Promise.reject(error);
        });
    });
};

exports.getResults = (rawquery) => {
  query.ranks = [];
  return readCorpus()
    .then(() => {
      processQuery(rawquery);
      let resultcount = 10;
      let results = query.ranks.slice(0, resultcount);
      return Promise.resolve(results);
    })
    .catch((error) => {
      return Promise.reject(error);
    });
};
