# !/usr/bin/python3

import numpy
import os
import _thread
from threading import Thread, Lock
import time
from datetime import datetime

mutex = Lock()
buffer = []
data = []  # timestamps
result = []
codedata = []  # binary hamming code
longBreak = 0.1  # sec
factor = 0.5  # difference between long and short break
bufferzize = 64  # bit
threadBreak = 0.05  # sec
breakbetween = 1  # sec
sTolerance = 0.1
bTolerance = 0.3


def tcpdump():
    global buffer
    global data
    global mutex

    print("Thread")
    pipe = os.popen("tcpdump -s 0 host 127.0.0.1 and src port 80 -q -i any -l")
    for line in pipe:
        buffer.append(line[0:15])

        if len(buffer) > bufferzize:
            mutex.acquire()
            data = data + buffer
            buffer = []
            mutex.release()

        #print(str(len(buffer))+ "   "+ str(len(data)))

    time.sleep(threadBreak)


print("Thread")


def calc():
    d1 = []
    d2 = []
    f1 = []
    bStartTolerance = breakbetween + (breakbetween * bTolerance)
    sStartTolerance = breakbetween - (breakbetween * sTolerance)
    bBigBreakTolerance = longBreak + (longBreak * bTolerance)
    sBigBreakTolerance = longBreak - (longBreak * bTolerance)
    bSmallBreakTolerance = (longBreak * factor) + (longBreak * factor * bTolerance)
    sSmallBreakTolerance = (longBreak * factor) - (longBreak * factor * sTolerance)

    global codedata
    write = False
    while 1:
        mutex.acquire()
        while len(data) > 2:  # enouth to compare?
            d1 = datetime.strptime(data[0], "%H:%M:%S.%f")
            d2 = datetime.strptime(data[1], "%H:%M:%S.%f")
            d1 = d2 - d1  # calculate the time between paket
            f1 = float(d1.total_seconds())
            data.pop(0)

            if sStartTolerance < f1 < bStartTolerance:  # searching the file start/end
                if codedata != []:
                    decodeHamming()
                codedata = []
                print("Start of File")
                if write == False:
                    write = True

            if write == True:
                if sBigBreakTolerance < f1 < bBigBreakTolerance:
                    codedata.append(1)
                if sSmallBreakTolerance < f1 < bSmallBreakTolerance:
                    codedata.append(0)
        mutex.release()
        time.sleep(threadBreak)


def decodeHamming():
    h = numpy.array([[1, 0, 1, 1, 1, 0, 0], [1, 1, 0, 1, 0, 1, 0], [1, 1, 1, 0, 0, 0, 1], ])
    while codedata.length <= 7:
        result.append(numpy.dot(h, codedata[0:7])%2);
        del codedata[0:7]
    print(result)

_thread.start_new_thread(tcpdump, ())
_thread.start_new_thread(calc(), ())

while 1:
    pass
