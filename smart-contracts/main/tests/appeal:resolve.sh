#!/bin/bash

if [ $1 == "hardhat" ]
then
yarn task deploy $1
yarn task setup $1
yarn task tune:tests $1
yarn task render $1
fi

yarn task deal:propose $1
yarn task deposit $1
yarn task deal:accept $1
yarn task appeal:create $1
yarn task appeal:start $1
yarn task appeal:round $1

echo "Waiting 30s before redeem deal"
sleep 30

yarn task deal:redeem $1
yarn task vault $1