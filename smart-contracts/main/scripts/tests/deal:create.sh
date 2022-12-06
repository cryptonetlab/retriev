#!/bin/bash

if [ $1 == "hardhat" ]
then
yarn task deploy $1
cd ../appeal && yarn task deploy $1 && cd ../main
yarn task setup $1
yarn task render $1
fi

yarn task deal:create $1
cd ../appeal && yarn task appeal:create $1