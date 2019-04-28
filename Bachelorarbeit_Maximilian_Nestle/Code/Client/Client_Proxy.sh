#!/bin/bash

args=("$@")


if [ "$(id -u)" != "0" ]; then
	echo "This script must be run as root"
	exit 1
fi


if which python3 > /dev/null
	then		
		if which pip3 > /dev/null
			then		
				if pip3 show bitstring > /dev/null
				then 
					echo "starting..."
				else
					echo "You need to install Python3 bitstring !!"
				fi
			else
				echo "Could not find pip3 !!"	
		fi
	else
		echo "You have to install python3"
		exit 1
fi	


python3 Client_Proxy.py ${args[0]} ${args[1]} ${args[2]}



