#!/bin/bash

if [ $# -eq 0 ]
    then
        echo "No arguments supplied, must choose between provider or referee mode."
    else
        # Stop previous instance
        echo "Stopping previous docker instance.."
        docker stop pldr
        echo "Starting new docker instance.."
        docker start pldr

        # Run IPFS daemon
        docker exec pldr ipfs daemon &
        docker exec -w /data/$1-cli pldr yarn dev --docker &
fi