'use strict';

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs-extra'));
const path = require('path');
const glob = Promise.promisify(require('glob'));
const natural = require('natural');

const config = require('./config');

const CACHE_FOLDER = path.join(config.get().cache, 'cache');

var filepath = CACHE_FOLDER + '/search-corpus.json';

var corpus = {};

corpus.fileWords = {};
corpus.fileLengths = {};
corpus.invertedIndex = {};
corpus.allTokens = new Set(); // eslint-disable-line
corpus.tfidf = {};

var query = {};

query.raw = null;
query.tokens = null;
query.frequency = {};
query.score = {};
query.ranks = [];

var getTokens = (data) => {
  var tokenizer = new natural.WordTokenizer();
  var tokens = tokenizer.tokenize(data);
  tokens.forEach((word, index) => {
    word = word.toLowerCase();
    word = natural.PorterStemmer.stem(word);
    tokens[index] = word;
  });

  return tokens;
};

var createFileIndex = (tokens, name) => {
  corpus.fileWords[name] = {};
  tokens.forEach(word => {
    corpus.allTokens.add(word);
    if (corpus.fileWords[name][word]) { // Word already exists. Increment count.
      corpus.fileWords[name][word]++;
    } else {
      corpus.fileWords[name][word] = 1;
    }
  });
};

var createInvertedIndex = function(tokens) {
  tokens.forEach(word => {
    Object.keys(corpus.fileWords).forEach(name => {
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

var getTf = function(word, filename) {
  var worddata = corpus.fileWords[filename];
  var frequency = frequency = worddata[word] || 0;
  var length = 0;
  Object.keys(worddata).forEach(key => {
    length += worddata[key];
  });
  var tf = frequency / length;
  return tf;
};

var getIdf = function(word) {
  var allFiles = Object.keys(corpus.fileWords).length;
  var wordFiles = corpus.invertedIndex[word].length;
  var idf = Math.log(allFiles / wordFiles);
  return idf;
};

var createTfIdf = function() {
  corpus.tfidf = {};
  Object.keys(corpus.fileWords).forEach(file => {
    corpus.tfidf[file] = {};
    Object.keys(corpus.fileWords[file]).forEach(word => {
      var tfidf = getTf(word, file) * getIdf(word);
      corpus.tfidf[file][word] = tfidf;
    });
  });
};

var processRawDocument = (data, name) => {
  var tokens = getTokens(data);
  createFileIndex(tokens, name);
};

var createFileLengths = () => {
  Object.keys(corpus.tfidf).forEach(name => {
    var len = 0;
    Object.keys(corpus.tfidf[name]).forEach(word => {
      len += corpus.tfidf[name][word] * corpus.tfidf[name][word];
    });
    corpus.fileLengths[name] = Math.sqrt(len);
  });
};

var writeCorpus = () => {
  corpus.allTokens = Array.from(corpus.allTokens);
  var json = JSON.stringify(corpus);
  return fs.writeFileAsync(filepath, json, 'utf8').then(() => {
    return Promise.resolve('JSON written to disk at: ' + filepath);
  });
};

var readCorpus = () => {
  return fs.readFileAsync(filepath, 'utf8').then(data => {
    corpus = JSON.parse(data.toString());
    return Promise.resolve();
  });
};

var processQuery = (rawquery) => {
  query.raw = rawquery;
  query.tokens = getTokens(rawquery);
  query.frequency = {};
  query.tokens.forEach(word => {
    if (query.frequency[word]) { // Word already exists. Increment count.
      query.frequency[word]++;
    } else {
      query.frequency[word] = 1;
    }
  });
  var numberOfFiles = Object.keys(corpus.fileWords).length;
  query.score = {};
  query.tokens.forEach(word => {
    if (corpus.invertedIndex[word]) {
      var df = corpus.invertedIndex[word].length;
      var idf = Math.log(numberOfFiles / df, 10); // eslint-disable-line
      var wordWeight = idf * (1 + Math.log(query.frequency[word], 10)); // eslint-disable-line
      corpus.invertedIndex[word].forEach(file => {
        var fileWeight = corpus.tfidf[file][word];
        if (query.score[file]) {
          query.score[file] += fileWeight * wordWeight;
        } else {
          query.score[file] = fileWeight * wordWeight;
        }
      });
    }
  });
  Object.keys(query.score).forEach(file => {
    query.score[file] = query.score[file] / corpus.fileLengths[file];
    var rankobj = {};
    rankobj.file = file;
    rankobj.score = query.score[file];
    query.ranks.push(rankobj);
  });
  query.ranks.sort((a, b) => {
    if (a.score > b.score) {return -1;} // eslint-disable-line
    if (a.score < b.score) {return 1;} // eslint-disable-line
    return 0; // eslint-disable-line
  });
};

exports.createIndex = () => {
  glob(CACHE_FOLDER + '/pages/**/*.md', {}).then(files => {
        var testfiles = files.slice(100, 102); // eslint-disable-line
    var promises = [];
    files.forEach(file => {
      var promise = fs.readFileAsync(file).then((data) => {
        processRawDocument(data.toString(), file);
      });
      promises.push(promise);
    });
    Promise.all(promises).then(() => {
      createInvertedIndex(corpus.allTokens);
      createTfIdf();
      createFileLengths();
      return writeCorpus();
    }).then(() => {
      console.log('Done');
    }).catch(error => {
      console.error('Error in creating corpus. Exiting.');
      console.error(error);
    });
  });
};

exports.getResults = (rawquery) => {
  readCorpus().then(() => {
    processQuery(rawquery);
    var results = query.ranks.slice(0, 10); // eslint-disable-line
    console.log(results);
  });
};
