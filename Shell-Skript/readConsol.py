# !/usr/bin/python3

import os;
import _thread;
from threading import Thread, Lock;
import time;


mutex = Lock();
buffer = [];
data = [];


def tcpdump():
    global buffer;
    global data;
    print("Thread");
    pipe = os.popen("tcpdump -s 0 host 127.0.0.1 and src port 80 -q -i any -l");
    for line in pipe:
        buffer.append(line[0:15]);

        if len(buffer) > 64:

            mutex.acquire()
            try:
                data = data + buffer;
                buffer = [];
            finally:
                mutex.release()

        print(str(len(buffer))+ "   "+ str(len(data)));

    time.sleep(0.05)
print("Thread");


def calc():
    while 1:
        mutex.acquire();
        try:
            for tmp in data:
                data.pop(0);
        finally:
            mutex.release();
        time.sleep(0.05);



_thread.start_new_thread(tcpdump,());
_thread.start_new_thread(calc(),());


while 1:
    pass

