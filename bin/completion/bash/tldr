#!/bin/bash

function _tldr_autocomplete {
  sheets=$(tldr -l -1)
  COMPREPLY=()
  if [ $COMP_CWORD = 1 ]; then
    COMPREPLY=(`compgen -W "$sheets" -- $2`)
  fi
}

complete -F _tldr_autocomplete tldr
