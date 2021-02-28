#!/bin/bash

header() {
    echo ""
    echo ""
    # echo "$(tput smul)" # underline
    echo "$(tput setaf 6)$(tput bold)"
    echo "***"
    echo "*** $1 ***"
    echo "***"
    echo "$(tput sgr0)"
}

runTest() {
    header "$1"
    if [ "${2:-=pretty}" = "debug" ]
    then
        docker-compose run -e DEBUG=http:response app artillery run -e dc "test/artillery/$1.yml"
    else
        docker-compose run app artillery run -e dc "test/artillery/$1.yml" | grep "not ok\|ok\|\* POST\|\* GET\|\* PUT\|\* DELETE"
    fi
}

echo "=>  Run tests"

runTest hello
runTest images
runTest registration-sms
header "Clear DB"
docker-compose run app clear-db | grep "WriteResult"
runTest prepare-tokens
runTest user
runTest hello
runTest hello

docker-compose run app clear-db | grep "WriteResult"
runTest auth-without-cookie
runTest auth-with-cookie

echo "=> Tests completed"
