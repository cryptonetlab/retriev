#!/bin/bash

if [ $1 == "hardhat" ]
then
yarn task deploy $1
yarn task setup $1
yarn task render $1
fi

yarn task deal:create $1
yarn task appeal:create $1