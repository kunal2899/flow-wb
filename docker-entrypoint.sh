#!/bin/sh

# Run model sync service
npm run sync

# Check NODE_ENV and start appropriate services
if [ "$NODE_ENV" = "production" ]; then
    npm run prod-all
else
    npm run local-all
fi