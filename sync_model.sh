#!/bin/bash

# copy src/logic/**/model.ts to ../cash-rebate-hk/src/services/**/model.ts
find src/logic -type f -name "model.ts" -exec sh -c 'cp "$1" "../cash-rebate-hk/src/services/$(dirname "${1#src/logic/}")/model.ts"' _ {} \;
