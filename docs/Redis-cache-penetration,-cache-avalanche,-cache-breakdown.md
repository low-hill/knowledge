### cache penetration
Cache penetration 존재 하지 않는 데이터를 조회하는것을 뜻한다. storage layer에 존재하지 않는 데이터는 cache에 저장 되지 않기 때문에 non-existent 데이터가 발생하는데 데이터가 요청될 때마다 DB에서 조회하기에 캐싱의 의미를 잃게 된다. traffic이 많으면 DB에 부하가 걸리고 존재하지 않는 키로 악의적인 공격을 할 수 있다.
#### Solution
* cache empty data

  쿼리에서 반환된 데이터가 비어 있는 경우 빈 결과를 캐싱하고 만료 시간은 5분 이하로 짧게 설정한다.
* Bloom filter

  Bloom filter를 활용하여 존재하지 않는 데이터를 필터링하여 요청이 백엔드로 전송되는 것을 방지할 수 있다.

#### redisson로 Bloom filter 구현 할 수 있다. [redission bloom filter 소스코드 참고](https://github.com/redisson/redisson-examples/blob/master/objects-examples/src/main/java/org/redisson/example/objects/BloomFilterExamples.java)
```
        RBloomFilter<String> bloomFilter = redisson.getBloomFilter("bloomFilter");
        bloomFilter.tryInit(100_000_000, 0.03);
        
        bloomFilter.add("a");
        bloomFilter.add("b");
        bloomFilter.add("c");
        
        bloomFilter.getExpectedInsertions();
        bloomFilter.getFalseProbability();
        bloomFilter.getHashIterations();
        
        bloomFilter.contains("a");
```

### cache avalanche
Redis 다운 혹은 대량의 cache key가 동시에 만료되어 모든 요청에 대해 DB에서 조회하기 때문에 DB에 부하가 발생하고 다운이 될 수 있다. 해당 경우 데이터 캐싱 시 만료 일정한 범위의 random값(1-5분)으로 설정한다.
예) TTL -> 30+1~5


### cache breakdown
hot key problem으로도 알려진 cache breakdown은 key에 동시다발적인 request 발생으로 redis가 다운되고 수많은 요청은 디비에 영향을 미친다.
* Mutex
  
  하나의 스레드에서 데이터베이스를 쿼리할 수 있으며 다른 스레드는 데이터베이스를 쿼리하는 스레드가 실행을 완료하고 데이터를 캐시에 다시 추가할 때까지 대기
* hotspot data never expires

  키에 해당되는 value에 만료시간을 저장하여 만료시간에 도달하였을 때 백그라운드에서 비동기로 캐싱된다.

### Reference 
https://devpress.csdn.net/redis/62f658c17e6682346618b138.html
https://www.alibabacloud.com/knowledge/developer1/detailed-explanation-caching-problems