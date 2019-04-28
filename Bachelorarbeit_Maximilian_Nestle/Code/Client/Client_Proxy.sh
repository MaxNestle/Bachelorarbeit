#!/bin/bash

args=("$@")


if [ "$(id -u)" != "0" ]; then
	echo "This script must be run as root"
	exit 1
fi	


if which python3 > /dev/null
	then		
		python3 Client_Proxy.py ${args[0]} ${args[1]} ${args[2]}
	else
		echo "You have to install python3"
		exit 1
fi




