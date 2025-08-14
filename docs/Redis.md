---
layout: default
---

### memory 사용량 줄이기
* key 길이 줄이기
   * 키의 수를 미리 예측하자. 만약 키의 수가 백만 레벨에 도달하면 너무 긴 키 이름도 너무 많은 공간을 차지한다. 하여 키는 간단하고 명확하면서 최대한 짧게 정의하는것이 좋다.
   * 예) user:book:12 -> u:bk:12
* bigkey의 저장을 지양
   * bigkey를 대량으로 저장하면 Redis의 메모리가 빨리 늘어나고 해당키를 읽고 쓸 때 성능 문제가 발생한다.
   * String: 10kb 이하
   * List/Hash/Set/ZSet: element 10,000이하
* TTL 설정
   * 만료 시간을 설정하면 Redis에서 데이터를 찾을 수 없을 때 DB에서 Redis에 다시 로드하여 자주 방문되는 데이터만 유지 가능하다.
* maxmemory 및 Eviction Policy 설정
   * 업무 데이터의 양을 미리 예측하여 maxmemory를 설정하여 Redis 메모리 사용을 제한해야 한다.
   * maxmemory 에 지정한 크기보다 커지면 Redis는 사용자가 지정한 Eviction 정책에 따라 저장되어 있는 데이터를 제거한 후, 새로운 데이터를 저장하게 된다
     * LRU: 최근에 방문한 데이터는 남기고 가장 오래된 데이터부터 삭제
       * allkeys-lru : 모든 키를 대상으로 LRU 알고리즘을 적용하여 키를 삭제
       * volatile-lru : EXPIRE SET 안에 있는 키를 대상으로 LRU 알고리즘을 적용하여 키를 삭제
     * LFU: 사용 빈도수가 가장 적은 데이터부터 삭제, 최근에 사용된 데이터라도 자주 사용되지 않는다면 제거 대상이
       * allkeys-lfu : 모든 키를 대상으로 LFU 알고리즘을 적용하여 키를 삭제
       * volatile-lfu : EXPIRE SET 안에 있는 키를 대상으로 LFU 알고리즘을 적용하여 키를 삭제
     * volatile-ttl: EXPIRE SET 안에 있는 키를 대상으로 TTL이 짧은 데이터부터 삭제
     * Random
       * allkeys-random : 모든 키를 대상으로 무작위로 데이터를 삭제
       * volatile-random : EXPIRE SET 안에 있는 키를 대상으로 무작위로 데이터를 삭제
   
### 성능
* bigkey
   * bigkey는 과도한 메모리 사용외에도 성능에도 큰 영향을 미친다. Redis는 단일 스레드로 요청을 처리하기 때문에 bigkey 저장/삭제 시 메모리 할당/해제에 시간이 많이 소모되어 latency가 증가되고, read 시 네트워크 데이터 전송에 더 많은 시간 할애로 뒤 작업이 대기가 발생할 수 있어 성능이 떨어지게 된다.
   * bigkey를 저장 할 필요가 있을 때 bigkey를 여러개로 나눠서 분할 저장 한다.
* lazy-free 설정
   * Redis내에 데이터가 Max 메모리에 도달할 경우 메모리 관리 알고리즘을 통해 여러개의 키 삭제가 이루어지는데, 이때 성능 지연 문제가 발생할 수 있다. LazyFree를 설정함으로써 LAZYFREE thread가 background로 동작하여 키를 제거하기 때문에 응답속도가 빨라진다.
   * LazyFree는 redis.conf에서 설정
* O(N) 관련 명령어는 주의!!
   * 대표적인 O(N) 명령어
      * KEYS
      * FLUSHALL, FLUSHDB
      * Get All Collections, Delete Collections
   * Redis는 싱글스레드로 동작하기 때문에 keys와 같은 명령어를 O(n)시간 동안 수행하면서 lock이 걸린다면 멈춰버리거나 데이터가 많으면 전송시 지연이 발생할 수 있다.
   * List/Hash/Set/ZSet 조회 시 우선 (LLEN/HLEN/SCARD/ZCARD)로 길이를 조회해야 하고, 갯수가 많으면 (LRANGE, HSCAN, SSCAN, ZSCAN)으로 범위를 지정하여 조회한다.
* 동시에 다수개 키 조회
   * 여러개 키를 한번에 조회 시  loop를 통한 GET작업은 네트워크 IO cost가 많이 든다. 해당 상황에는 아래와 같이 처리해야 한다.
   * String/Hash 타입은 GET/SET 대신 MGET/MSET을 사용, HGET/HSET 대신 HMGET/HMSET을 사용해야 한다. 기타 타입은 Pipeline을 사용해야 한다.

