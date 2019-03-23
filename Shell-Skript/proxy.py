# !/usr/bin/python3

import threading
from urllib.parse import urlparse
import time
import select
import socket
import sys

class Proxy:
    def __init__(self):
        self.lsock = []
        self.msgToClient = []
        self.msgToServer = []
        self.lastSend = []

    def cutIpFromata(self, data):
        data = data.decode('Latin-1')
        pos = data.find("http:/")
        if pos != -1:
            data = data[:pos] + data[(pos + len("http:/")):]
            split = data.split("/")
            pos = data.find(split[1])
            if pos != -1:
                data = data[:pos-1] + data[(pos + len(split[1])):]
                #print("??????? "+str(data))
                #print(pos)

        data = data.encode('Latin-1')
        return data

    def getAddress(self,request):
        requestStr = str(request) # parse the first line
        first_line = requestStr.split(' ')
        if len(first_line) == 0:                   # get url
            print(requestStr)
        if len(first_line) > 2:
            self.url = first_line[1]
            print(self.url)
            urlObj = urlparse(self.url)
        else:
            return

        if urlObj.netloc == "":
            portStart = urlObj.path.find(":")
            if portStart == -1:
                self.webserverPort = 443
                self.webserver = urlObj.path
            else:
                self.webserverPort = int(urlObj.path[(portStart + 1):])
                self.webserver = urlObj.path[0:portStart]

        else:
            portStart = urlObj.netloc.find(":")
            if portStart == -1:
                self.webserverPort = 80
                self.webserver = urlObj.netloc
            else:
                self.webserverPort = int(urlObj.netloc[(portStart + 1):])
                self.webserver = urlObj.netloc[0:portStart]

        print(self.webserver + " " + str(self.webserverPort))


    def proxy(self):
        # Create a TCP socket
        self.listenSocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.listenSocket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)        # Re-use the socket
        self.listenSocket.bind(('127.0.0.1',3210))        # bind the socket to a public host, and a port
        self.listenSocket.listen(10)  # become a server socket

        self.lsock.append(self.listenSocket)

        while True:
            readable, writable, exceptional = select.select(self.lsock,self.lsock,self.lsock)
            #print(str(len(readable))+" "+str(len(writable))+" "+str(len(exceptional)))
            for s in readable:
                sockIndex = -1
                for sock in self.lsock:
                    if sock == s:
                        sockIndex += 1
                        break;
                    else:
                        sockIndex += 1

                if sockIndex == 0:
                    (self.clientSocket, self.client_address) = s.accept()  # Establish the connection
                    print("client accepted")

                    request = self.clientSocket.recv(20000)

                    self.webserverPort = -1
                    self.webserver = ""

                    if request != "":
                        self.getAddress(request)

                    if self.webserver != "" and self.webserverPort != -1:
                        try:
                            self.serverSocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                            self.serverSocket.connect((self.webserver, self.webserverPort))


                            request = request.decode("utf-8")
                            self.serverSocket.sendall(request.encode())


                            self.lsock.append(self.clientSocket)
                            self.lsock.append(self.serverSocket)


                            self.msgToServer.append([])
                            self.msgToClient.append([])
                            print(str(self.msgToClient))
                            print("server and client added")

                        except:
                            e = sys.exc_info()[0]
                            print(e)
                else:
                    if sockIndex%2 == 0:
                        #print("Von Server lesen")
                        data = s.recv(4096)
                        if data != b'':
                            self.msgToClient[(int(sockIndex/2)-1)].append(data)
                            print(("<--S"+str(self.msgToClient[int((sockIndex/2)-1)])))

                    else:
                        #print("Von Client lesen")
                        data = s.recv(4096)
                        if data != b'':
                            self.msgToServer[int((sockIndex-1)/2)].append(data)
                            print(("<--C"+str(self.msgToServer[int((sockIndex-1)/2)])))

            for t in writable:
                sockIndex = -1
                for sock in self.lsock:
                    if sock == t:
                        sockIndex += 1
                        break;
                    else:
                        sockIndex += 1
                if sockIndex == 0:
                    print("000")
                else:
                    if sockIndex % 2 == 0:
                        if len(self.msgToServer[int((sockIndex/2)-1)]) != 0:
                            print("An Server senden")

                            data = self.msgToServer[int((sockIndex/2)-1)].pop()
                            data = self.cutIpFromata(data)
                            print("-->S \n"+str(data))
                            t.sendall(data)


                            #s.sendall(self.msgToServer[sockIndex-2][0])
                            #del self.msgToServer[sockIndex-2]
                    else:
                        if len(self.msgToClient[int((sockIndex-1)/2)]) != 0:
                            print("An Client Senden")
                            data = self.msgToClient[int((sockIndex-1)/2)].pop();
                            data = self.cutIpFromata(data)
                            print("-->C \n"+str(data))

                            try:
                                t.sendall(data)
                            except:
                                e = sys.exc_info()[0]
                                print(e)

                            #s.sendall(self.msgToClient[sockIndex-1][0])
                            #del self.msgToClient[sockIndex-1][0]

            #print(str(len(self.msgToServer)))
            #print(str(len(self.msgToClient)))

            time.sleep(0.002)

proxy = Proxy()
proxy.proxy()

while 1:
    pass