#! /usr/bin/bash


# echo `node ./build/build.js ./packages/button`
# find all folders under root/packages excludes
# *utils, __mocks__ directives hooks locale theme*
# which means the result will not contain folder name includes utils
yarn bootstrap
yarn clean:lib
yarn build:esm-bundle
tar --exclude=index.esm.js -zcvf  ./es.gz ./lib
mkdir -p es
tar -zxvf ./es.gz --strip-component 2 -C ./es
yarn build:lib

# -P2 stands for 2 maximum parallel, with
# node .build/build.js command
find './packages' -type d -mindepth 1 -maxdepth 1 ! -name '*util*' ! -name '__mocks__' ! -name 'locale' ! -name 'theme*' -print0 | xargs -I {} -P2 -0 node ./build/build.comps.js {}

find ./packages/utils -type f ! -name '*.spec.ts' ! -name 'package.json' -print0 \
| xargs -P2 -0 -I {} node ./build/build-util.js {}

node ./build/build.entry.js

# Post build clean up

rm ./es.gz
