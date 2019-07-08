#!/usr/bin/env bash

shopt -s expand_aliases

alias tldr="node bin/tldr"

function tldr-render-pages {
  tldr zip && \
  tldr du --os=linux && \
  tldr du --os=osx && \
  tldr du --os=linux --markdown && \
  tldr du --os=osx --markdown && \
  unset LANG tldr --random && \
  unset LANG tldr --random-example && \
  tldr --list && \
  tldr --list-all
}

tldr --render $HOME/.tldr/cache/pages/common/ssh.md && \
tldr --update && tldr-render-pages && \
tldr --clear-cache && \
tldr --update && tldr-render-pages && \
LANG=pt-BR tldr-render-pages && \
tldr --search "disk space"
