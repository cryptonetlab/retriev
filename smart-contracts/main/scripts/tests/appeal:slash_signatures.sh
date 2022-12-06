#!/bin/bash

if [ $1 == "hardhat" ]
then
yarn task deploy $1
yarn task setup $1
yarn task render $1
fi

yarn task deal:propose $1
yarn task deposit $1
yarn task deal:accept $1
yarn task appeal:create $1
yarn task appeal:start $1
yarn task appeal:slash:signatures $1
yarn task vault $1