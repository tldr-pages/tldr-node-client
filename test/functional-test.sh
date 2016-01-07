#!/usr/bin/env bash

node bin/tldr --update && \
node bin/tldr zip && \
node bin/tldr du --os=linux && \
node bin/tldr --clear-cache && \
node bin/tldr --update && \
node bin/tldr tar
