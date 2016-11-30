#!/bin/sh
# 1. Get a macaroon (secret) from the Store for publishing snaps
# 2. Create a private key that only Travis can decrypt
# 3. Then use it to encrypt the macaroon
#
# As encrypted variables are only available to Travis commit runs,
# pull requests won't be able to steal the macaroon and publish
# under your name.

snapcraft login
export SNAPCRAFT_SECRET=$(pwgen 20 -1)
export SNAPCRAFT_CONFIG="$(openssl enc -aes-256-cbc -base64 -pass env:SNAPCRAFT_SECRET < ~/.config/snapcraft/snapcraft.cfg)"
travis encrypt SNAPCRAFT_SECRET=$SNAPCRAFT_SECRET -a
travis env set SNAPCRAFT_CONFIG "$SNAPCRAFT_CONFIG"

# Don't forget to commit the changes back to your .travis.yml.
