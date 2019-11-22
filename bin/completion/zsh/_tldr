#compdef tldr

local -a pages oses
pages=$(tldr -a1)
oses='( linux osx sunos )'

_arguments \
  '(- *)'{-h,--help}'[show help]' \
  '(- *)'{-v,--version}'[show version number]' \
  '(- *)'{-l,--list}'[list all commands for chosen platform]' \
  '(- *)'{-a,--list-all}'[list all commands]' \
  '(- *)'{-1,--single-column}'[list one command per line (used with -l or -a)]' \
  '(- *)'{-r,--random}'[show a random command]' \
  '(- *)'{-s,--search}'[search all pages for query]' \
  '(- *)'{-e,--random-example}'[show a random example]' \
  '(- *)'{-m,--markdown}'[show the original markdown format page]' \
  '(-f --render)'{-f,--render}'[render a specific markdown file]:markdown file:_files -/' \
  '(-o --os)'{-o,--os}"[override operating system]:os:${oses}" \
  '--linux[override operating system with Linux]' \
  '--osx[override operating system with OSX]' \
  '--sunos[override operating system with SunOS]' \
  '(- *)'{-u,--update}'[update local cache]' \
  '(- *)'{-c,--clear-cache}'[clear local cache]' \
  "*:page:(${pages})" && return 0
