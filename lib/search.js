'use strict';

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs-extra'));
const path = require('path');
const glob = Promise.promisify(require('glob'));
const natural = require('natural');

const config = require('./config');

const CACHE_FOLDER = path.join(config.get().cache, 'cache');

var data = {};

data.fileWords = {};
data.invertedIndex = {};
data.allTokens = new Set(); // eslint-disable-line
data.tfidf = {};

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
  data.fileWords[name] = {};
  tokens.forEach(word => {
    data.allTokens.add(word);
    if (data.fileWords[name][word]) { // Word already exists. Increment count.
      data.fileWords[name][word]++;
    } else {
      data.fileWords[name][word] = 1;
    }
  });
};

var createInvertedIndex = function(tokens) {
  tokens.forEach(word => {
    Object.keys(data.fileWords).forEach(name => {
      if (data.fileWords[name][word]) {
        if (data.invertedIndex[word]) {
          data.invertedIndex[word].push(name);
        } else {
          data.invertedIndex[word] = [name];
        }
      }
    });
  });
};

var getTf = function(word, filename) {
  var worddata = data.fileWords[filename];
  var frequency = frequency = worddata[word] || 0;
  var length = 0;
  Object.keys(worddata).forEach(key => {
    length += worddata[key];
  });
  var tf = frequency / length;
  return tf;
};

var getIdf = function(word) {
  var allFiles = Object.keys(data.fileWords).length;
  var wordFiles = data.invertedIndex[word].length;
  var idf = Math.log(allFiles / wordFiles);
  return idf;
};

var createTfIdf = function() {
  data.tfidf = {};
  Object.keys(data.fileWords).forEach(file => {
    data.tfidf[file] = {};
    Object.keys(data.fileWords[file]).forEach(word => {
      var tfidf = getTf(word, file) * getIdf(word);
      data.tfidf[file][word] = tfidf;
    });
  });
};

var processRawDocument = (data, name) => {
  var tokens = getTokens(data);
  createFileIndex(tokens, name);
};

var writeCorpus = () => {
  data.allTokens = Array.from(data.allTokens);
  var json = JSON.stringify(data);
  var filepath = CACHE_FOLDER + '/search-corpus.json';
  return fs.writeFileAsync(filepath, json, 'utf8').then(() => {
    return Promise.resolve('JSON written to disk at: ' + filepath);
  });
};

// var readCorpus = () => {

// };

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
      createInvertedIndex(data.allTokens);
      createTfIdf();
      return writeCorpus();
    }).then(() => {
      console.log('Done');
    }).catch(error => {
      console.error('Error in creating corpus. Exiting.');
      console.error(error);
    });
  });
};

// exports.getResults = () => {

// };