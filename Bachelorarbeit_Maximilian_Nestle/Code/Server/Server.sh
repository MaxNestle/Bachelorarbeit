#!/bin/bash


if which node > /dev/null
	then
		if [ "$(id -u)" != "0" ]; then
   			echo "This script must be run as root"
   			exit 1
		fi		
		node index.js
	else
		echo "You have to install node.js"
		exit 1
fi




