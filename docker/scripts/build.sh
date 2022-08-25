#!/bin/bash
if [ $# -eq 0 ]
    then
        echo "No Infura project id found, please specify it."
    else
        # Removing previous folders
        sudo rm -rf provider-cli/rpp
        sudo rm -rf referee-cli/rpp
        sudo rm ./provider-cli/.env
        sudo rm ./referee-cli/.env
        
        # Create .env files
        cp ./provider-cli/.env.rinkeby ./provider-cli/.env
        cp ./referee-cli/.env.rinkeby ./referee-cli/.env
        sed -i "s/PROJECT_ID/$1/" ./provider-cli/.env
        sed -i "s/PROJECT_ID/$1/" ./referee-cli/.env

        # Building docker
        cd docker && docker build -t rpp .
        sudo rm -rf .ipfs
        cd ..

        # Running docker
        docker run --restart=unless-stopped -d --name=rpp -p 8000:8000 -p 4001:4001 -p 4001:4001/udp -p 127.0.0.1:8080:8080 -p 127.0.0.1:7000:7000 -p 127.0.0.1:5001:5001 -v ${PWD}:/data rpp
        docker exec rpp bash docker/scripts/init.sh
fi