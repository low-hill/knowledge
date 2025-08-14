---
layout: default
---
## Nginx port
* Nginx는 default port 는 80이고, SSL secure connection은 443port에서 발생한다.

* Uncomplicated firewall정보로 서버의 open port 정보 확인하기

  * `
sudo ufw status
`

* 설정가능한 application list 확인하기

  * `
sudo ufw app list
`
  * output에 대한 해석
```
Available applications:

  Nginx Full       // 80(unencrypted traffic) 및 443(TLS/SSL) port 오픈
  Nginx HTTP       // 80 port만 오픈 
  Nginx HTTPS.     // 443 port만 오픈
```

* 80 port 오픈 후 상태 확인
  * `
sudo ufw allow 'Nginx HTTP'
`
  
  * `
sudo ufw status
`

***

## Nginx configuration 설정

`
sudo \bvim /etc/nginx/sites-available/example.com
`
  * configuration 파일 내용은 하위와 같다.

  ```
server {
       listen 80; 
       listen [::]:80;       // IPv6 addresses

       root /var/www/example.com/html;
        index index.html index.htm index.nginx-debian.html;

        server_name example.com www.example.com;

        location / {
                try_files $uri $uri/ =404;
        }
}
```
  * configuration 파일 syntax확인 명령어는 하위와 같다.
    * `
sudo nginx -t
`
  * configuration 파일 수정 사항 적용을 위한 하위 명령어로 재기동 한다.
    * 
`
sudo systemctl restart nginx
`

## Nginx active 상태 확인하기

* `
systemctl status nginx
`

  * active상태의 output은 하위와 같다.

  * `
Active: active (running) since 시간 정보
`

  * inactive 상태 시 output

  * `
inactive (dead)...
`
## Nginx 기동 command

```
sudo systemctl start nginx

sudo systemctl reload nginx
```

## Nginx error 확인하기

  * `
sudo cat /var/log/nginx/error.log
`


***

## Maximum Throughput을 위한 Nginx 튜닝
* worker_processes
  * default 1, 단일 프로세스 maximun은 1024
  * CPU Core 수 혹은 CPU Core * 2로 설정
    * CPU Core수 확인 방법 -> top command 실행 후 숫자 1
  * 변경된 worker process 갯수 확인 명령어
    * ps -aux | grep nginx |grep -v grep
* worker_rlimit_nofile 수정
  * ulimit -n 수와 동일하게 설정하는것이 좋음
* worker_connections 수정
  
  worker_connections: worker process당 동시접속자수로 default값은 1024, 최대는 65535, os의 file descriptors maximum값 범위 안에서 설정
  하위 처럼 worker_connections에 따라 최대 접속자 수가 결정된다.
  max_clients = worker_processes * worker_connections
  
  In a reverse proxy situation
  max_clients = worker_processes * worker_connections/4

```

events {
    #  event-models은 epoll을 사용(효율높임)
    use epoll;
    # 서버의 성능 및 메모리에 따라 설정
    worker_connections 10240;
    #새연결에 대한 알림을 받은 후 많은 연결을 허용, default는 off
    multi_accept on;
}
```

* timeout 등 설정으로 서버 리소스, CPU, 메모리, 연결 제어.
```
keepalive_timeout 60;              
tcp_nodelay on;
client_header_buffer_size 4k;
open_file_cache max=102400 inactive=20s;
open_file_cache_valid 30s;
open_file_cache_min_uses 1;
client_header_timeout 15;
client_body_timeout 15;
reset_timeout_connection on;
send_timeout 15;
server_tokens off;
client_max_body_size 10m;
```

* GZIP압축 설정
```
gzip on;
gzip_min_length 1k;
gzip_buffers 4 32k;
gzip_http_version 1.1;
gzip_comp_level 6;
gzip_types text/plain text/css text/javascript application/json application/javascript;
gzip_vary on;

```



#### Reference 

[Common Nginx Connection Errors](https://www.digitalocean.com/community/tutorials/common-nginx-connection-errors)

[Nginx 튜닝](https://mp.weixin.qq.com/s/MnUDkRgfWX6f6amnSc3-qg)

[nginx config](https://github.com/voku/CONFIG--nginx---php-fpm---mysql/blob/master/etc/nginx/nginx.conf)