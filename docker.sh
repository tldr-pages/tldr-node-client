# This script build and runs a dokcer enviroment for testing
# 
# ARGS: 
#  1: Node JS version
#  2: Alternative npm registry url
#

set -ex
NODE_VERSION="${1:-6.12.0}"
NPM_REGISTRY="${2:-https://registry.npmjs.org}"
docker build \
	-f test.Dockerfile \
	-t tldr-node-client-test-env \
	--build-arg NODE_VERSION=$NODE_VERSION \
	--build-arg NPM_REGISTRY=$NPM_REGISTRY \
	.
docker run \
	--rm \
	-v $PWD/bin/:/app/bin:ro \
	-v $PWD/test/:/app/test:ro \
	-v $PWD/lib/:/app/lib:ro \
	tldr-node-client-test-env

