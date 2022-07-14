#!/bin/bash

if [ $1 == "hardhat" ]
then
yarn task deploy $1
if [ $1 != "hardhat" ]
then
yarn verify $1
fi
yarn task setup $1
yarn task render $1
fi