# !/usr/bin/python3

import os
import _thread
from threading import Thread, Lock
import time
from datetime import datetime
from array import *
from bitstring import BitArray,BitStream
from random import shuffle
import sys


mutex = Lock()
host = []
port = []
buffer = []
filename = []
data = []  # timestamps
result = []
codedata = []  # binary hamming code
longBreak = 0.05# sec
factor = 0.5  # difference between long and short break
bufferzize = 10
threadBreak = 0.008  # sec
breakbetween = 1  # sec
sTolerance = 0.4
bTolerance = 0.4
breakArray = []
times = ""
table = [129, 69, 229, 238, 16, 104, 178, 222, 95, 5, 171, 147, 231, 170, 105,
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


if len(sys.argv) != 4:
    print("Program needs exactly three arguments: source_IP_Adress source_Port filname")
    sys.exit(0)
else:
    host = sys.argv[1]
    port = sys.argv[2]
    filename = sys.argv[3]



def tcpdump():
    global buffer
    global data
    global mutex

    pipe = os.popen("tcpdump -s 0 host "+host+" and src port "+port+" -q -i any -l")
    for line in pipe:

        if line.split()[6] != "0":                #looks if the massage contains data => in the other case its the ACK for the server
            buffer.append(line[0:15])           #saves only the time to buffer

        if len(buffer) > bufferzize:
            mutex.acquire()
            data = data + buffer
            buffer = []
            mutex.release()

    print("test")
    time.sleep(threadBreak)




def calc():
    d1 = []
    d2 = []
    dif = list()
    bStartTolerance = breakbetween + (breakbetween * bTolerance)
    sStartTolerance = breakbetween - (breakbetween * sTolerance)
    bBigBreakTolerance = longBreak + (longBreak * bTolerance)
    sBigBreakTolerance = longBreak - (longBreak * bTolerance)
    bSmallBreakTolerance = (longBreak * factor) + (longBreak * factor * bTolerance)
    sSmallBreakTolerance = (longBreak * factor) - (longBreak * factor * sTolerance)
    bSyncTolerance = 0.01+(0.1*bTolerance)
    sSyncTolerance = 0.01-(0.1*sTolerance)

    print(str(bStartTolerance)+" - "+str(sStartTolerance))
    print(str(bBigBreakTolerance)+" - "+str(sBigBreakTolerance))
    print(str(bSmallBreakTolerance)+" - "+str(sSmallBreakTolerance))
    print(str(bSyncTolerance)+" - "+str(sSyncTolerance))



    global codedata
    global result
    write = False
    index = 0
    totalError = 0
    partialError = 0
    totalData = 0
    count = 0
    correctTransfert = 0
    startTime = []
    firstCorrectReceveTime = []
    passFirstTime = 0

    while 1:
        mutex.acquire()
        dif = list()
        while len(data) > 2:  # enouth to compare?
            d1 = datetime.strptime(data[0], "%H:%M:%S.%f")
            d2 = datetime.strptime(data[1], "%H:%M:%S.%f")
            d1 = d2 - d1  # calculate the time between paket
            dif.append(float(d1.total_seconds()))
            data.pop(0)
        #if len(dif) != 0:
            #detectBreak(dif)
        for f1 in dif:
            if sStartTolerance < f1 < bStartTolerance:  # searching the file start/end
                index = 0
                print(str(f1) + "  \t=> Start of File")
                if codedata != []:





                    hashFromServer = codedata[-8:]      # get the Hash fom the end of the data
                    del codedata[-8:]                   # remove hash from data
                    hashFromServer = int(''.join(str(e) for e in hashFromServer),2)
                    print("Hash from serer: "+str(hashFromServer))
                    dataString = ''.join(str(e) for e in codedata)  # data from List to String
                    hashFromClient = hash8(codedata,table)[0]         # generating 8 bit Perason Hash
                    print("Hash from client: "+str(hashFromClient))

                    if hashFromServer != hashFromClient:
                        print("Mistake in data transfer... Hashes are not the same!")

                    print("")
                    print("Data: "+dataString)
                    print("Data Length: "+str(len(dataString)))
                    print("")

                    totalData += len(dataString)
                    totalError += partialError
                    partialError = 0

                    print("Fehlerrate gesamt: "+str((totalError/totalData)*100)+"%")

                    count += 1



                    b = BitArray(bin = dataString)               # making bitArray without Char encoding
                    if hashFromClient == hashFromServer:
                        f = open('./' + filename, 'wb')  # open file
                        b.tofile(f)                         # write to file
                        f.flush()
                        f.close()

                        if correctTransfert == 0:
                            firstCorrectReceveTime = time.time()
                        correctTransfert += 1
                        print("Korrekt Übertragen: "+str(correctTransfert))
                        if startTime != [] and firstCorrectReceveTime != []:
                            print("Zeit bis zum ersten koreketn Paket"+(times+" "+ str(firstCorrectReceveTime-startTime)))
                        return


                    if count == 20:
                        print("Korrekt Übertragen: "+str(correctTransfert))
                        if startTime != [] and firstCorrectReceveTime != []:
                            print("Zeit bis zum ersten koreketn Paket"+str(startTime-firstCorrectReceveTime))
                        #return


                codedata = []
                if write == False:                      # false at the beginning as long the file hasnt started
                    startTime = time.time()
                    write = True
            else:
                if write == True:
                    if sBigBreakTolerance < f1 < bBigBreakTolerance:    # time range for a 1
                        if index <= 10:
                            print(str(index)+"\t"+str(f1) + "  \t estimate sync")
                        else:
                            codedata.append("1")
                            print(str(index)+"\t"+str(f1) + "  \t=> 1 ")     # print result and distance to the range borders
                    else:
                        if sSmallBreakTolerance < f1 < bSmallBreakTolerance: # time range for 0
                            if index <= 10:
                                print(str(index) + "\t" + str(f1) + "  \t=> estimate sync")
                            else:
                                codedata.append("0")
                                print(str(index)+"\t"+str(f1) + "  \t=> 0")
                        else:
                            if index < 16:
                                print(str(index)+"\t"+str(f1) + "  \t=> sync")
                            else:
                                partialError += 1
                                print(str(index)+"\t"+str(f1) + "  \t=> undefind: will be ignored")
                    index += 1

        mutex.release()
        time.sleep(threadBreak)


def detectBreak(dif):
    print(dif)
    if(len(dif)>= 100):
        tmp = dif[1:100]   #first elem = break
    else:
        tmp = dif

    step = tmp[0]
    i = 0

    while i != len(tmp)-1:
        k = abs(tmp[i] - tmp[i+1])

def hash8(data,s):
    result = []
    if len(data) == 0:
        return [-1]
    for byte in range(1):
        h = s[(int(data[0]) + byte) % 256]
        for c in data[1:]:
            h = s[h ^ int(c)]
        result.append(h)
    return result



_thread.start_new_thread(tcpdump, ())
calc()


