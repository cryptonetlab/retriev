#!/bin/bash

if [ $1 == "hardhat" ]
then
yarn task deploy $1
yarn task setup $1
fi

yarn task deal:create $1
sleep 5
yarn task deposit $1
sleep 5
yarn task deal:accept $1
sleep 5
yarn task appeal:create $1
sleep 5
yarn task appeal:slash $1
sleep 5
yarn task vault $1