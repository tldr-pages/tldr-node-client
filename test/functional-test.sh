#!/usr/bin/env bash

shopt -s expand_aliases

option=''

alias tldr="node bin/tldr"

function tldr-render-pages {
  tldr $option zip && \
  tldr $option du --os=linux && \
  tldr $option du --os=osx && \
  tldr $option --random && \
  tldr $option --random-example && \
  tldr $option --list && \
  tldr $option --list-all 
}

tldr --render $HOME/.tldr/cache/pages/common/ssh.md && \
tldr --update && tldr-render-pages && \
tldr --clear-cache && \
tldr --update && tldr-render-pages

option="--config-file ./test/.mytldrrc"
rm -rf ./tmp
tldr-render-pages