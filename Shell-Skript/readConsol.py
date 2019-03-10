# !/usr/bin/python3

import os
import _thread
from threading import Thread, Lock
import time
from datetime import datetime
from array import *
from bitstring import BitArray,BitStream

mutex = Lock()
buffer = []
data = []  # timestamps
result = []
codedata = []  # binary hamming code
longBreak = 0.05  # sec
factor = 0.5  # difference between long and short break
bufferzize = 64  # bit
threadBreak = 0.005  # sec
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
    global result
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
                    result = []
                    #while len(codedata) >= 7:
                    #    result = result + hammingCorrection(codedata[0:7])
                    #    del codedata[0:7]
                    f = open('./secrete2', 'wb')
                    print(codedata)
                    s= ''.join(str(e) for e in codedata)
                    #s = ''.join(codedata)
                    b = BitArray(bin = s)
                    print(b)
                    b.tofile(f)
                    f.flush()
                    f.close()
                    print(result)
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




#https://gist.github.com/vatsal-sodha/f8f16b1999a0b5228143e637d617c797
def noOfParityBitsInCode(noOfBits):
    i=0
    while 2.**i <= noOfBits:
        i+=1
    return i


def hammingCorrection(data):
    n = noOfParityBitsInCode(len(data))
    print(n)
    i = 0
    list1 = list(data)
    print(list1)
    errorthBit = 0
    while i < n:
        k = 2. ** i
        j = 1
        total = 0
        while j * k - 1 < len(list1):
            if j * k - 1 == len(list1) - 1:
                lower_index = j * k - 1
                temp = list1[int(lower_index):len(list1)]
            elif (j + 1) * k - 1 >= len(list1):
                lower_index = j * k - 1
                temp = list1[int(lower_index):len(list1)]  # if list's size is smaller than boundary point
            elif (j + 1) * k - 1 < len(list1) - 1:
                lower_index = (j * k) - 1
                upper_index = (j + 1) * k - 1
                temp = list1[int(lower_index):int(upper_index)]

            total = total + sum(int(e) for e in temp)
            j += 2  # increment by 2 beacause we want alternative pairs of numberss from list
        if total % 2 > 0:
            errorthBit += k  # to check even parity summing up all the elements in sublist and if summ is even than even parity else odd parity
        i += 1
    if errorthBit >= 1:
        print("error in ", errorthBit, " bit after correction data is ")
        # toggle the corrupted bit
        if list1[int(errorthBit - 1)] == '0' or list1[int(errorthBit - 1)] == 0:
            list1[int(errorthBit - 1)] = 1
        else:
            list1[int(errorthBit - 1)] = 0
    else:
        print("No error")
    list2 = list()
    i = 0
    j = 0
    k = 0
    # returning only data from codeword that is ignoring parity bits
    while i < len(list1):  # returning only data bits
        if i != ((2 ** k) - 1):
            temp = list1[int(i)]
            list2.append(str(temp))
            j += 1
        else:
            k += 1
        i += 1
    return list2


_thread.start_new_thread(tcpdump, ())
_thread.start_new_thread(calc(), ())

while 1:
    pass
