## Docker 명령어

### 실행중인 컨테이너 확인
* docker ps

container에 접근하는 명령어는 하위와 같다.

* docker exec -it [container name] bash
```
$ docker exec <container name> <command>
 
ex) docker exec snowdeer_docker echo "Hello, SnowDeer"
```


### container ip 확인
* docker inspect container_id/container name

### docker의 url 확인
* docker-machine ls

### 컨테이너를 시작하거나 재시작, 정지하는 명령어
```
$ docker start <container name>        
$ docker restart <container name>      --재시작
$ docker stop <container name>          --정지
```

### 현재 실행중인 컨테이너 접속
```
$ docker attach <container name>
```

### 특정 컨테이너 삭제
```
$ docker rm <container name or id>
```

### 모든 컨데이너 삭제(remove all stopped containers)
```
$ docker rm $(docker ps -a -q)
```

### 명령어를 통해 Application을 설치하는 과정은 다음과 같고 하위 예제는 Redis 설치 과정을 기술한다.

* 하위 명령어로 Redis 이미지 검색
`$ docker search redis`

* 이미지 다운
`docker pull redis:x.x.x`

* container 실행
```
docker run -d -name m—redis -p 6379:6379 --network m-network --privileged=true -v /opt/docker/redis/conf/redis.conf:/etc/redis/redis.conf -v /opt/docker/redis/data:/data redis:6.0.3 redis-server /etc/redis/redis.conf
```
* -d: detached mode로 백그라운드 실행
* -p: host와 container의 port를 매핑 <host port>:<container port>
* -h: container host name
* —-network: container가 사용 할 네트워크 지정, 동일한 네트워크 지정하면 컨테이너 간 네트워크 가능하다
* --name: container 이름을 지정
* —-privileged: true면 컨테이너의 root사용자에게 root 권한을 부여되어 컨테이너에서 host 자원을 접근 가능
* -v: host와 volumn을 공유 {host directory}:{contaier-dir}

### 하위 명령어로 로그 확인한다.

`docker logs -f fudy-redis`



***

## Docker Compose
Docker Compose는 multi-container Docker 애플리케이션을 정의하고 실행하기 위한 도구다. 많은 양의 명령어를 입력하는 대신 yaml 파일을 통해 컨테이너를 쉽게 생성할 수 있고 커맨드 라인 도구로 시작, 정지, 재부팅, 삭제 등의 작업을 포함하여 multi-container를 관리할 수 있다.

### Docker Compose를 통한 Redis 설치 과정은 하위와 같다.

* /docker/compose.yml파일에 하위 내용을 추가한다.

```
version: '3.5'
services:
  redis:
    image: redis:6.0.3
    container_name: m-redis
    ports:
      - 6379:6379
    networks:
      - m-network
    volumes:
      - /opt/docker/redis/conf/redis.conf:/etc/redis/redis.conf
      - /opt/docker/redis/data:/data
    command:
      /bin/bash -c "redis-server /etc/redis/redis.conf"
networks:
  fudy-network:
    external: true

```

* 하위 명령어로 redis container를 실행한다.

`docker-compose -f /opt/docker/compose.yaml up -d`

#### compose.yaml 작성 가이드라인는 하위를 공홈 문서를 참고한다.

[Compose file 작성 가이드라인](https://docs.docker.com/compose/compose-file/compose-file-v3/)