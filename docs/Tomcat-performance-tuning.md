---
layout: default
---

## OS
### open files
모든 수신 또는 송신 연결은 소켓을 열어야 하며 각 소켓은 Linux 시스템의 파일입니다. 로컬 파일 시스템에서 정적 콘텐츠를 제공하는 웹 서버를 구성하는 경우 각 연결마다 소켓이 하나씩 열립니다. 그러나 백엔드 서버에서 로드 밸런서를 구성하는 경우 각 수신 연결은 로드 밸런싱 구성에 따라 최소 2개 이상의 소켓을 엽니다.
* open files 수정 시 /etc/security/limits.conf에 하위 내용 추가
``` 
* soft nofile 100000
* hard nofile 100000
root soft nofile 100000
root hard nofile 100000
```
### TCP parameters
* 하위 값을 /etc/sysctl.conf 또는 /etc/sysctl.d/<config_name>.conf에 추가하고 sysctl -p를 실행하여 적용한다.
```
net.ipv4.tcp_max_syn_backlog = 100000
net.core.somaxconn = 100000
net.core.netdev_max_backlog = 100000
```

파라미터 | 설명
-- | --
net.ipv4.tcp_max_syn_backlog | 클라이언트가 아직 ACK 응답을 보내지 않은 half-open(SYNC_RECV상태) connection이 queue에 있는 갯수, 대기열이 가득 차면 클라이언트가 연결할 수 없기 때문에 대상 포트가 닫힌 것처럼 연결 거부 오류가 발생
net.core.somaxconn | accept되기를 기다리는 ESTABLISHED 상태의 소켓을 위한 queue
net.core.netdev_max_backlog | 네트워크 장치별로 커널이 처리하도록 쌓아두는 queue


### TCP port range
* 하위 값을 /etc/sysctl.conf or /etc/sysctl.d/<config>.conf에 추가하고 sysctl -p로 적용한다.
`net.ipv4.ip_local_port_range=1024 65535`

## JVM
### GC
최상의 성능을 위해 G1GC(Garbage First Garbage Collector) 또는 Z Garbage Collector와 같은 최신 Garbage Collector를 선택 한다.
### memory
heap 및 non-heap 충분한 사용 가능 메모리를 확보해야 다. 
* Xmx: 최대 heap 크기 
* Xms: 초기 heap 크기 
* XX 플래그를 사용하여 사용 중인 JRE 버전에 따라 PermSize 또는 메타스페이스Size를 설정

Reference
* https://medium.com/@pawilon/tuning-your-linux-kernel-and-haproxy-instance-for-high-loads-1a2105ea553e
* https://www.eginnovations.com/blog/tomcat-performance-tuning/
* https://brunch.co.kr/@growthminder/23
* https://meetup.nhncloud.com/posts/55