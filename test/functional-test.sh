#!/usr/bin/env bash

shopt -s expand_aliases

alias tldr="node bin/tldr"

function tldr-render-pages {
  tldr zip && \
  tldr du --platform=linux && \
  tldr du --platform=osx && \
  tldr du --platform=linux --markdown && \
  tldr du --platform=osx --markdown && \
  tldr du --platform=windows --markdown && \
  LANG= tldr --random && \
  LANG= tldr --random-example && \
  tldr --list && \
  tldr --list-all
}

tldr --update && \
tldr --render $HOME/.tldr/cache/pages/common/ssh.md && \
tldr --update && tldr-render-pages && \
tldr --clear-cache && \
tldr --update && tldr-render-pages && \
LANG=pt_BR tldr-render-pages && \
unset LANG && tldr-render-pages \
tldr --search "disk space"
