# !/usr/bin/python3

from urllib.parse import urlparse
from bitstring import BitArray
import time
import select
import socket
import sys
import datetime


class Proxy:
    def __init__(self):
        self.lsock = []
        self.msgToClient = []
        self.msgToServer = []
        self.lastSend = []
        self.pause = 1
        self.secretData = []
        self.longBreak = 0.05  # sec
        self.factor = 0.5  # difference between long and short break
        self.shortBreak = self.longBreak * self.factor
        self.fileCursor = []
        self.breakBetweenTransmit = 1

    def cutIpFromata(self, data):
        data = data.decode('Latin-1')
        pos = data.find("http:/")
        if pos != -1:
            data = data[:pos] + data[(pos + len("http:/")):]
            split = data.split("/")
            pos = data.find(split[1])
            if pos != -1:
                data = data[:pos - 1] + data[(pos + len(split[1])):]

        data = data.encode('Latin-1')
        return data

    def getAddress(self, request):
        requestStr = str(request)  # parse the first line
        first_line = requestStr.split(' ')
        if len(first_line) == 0:  # get url
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

    def newClient(self, s):
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
                self.lastSend.append(time.time())
                self.fileCursor.append(0)

                print(str(self.msgToClient))
                print("server and client added")

            except:
                e = sys.exc_info()[0]
                print(e)

    def getSocketIndex(self, s):
        sockIndex = -1
        for sock in self.lsock:
            if sock == s:
                sockIndex += 1
                break;
            else:
                sockIndex += 1
        return sockIndex

    def read(self, readable):
        for s in readable:
            sockIndex = self.getSocketIndex(s)
            if sockIndex == 0:
                self.newClient(s)
            else:
                if sockIndex % 2 == 0:
                    self.readFromServer(s, sockIndex)
                else:
                    self.readFromClient(s, sockIndex)

    def send(self, writable):
        for t in writable:
            sockIndex = self.getSocketIndex(t)
            if sockIndex == 0:
                print("unlikely to happen")
            else:
                if sockIndex % 2 == 0:
                    self.sendToServer(t, sockIndex)
                else:
                    self.sendToClient(t, sockIndex)

    def readFromServer(self, s, sockIndex):
        data = s.recv(24000)
        if data != b'':
            self.msgToClient[(int(sockIndex / 2) - 1)].append(data)
            print(("\nFROM SERFER\n" + str(self.msgToClient[int((sockIndex / 2) - 1)])))

    def readFromClient(self, s, sockIndex):
        data = s.recv(24000)
        if data != b'':
            self.msgToServer[int((sockIndex - 1) / 2)].append(data)
            print(("\nFROM CLIENT\n" + str(self.msgToServer[int((sockIndex - 1) / 2)])))

    def sendToServer(self, t, sockIndex):
        if len(self.msgToServer[int((sockIndex / 2) - 1)]) != 0:

            lastTime = self.lastSend[int((sockIndex / 2) - 1)]
            currenTime = time.time()
            div = currenTime - lastTime

            # print(self.secretData[self.fileCursor[int((sockIndex / 2) - 1)]])
            if self.pause != self.breakBetweenTransmit:
                if self.secretData[self.fileCursor[int((sockIndex / 2) - 1)]] == '1':
                    self.pause = self.longBreak
                    # print("long")
                else:
                    self.pause = self.shortBreak
                    # print("short")

            if div > self.pause:
                self.pause = 0
                data = self.msgToServer[int((sockIndex / 2) - 1)].pop(0)
                data = self.cutIpFromata(data)
                print("\nTO SERVER\n" + str(data))
                try:
                    t.sendall(data)
                    self.lastSend[int((sockIndex / 2) - 1)] = time.time()

                    print(len(self.secretData))
                    print(self.fileCursor[int((sockIndex / 2) - 1)])

                    if len(self.secretData) - 1 == self.fileCursor[int((sockIndex / 2) - 1)]:
                        self.fileCursor[int((sockIndex / 2) - 1)] = 0
                        self.pause = self.breakBetweenTransmit
                    else:
                        self.fileCursor[int((sockIndex / 2) - 1)] += 1
                except:
                    print(sys.exc_info()[0])

    def sendToClient(self, t, sockIndex):
        if len(self.msgToClient[int((sockIndex - 1) / 2)]) != 0:

            # lastTime = self.lastSend[int((sockIndex-1)/2)]
            # currenTime = time.time()
            # div = currenTime - lastTime

            data = self.msgToClient[int((sockIndex - 1) / 2)].pop(0);
            data = self.cutIpFromata(data)
            print("\nTO CLIENT\n" + str(data))
            try:
                t.sendall(data)
            except:
                print(sys.exc_info()[0])
            # self.lastSend[int((sockIndex - 1) / 2)] = time.time()

    def proxy(self):

        # Create a TCP socket
        self.listenSocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.listenSocket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)  # Re-use the socket
        self.listenSocket.bind(('127.0.0.1', 3210))  # bind the socket to a public host, and a port
        self.listenSocket.listen(10)  # become a server socket

        self.lsock.append(self.listenSocket)

        while True:
            readable, writable, exceptional = select.select(self.lsock, self.lsock, self.lsock)
            self.read(readable)
            self.send(writable)
            time.sleep(0.0002)

    def getSecreteData(self):
        f = open("secret", "rb")
        try:
            self.secretData = f.read()
        finally:
            f.close()
        self.secretData = list(BitArray(hex=self.secretData.hex()).bin)
        print(self.secretData)


proxy = Proxy()
proxy.getSecreteData()

proxy.proxy()

while 1:
    pass