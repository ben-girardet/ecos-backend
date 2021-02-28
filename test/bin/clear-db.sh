#!/bin/bash

echo "=>  Clear DB"

mongo --host db -u admin -p admin-test-pwd <<EOF
use ecostest
db.users.remove({})
db.tokens.remove({})
db.pushplayers.remove({})
EOF
