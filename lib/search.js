'use strict';

const fs = require('fs-extra');
const path = require('path');
let glob = require('glob'); // use let so that it can be updated by promisify();
const natural = require('natural');

const config = require('./config');

const CACHE_FOLDER = path.join(config.get().cache, 'cache');

const filepath = CACHE_FOLDER + '/search-corpus.json';

let corpus = {};

corpus.fileWords = {};
corpus.fileLengths = {};
corpus.invertedIndex = {};
corpus.allTokens = new Set(); // eslint-disable-line
corpus.tfidf = {};

let query = {};

query.raw = null;
query.tokens = null;
query.frequency = {};
query.score = {};
query.ranks = [];

let promisify = () => {
  fs.readFileAsync = (filename, encoding) => {
    return new Promise((resolve, reject) => {
      fs.readFile(filename, encoding, (err, data) => {
        if (err)
        {reject(err);}
        else
        {resolve(data);}
      });
    });
  };
  fs.writeFileAsync = (filename, data, encoding) => {
    return new Promise((resolve, reject) => {
      fs.writeFile(filename, data, encoding, (err, data) => {
        if (err)
        {reject(err);}
        else
        {resolve(data);}
      });
    });
  };
  let globSync = glob;
  glob = (string, options) => {
    return new Promise((resolve, reject) => {
      globSync(string, options, (err, data) => {
        if (err)
        {reject(err);}
        else
        {resolve(data);}
      });
    });
  };
};
promisify();

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

let createInvertedIndex = (tokens) => {
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

let getTf = (word, filename) => {
  let worddata = corpus.fileWords[filename];
  let frequency = worddata[word] || 0;
  let length = 0;
  Object.keys(worddata).forEach(key => {
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
  Object.keys(corpus.fileWords).forEach(file => {
    corpus.tfidf[file] = {};
    Object.keys(corpus.fileWords[file]).forEach(word => {
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
  Object.keys(corpus.tfidf).forEach(name => {
    let len = 0;
    Object.keys(corpus.tfidf[name]).forEach(word => {
      len += corpus.tfidf[name][word] * corpus.tfidf[name][word];
    });
    corpus.fileLengths[name] = Math.sqrt(len);
  });
};

let writeCorpus = () => {
  corpus.allTokens = Array.from(corpus.allTokens);
  let json = JSON.stringify(corpus);
  return fs.writeFileAsync(filepath, json, 'utf8').then(() => {
    return Promise.resolve('JSON written to disk at: ' + filepath);
  });
};

let readCorpus = () => {
  return fs.readFileAsync(filepath, 'utf8').then(data => {
    corpus = JSON.parse(data.toString());
    return Promise.resolve();
  });
};

let processQuery = (rawquery) => {
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
  let numberOfFiles = Object.keys(corpus.fileWords).length;
  query.score = {};
  query.tokens.forEach(word => {
    if (corpus.invertedIndex[word]) {
      let df = corpus.invertedIndex[word].length;
            let idf = Math.log(numberOfFiles / df, 10); // eslint-disable-line
            let wordWeight = idf * (1 + Math.log(query.frequency[word], 10)); // eslint-disable-line
      corpus.invertedIndex[word].forEach(file => {
        let fileWeight = corpus.tfidf[file][word];
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
    let rankobj = {};
    rankobj.file = file;
    rankobj.score = query.score[file];
    query.ranks.push(rankobj);
  });
  query.ranks.sort((a, b) => {
    if (a.score > b.score) {
      return -1; // eslint-disable-line
    } 
    if (a.score < b.score) {
      return 1;
    }
    return 0;
  });
};

exports.createIndex = () => {
  glob(CACHE_FOLDER + '/pages/**/*.md', {}).then(files => {
        let testfiles = files.slice(100, 102); // eslint-disable-line
    let promises = [];
    files.forEach(file => {
      let promise = fs.readFileAsync(file).then((data) => {
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
      console.error(error.message);
      console.error(error.stack);
    });
  });
};

exports.getResults = (rawquery) => {
  readCorpus().then(() => {
    processQuery(rawquery);
        let results = query.ranks.slice(0, 10); // eslint-disable-line
    console.log(results);
  });
};