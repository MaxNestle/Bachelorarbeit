#!/bin/bash


python3 readConsol.py

#tcpdump -s 0 host 127.0.0.1 and src port 80 -q -i any -l | cut -d " " -f1 | python3 readConsol.py
