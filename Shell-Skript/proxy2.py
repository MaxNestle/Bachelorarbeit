# !/usr/bin/python3

import socket
import threading
from urllib.parse import urlparse
import time
import ssl
from threading import Lock

lock = Lock()
serverUrlStart = ""

def listenSocket():

    # Create a TCP socket
    serverSocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    # Re-use the socket
    serverSocket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

    # bind the socket to a public host, and a port
    serverSocket.bind(('127.0.0.1',3210))

    serverSocket.listen(10)  # become a server socket

    while True:
        # Establish the connection
        print("listening...")
        (clientSocket, client_address) = serverSocket.accept()
        d = threading.Thread(name= "client",target=proxyThread, args=(clientSocket, client_address))
        d.setDaemon(True)
        d.start()


def proxyThread(clientSocket, client_address):
    print("client accepted")
    # get the request from browser
    request = clientSocket.recv(2048)
    requestStr = str(request)
    # parse the first line
    first_line = requestStr.split(' ')
    # get url
    if len(first_line) == 0:
        print(requestStr)
    url = first_line[1]
    print(url)
    urlObj = urlparse(url)

    if urlObj.netloc == "":
        portStart = urlObj.path.find(":")
        if portStart == -1:
            port = 443
            webserver = urlObj.path
        else:
            port = int(urlObj.path[(portStart + 1):])
            webserver = urlObj.path[0:portStart]

    else:
        portStart = urlObj.netloc.find(":")
        if portStart == -1:
            port = 80
            webserver = urlObj.netloc
        else:
            port = int(urlObj.netloc[(portStart + 1):])
            webserver = urlObj.netloc[0:portStart]

    print(urlObj)



    print(webserver+" "+str(port))

    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((webserver, port))
    request = request.decode("utf-8")
    serverUrlStart = "http://"+webserver

    if port != 443:
        pos = request.find(serverUrlStart)
        print(pos)
        if pos != -1:
            request = request[:pos] + request[(pos + len(serverUrlStart)):]

    print(request)
    s.sendall(request.encode("utf-8"))

    e = threading.Thread(name="clientToServer", target=clientToServer, args=(s,clientSocket,port,webserver))
    e.start()

    f = threading.Thread(name="serverToClient", target=serverToClient, args=(s,clientSocket,port,webserver,lock))
    f.start()






def clientToServer(s,clientSocket,port,webserver):
    print("cts thread")

    serverUrlStart = "http://"+webserver

    while 1:
        # receive data from client
        data = clientSocket.recv(2048)
        if (len(data) > 0):
            data = data.decode("utf-8")
            pos = data.find(serverUrlStart)
            if pos != -1:
                data = data[:pos] + data[(pos+len(serverUrlStart)):]
            #print(data)
            s.sendall(data.encode("utf-8"))  # send to server

def serverToClient(s,clientSocket,port,webserver,lock):
    print("stc thread")
    buffer = []
    serverUrlStart = "http://"+webserver

    while 1:
        # receive data from web server
        data = s.recv(2048)
        if (len(data) > 0):
            data = data.decode("utf-8")
            pos = data.find(serverUrlStart)
            if pos != -1:
                data = data[:pos] + data[(pos+len(serverUrlStart)):]

            clientSocket.sendall(data.encode("utf-8"))  # send to browser/client

listenSocket()

while 1:
    pass
