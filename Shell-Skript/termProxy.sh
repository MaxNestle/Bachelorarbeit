#!/bin/bash

export http_proxy='http://127.0.0.1:3210' 

GET 172.0.0.1:80

unset http_proxy
