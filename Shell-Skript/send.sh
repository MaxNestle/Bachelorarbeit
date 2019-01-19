#!/bin/bash

# generating bufferfile
touch /tmp/buffer.txt

# recording all UDP massages for 10 seconds
timeout 10 tcpdump -i any -nn -s0 -e -n udp -v -xx -l  | tee /tmp/buffer.txt 


#what ist the most used IP adress? (bsp. 179.0.0.1.3000)?


cat /tmp/buffer.txt | sed -rn '/((1?[0-9][0-9]?|2[0-4][0-9]|25[0-5])\.){3}(1?[0-9][0-9]?|2[0-4][0-9]|25[0-5].[1]).[0-9]+[[:blank:]].[[:blank:]]((1?[0-9][0-9]?|2[0-4][0-9]|25[0-5])\.){3}(1?[0-9][0-9]?|2[0-4][0-9]|25[0-5].[1]).[0-9]+/p' | cut -d" " -f5 | sort | uniq -c 

src=$(cat /tmp/buffer.txt | sed -rn '/((1?[0-9][0-9]?|2[0-4][0-9]|25[0-5])\.){3}(1?[0-9][0-9]?|2[0-4][0-9]|25[0-5].[1]).[0-9]+[[:blank:]].[[:blank:]]((1?[0-9][0-9]?|2[0-4][0-9]|25[0-5])\.){3}(1?[0-9][0-9]?|2[0-4][0-9]|25[0-5].[1]).[0-9]+/p' | cut -d" " -f5 | sort | uniq -c | sort | tail -n1 | cut -b 9- )


# (bsp 127.0.0.1.3000 -> 127.0.0.1 3000)
src1=$(echo $src | tr . " ")
src1=${src1/ /.}
src1=${src1/ /.}
src1=${src1/ /.}

# (bsp 127.0.0.1 3000 -> 127.0.0.1)
srcIP=$(echo $src1 | cut -f1 -d" ")

# (bsp 127.0.0.1.3000 -> 3000)
srcPort=${src##*.}

echo $src
echo $src1
echo $srcIP
echo $srcPort


dest=$(cat /tmp/buffer.txt | sed -rn '/((1?[0-9][0-9]?|2[0-4][0-9]|25[0-5])\.){3}(1?[0-9][0-9]?|2[0-4][0-9]|25[0-5].[1]).[0-9]+[[:blank:]].[[:blank:]]((1?[0-9][0-9]?|2[0-4][0-9]|25[0-5])\.){3}(1?[0-9][0-9]?|2[0-4][0-9]|25[0-5].[1]).[0-9]+/p' | cut -d" " -f7 | sort | uniq -c | sort | tail -n1 | cut -b 9- | sed s/.$// )


# (bsp 127.0.0.1.3000 -> 127.0.0.1 3000)
dest1=$(echo $dest | tr . " ")
dest1=${dest1/ /.}
dest1=${dest1/ /.}
dest1=${dest1/ /.}

# (bsp 127.0.0.1 3000 -> 127.0.0.1)
destIP=$(echo $dest1 | cut -f1 -d" ")

# (bsp 127.0.0.1.3000 -> 3000)
destPort=${dest##*.}

echo $dest1
echo $destIP
echo $destPort


# removing buffer file
rm /tmp/buffer.txt


echo "adding iptables rule"
iptables -t nat -A OUTPUT -p udp -s $srcIP --sport $srcPort -j DNAT --to 127.0.0.1:15681
iptables -t nat -L -n -v


sleep 10
timeout 10 timeout 10 netsed udp 15682 $destIP $destPort s/sdjhfjö/


# everything that commes to localhost port 10102 is send to the final destination


echo "deleting iptables rule"
iptables -t nat -D OUTPUT -p udp -s $srcIP --sport $srcPort -j DNAT --to 127.0.0.1:15681
iptables -t nat -L -n -v

#fishbown
#fragen stellen auch weennn keine antwort erwartet wird
#Aufbau 

