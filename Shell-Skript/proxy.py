# !/usr/bin/python3

import socket
import threading
from urllib.parse import urlparse

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
    request = clientSocket.recv(1024)
    requestStr = str(request)
    # parse the first line
    first_line = requestStr.split(' ')
    # get url
    url = first_line[1]
    print(url)
    urlObj = urlparse(url)
    portStart = urlObj.netloc.find(":")

    if portStart == -1:
        port = 80
        webserver = urlObj.netloc
    else:
        port = int(urlObj.netloc[(portStart + 1):])
        webserver = urlObj.netloc[0:portStart]

    print(port)
    print(webserver)

    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((webserver, port))
    print(request)
    s.sendall(request)

    while 1:
        # receive data from web server
        data = s.recv(1024)
        if (len(data) > 0):
            clientSocket.send(data)  # send to browser/client


#jeweils eigener thread mutex!
def clientToServer():
    print()

def serverToClient():
    print()

listenSocket()

while 1:
    pass