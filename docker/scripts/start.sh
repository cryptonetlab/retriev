#!/bin/bash

if [ $# -eq 0 ]
    then
        echo "No arguments supplied, must choose between provider or referee mode."
    else
        # Stop previous instance
        echo "Stopping previous docker instance.."
        docker stop rpp
        echo "Starting new docker instance.."
        docker start rpp

        # Run IPFS daemon
        docker exec rpp ipfs daemon &
        docker exec -w /data/$1-cli rpp yarn dev --docker &
fi