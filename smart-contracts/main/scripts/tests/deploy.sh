#!/bin/bash

yarn task deploy $1
yarn task setup $1
yarn task render $1

if [ $1 != "hardhat" ]
then
yarn verify $1
fi