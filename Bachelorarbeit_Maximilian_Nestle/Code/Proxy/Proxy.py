# !/usr/bin/python3

from urllib.parse import urlparse
from bitstring import BitArray
import time
import select
import socket
import sys

class Proxy:
    def __init__(self):

        if len(sys.argv) != 2:
            print("Program needs exactly one argument: device_IP (or localhost)")
            sys.exit(0)
        else:
            self.proxyIP = sys.argv[1]

        self.lsock = []
        self.msgToClient = []
        self.msgToServer = []
        self.lastSend = []
        self.pause = 1
        self.secretData = []
        self.longBreak = 0.08  # sec
        self.factor = 0.5  # difference between long and short break
        self.shortBreak = self.longBreak * self.factor
        self.fileCursor = []
        self.breakBetweenTransmit = 1
        self.fileStart = True

    # cuts the IP-address out of the http request (URL)
    def cutIpFromData(self, data):
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

    # gets the IP-Address from the request
    def getAddress(self, request):
        requestStr = str(request)  # parse the first line
        first_line = requestStr.split(' ')
        print(first_line)
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
                self.webserverPort = 443    #default
                self.webserver = urlObj.path
            else:
                self.webserverPort = int(urlObj.path[(portStart + 1):])
                self.webserver = urlObj.path[0:portStart]

        else:
            portStart = urlObj.netloc.find(":")
            if portStart == -1:
                self.webserverPort = 80     #default
                self.webserver = urlObj.netloc
            else:
                self.webserverPort = int(urlObj.netloc[(portStart + 1):])
                self.webserver = urlObj.netloc[0:portStart]

        print(self.webserver + " " + str(self.webserverPort))

    #is called when a new client connects, also builds a server socket
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


                request = self.cutIpFromData(request)
                print(request)
                self.serverSocket.sendall(request)


                self.lsock.append(self.clientSocket)
                self.lsock.append(self.serverSocket)

                self.msgToServer.append([])
                self.msgToClient.append([])
                self.lastSend.append(time.time())
                self.fileCursor.append(0)

                print("server and client added")

            except:
                e = sys.exc_info()[0]
                print(e)

    # searches a socket in the socket ist and returns its value
    def getSocketIndex(self, s):
        sockIndex = -1
        for sock in self.lsock:
            if sock == s:
                sockIndex += 1
                break;
            else:
                sockIndex += 1
        return sockIndex

    # checks if the readable socket is from client or the server
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

    # checks if the writable socket is from client or the server
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
        data = s.recv(48)
        if data != b'':
            self.msgToClient[(int(sockIndex / 2) - 1)].append(data)
            #print(("\nFROM SERFER\n" + str(self.msgToClient[int((sockIndex / 2) - 1)])))

    def readFromClient(self, s, sockIndex):
        data = s.recv(48)
        if data != b'':
            self.msgToServer[int((sockIndex - 1) / 2)].append(data)
            #print(("\nFROM CLIENT\n" + str(self.msgToServer[int((sockIndex - 1) / 2)])))


    def sendToClient(self, t, sockIndex):
        if len(self.msgToClient[int((sockIndex-1)/2)]) != 0:

            #calculates time diverence
            lastTime = self.lastSend[int((sockIndex - 1) / 2)]
            currenTime = time.time()
            div = currenTime - lastTime

            # checks if it is not the file start and sets the break
            if self.pause != self.breakBetweenTransmit:
                if self.secretData[self.fileCursor[int((sockIndex - 1) / 2)]] == '1':
                    self.pause = self.longBreak
                else:
                    if self.secretData[self.fileCursor[int((sockIndex - 1) / 2)]] == '0':
                        self.pause = self.shortBreak
                    else:
                        self.pause = 0.01

            # checks if the break is over
            if div > self.pause:
                if self.pause == self.breakBetweenTransmit:
                    self.pause = 0
                    data = self.msgToClient[int((sockIndex - 1) / 2)].pop(0)
                    try:
                        t.sendall(data)
                        self.lastSend[int((sockIndex - 1) / 2)] = time.time()
                    except:
                        print(sys.exc_info()[0])
                    return

                self.pause = 0
                data = self.msgToClient[int((sockIndex - 1) / 2)].pop(0)
                print("\nTO CLIENT\n" + str(data))
                try:
                    t.sendall(data)
                    self.lastSend[int((sockIndex - 1) / 2)] = time.time()
                    # end of file
                    if len(self.secretData) - 1 == self.fileCursor[int((sockIndex - 1) / 2)]:
                        self.fileCursor[int((sockIndex - 1) / 2)] = 0
                        self.pause = self.breakBetweenTransmit
                    else:
                        self.fileCursor[int((sockIndex - 1) / 2)] += 1
                except:
                    print(sys.exc_info()[0])


    def sendToServer(self, t, sockIndex):
        if len(self.msgToServer[int((sockIndex / 2) - 1)]) != 0:
            data = self.msgToServer[int((sockIndex / 2) - 1)].pop(0);
            data = self.cutIpFromData(data)
            print("\nTO SERVER\n" + str(data))
            try:
                t.sendall(data)
            except:
                print(sys.exc_info()[0])

    # generates 8 Bit Pearson Hash
    def hash8(self,data):
        #mapping tabel
        s = [129, 69, 229, 238, 16, 104, 178, 222, 95, 5, 171, 147, 231, 170, 105,
                 61, 85, 217, 236, 223, 87, 221, 60, 38, 125, 151, 124, 86, 137, 143,
                 230, 25, 228, 116, 62, 12, 150, 42, 177, 65, 207, 20, 122, 67, 109,
                 220, 208, 102, 183, 90, 28, 15, 245, 97, 145, 162, 156, 181, 155,
                 233, 111, 43, 157, 120, 247, 83, 194, 126, 34, 18, 198, 57, 121,
                 164, 74, 218, 8, 138, 130, 37, 51, 193, 4, 244, 152, 40, 45, 89,
                 35, 209, 21, 224, 76, 189, 96, 17, 201, 235, 64, 161, 68, 254,
                 202, 174, 44, 66, 133, 91, 72, 195, 210, 22, 52, 172, 56, 114,
                 63, 48, 197, 127, 88, 173, 0, 117, 10, 41, 106, 192, 188, 252,
                 169, 199, 242, 31, 214, 136, 7, 23, 103, 251, 6, 185, 11, 123,
                 98, 182, 46, 118, 110, 36, 225, 249, 160, 3, 163, 100, 80, 53,
                 1, 190, 141, 13, 255, 146, 93, 14, 140, 166, 211, 78, 184, 232,
                 108, 115, 19, 32, 167, 9, 113, 165, 253, 226, 132, 187, 154, 227,
                 205, 206, 58, 59, 134, 55, 128, 131, 204, 200, 24, 196, 144, 75, 216,
                 158, 49, 94, 107, 180, 168, 142, 119, 219, 153, 248, 212, 159, 239, 186,
                 179, 54, 27, 30, 84, 149, 203, 2, 191, 215, 175, 139, 81, 47, 92, 240, 241,
                 148, 77, 26, 70, 71, 176, 99, 39, 234, 33, 50, 82, 213, 112, 237, 73, 135,
                 250, 101, 243, 246, 79, 29]
        result = []
        for byte in range(1):
            h = s[(int(data[0]) + byte) % 256]
            for c in data[1:]:
                h = s[h ^ int(c)]
            result.append(h)
        return result

    def getSecreteData(self):
        print("Secret Data:")
        f = open("Secret/secret", "rb")
        try:
            self.secretData = f.read()
        finally:
            f.close()
        self.secretData = BitArray(hex=self.secretData.hex()).bin
        hash = self.hash8(self.secretData)[0]
        hash = BitArray(hex=hex(hash)).bin
        self.secretData = list(self.secretData+hash)

        # adding 2 Byte of sync
        sync = ["x","x","x","x","x","x","x","x","x","x","x","x"]
        self.secretData = sync+self.secretData
        print(self.secretData)

    #main function
    def proxy(self):

        # Create a TCP socket
        self.listenSocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.listenSocket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)  # Re-use the socket
        self.listenSocket.bind((self.proxyIP, 80))  # bind the socket to a public host, and a port
        self.listenSocket.listen(10)  # become a server socket

        self.lsock.append(self.listenSocket)
        while True:
            readable, writable, exceptional = select.select(self.lsock, self.lsock, self.lsock)
            self.read(readable)
            self.send(writable)
            time.sleep(0.00002)


proxy = Proxy()
proxy.getSecreteData()

proxy.proxy()

while 1:
    pass
