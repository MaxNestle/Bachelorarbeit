#!/bin/bash


touch /tmp/buffer.txt
timeout 10 tcpdump -i any -nn -s0 -e -n udp and dst 127.0.0.1 -v -xx -l  | tee /tmp/buffer.txt 


#wo werden die meisten Pakete hingesended?
destIP=$(cat /tmp/buffer.txt | sed -rn '/((1?[0-9][0-9]?|2[0-4][0-9]|25[0-5])\.){3}(1?[0-9][0-9]?|2[0-4][0-9]|25[0-5].[1]).[0-9]+[[:blank:]].[[:blank:]]((1?[0-9][0-9]?|2[0-4][0-9]|25[0-5])\.){3}(1?[0-9][0-9]?|2[0-4][0-9]|25[0-5].[1]).[0-9]+/p' | cut -d" " -f7 | sort | uniq -c | sort | tail -n1 | cut -b 9- | sed s/.$// )

echo $destIP


rm /tmp/buffer.txt

echo "adding iptables rule"
iptables -t nat -A OUTPUT -p udp -j DNAT --to 127.0.0.1:10101
iptables -t nat -L -n -v

timeout 10 netsed udp 10101 127.0.0.1 3000 s/Hanry/Max

echo "deleting iptables rule"
iptables -t nat -D OUTPUT -p udp -j DNAT --to 127.0.0.1:10101
iptables -t nat -L -n -v


