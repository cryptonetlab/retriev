#!/bin/bash

if [ $1 == "hardhat" ]
then
yarn task deploy $1
yarn task setup $1
yarn task render $1
fi

yarn task deal:create $1
sleep 5
yarn task deposit $1
sleep 5
yarn task deal:accept $1
sleep 5
yarn task collection $1
sleep 5
yarn task deal:status $1
echo "Waiting 3600s before redeem deal"
sleep 3600
yarn task deal:redeem $1