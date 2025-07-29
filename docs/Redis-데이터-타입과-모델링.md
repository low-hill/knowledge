# Redis 데이터 타입

## 개요
Redis는 다양한 데이터 타입을 지원하는 키-값 저장소로, 각 타입별로 특화된 연산을 제공합니다. 주요 데이터 타입은 다음과 같습니다.

| 종 류               | 내 용                                                        |
| ------------------- | ------------------------------------------------------------ |
| strings             | 문자(text), Binary 유형 데이터를 저장                        |
| List                | 하나의 Key에 여러 개의 배열 값을 저장                        |
| Hash                | 하나의 Key에 여러 개의 Fields와 Value로 구성된 테이블을 저장 |
| Set<br />Sorted Set | 정렬되지 않은 String 타입<br />Set과 Hash를 결합한 타입      |
| Bitmaps             | 0&1로 표현하는 데이터 타입                                   |
| HyperLogLogs        | Element중에서 Unique 한 개수의 Element만 계산                |
| Geospatial          | 좌표 데이터를 저장 및 관리하는 데이터 타입                   |
| JSON                | JSON 문서                           |

## 기본 데이터 타입

### 1. Strings (문자열)
- **데이터 타입**: 바이너리 안전한 문자열 (최대 512MB)
- **특징**:
  - 텍스트, JSON, 직렬화된 객체, 바이너리 데이터(이미지, 파일 등) 저장 가능
  - 정수(64-bit signed) 및 부동소수점(IEEE 754 배정밀도) 연산 지원
  - 비트 단위 연산(BITOP, BITCOUNT 등)으로 복잡한 비트 연산 가능
  - 원자적(atomic) 연산으로 분산 환경에서 안전한 카운터 구현 가능
- **주요 명령어**:
  - `SET key value [EX seconds] [PX milliseconds] [NX|XX]`: 값 설정 (옵션: TTL, 존재 여부 조건)
  - `GET key`: 값 조회
  - `INCR/DECR key`: 원자적 증감 (1씩)
  - `INCRBY/DECRBY key increment`: 지정한 값만큼 증감
  - `INCRBYFLOAT key increment`: 부동소수점 증감
  - `APPEND key value`: 문자열 추가
  - `STRLEN key`: 문자열 길이 조회
  - `SETRANGE key offset value`/`GETRANGE key start end`: 부분 문자열 조작
- **사용 사례**:
  - **캐싱**: HTML 조각, API 응답, 세션 데이터
  - **분산 락**: `SET resource_name unique_value NX PX 30000`
  - **카운터**: 조회수, 좋아요 수, 레이턴시 측정
  - **분산 환경에서의 공유 상태**: `INCR`을 사용한 원자적 카운터
  - **이진 데이터 저장**: 프로필 이미지, 파일 캐시
- **성능 고려사항**:
  - 시간 복잡도: 대부분 O(1)
  - 큰 값(수십 MB 이상)은 Redis의 단일 스레드 특성상 성능 저하 유발
  - `MSET`/`MGET`으로 여러 키를 한 번에 처리하여 네트워크 왕복 최소화
  - Lua 스크립트와 함께 사용하여 복잡한 연산을 원자적으로 처리 가능

### 2. Lists (리스트)
- **데이터 타입**: 문자열 요소의 양방향 연결 리스트
- **특징**:
  - 머리/꼬리에서의 빠른 삽입/삭제 (O(1))
  - 인덱스 기반 접근 (O(N) 주의)
  - 최대 4,294,967,295(2^32 - 1)개 요소 저장 가능
  - Redis 7.0부터는 ListPack 인코딩으로 메모리 효율성 개선
- **주요 명령어**:
  - `LPUSH`/`RPUSH`: 왼쪽/오른쪽에 요소 추가 (O(1))
  - `LPOP`/`RPOP`: 왼쪽/오른쪽 요소 제거 및 반환 (O(1))
  - `LRANGE key start stop`: 범위 내 요소 조회 (O(S+N), S는 시작 오프셋, N은 반환할 요소 수)
  - `LTRIM key start stop`: 리스트 자르기 (O(N), N은 제거할 요소 수)
  - `BLPOP`/`BRPOP`: 요소가 있을 때까지 블로킹 (O(1))
  - `LINSERT key BEFORE|PIVOT value`: 특정 위치에 요소 삽입 (O(N))
- **사용 사례**:
  - **타임라인**: 최근 게시물 목록 (LPUSH + LTRIM)
  - **메시지 큐**: LPUSH + BRPOP 조합으로 간단한 큐 구현
  - **최근 검색 기록**: LPUSH + LTRIM으로 고정 크기 리스트 유지
  - **작업 대기열**: 작업자 프로세스가 BLPOP로 작업 가져가기
- **성능 고려사항**:
  - 리스트의 중간에 삽입/삭제는 O(N)이므로 주의
  - 큰 리스트(수천 개 이상)에서 LRANGE 사용 시 성능 저하 가능성
  - Redis 7.0+에서는 작은 리스트에 대해 ListPack 인코딩으로 메모리 사용량 감소

### 3. Hashes (해시)
- **데이터 타입**: 필드-값 쌍의 컬렉션
- **특징**:
  - 작은 해시는 메모리 효율적인 ziplist로 저장
  - 최대 2^32 - 1개 필드 저장 가능
  - 개별 필드 단위로 조작 가능
- **주요 명령어**:
  - `HSET`/`HGET`: 필드 값 설정/조회
  - `HGETALL`: 모든 필드-값 조회 (주의: 큰 해시에서 성능 저하)
  - `HINCRBY`: 숫자 필드 증감
  - `HSCAN`: 점진적 스캔 (대용량 해시용)
- **사용 사례**:
  - 사용자 프로필 (필드 단위 업데이트에 유리)
  - 객체 표현 (JSON 대체)
  - 분산 환경에서의 공유 세션

### 4. Sets (집합)
- **데이터 타입**: 고유한 문자열의 정렬되지 않은 컬렉션
- **특징**:
  - 중복 허용하지 않음
  - 합집합, 교집합, 차집합 연산 지원
  - 최대 2^32 - 1개 요소 저장 가능
- **주요 명령어**:
  - `SADD`: 요소 추가
  - `SMEMBERS`: 모든 요소 조회 (주의: 큰 집합에서 성능 저하)
  - `SISMEMBER`: 요소 존재 여부 확인
  - `SUNION`/`SINTER`/`SDIFF`: 집합 연산
- **사용 사례**:
  - 태그 시스템
  - 공통 관심사가 있는 사용자 그룹화
  - 중복 방지 (이미 처리한 항목 추적)

### 5. Sorted Sets (정렬된 집합)
- **데이터 타입**: 점수(score)로 정렬된 고유한 멤버의 집합
- **특징**:
  - 멤버는 유일하지만 점수는 중복 가능
  - 범위 기반 쿼리 가능 (BYSCORE, BYLEX)
  - 순위 기반 조회 (랭킹 시스템에 적합)
- **주요 명령어**:
  - `ZADD`: 요소 추가/업데이트
  - `ZRANGE`/`ZREVRANGE`: 범위 내 요소 조회 (오름차순/내림차순)
  - `ZRANK`/`ZREVRANK`: 요소의 순위 조회
  - `ZSCORE`: 요소의 점수 조회
- **사용 사례**:
  - 리더보드 (게임 순위표)
  - 시간 순 정렬 (타임스탬프를 점수로 사용)
  - 우선순위 큐

## 고급 데이터 타입

### 6. Bitmaps (비트맵)
- **데이터 타입**: 비트 배열 (String 타입 확장)
- **특징**:
  - 최대 2^32 - 1개 비트 저장 가능
  - 비트 단위 연산 (AND, OR, XOR, NOT) 지원
  - 매우 공간 효율적 (1비트당 1개 상태 저장)
- **주요 명령어**:
  - `SETBIT`: 비트 설정
  - `GETBIT`: 비트 값 조회
  - `BITCOUNT`: 설정된 비트 수 계산
  - `BITOP`: 비트 연산 수행
- **사용 사례**:
  - 실시간 분석 (사용자 활동 추적)
  - 기능 플래그 저장
  - 고유 방문자 추적 (Set보다 메모리 효율적)

### 7. Geospatial (지리공간)
- **데이터 타입**: Sorted Set 기반의 지리공간 인덱스
- **특징**:
  - 경도/위도 좌표 저장 및 쿼리
  - 반경 내 위치 검색
  - GeoHash 기반 인덱싱
- **주요 명령어**:
  - `GEOADD`: 위치 추가
  - `GEOPOS`: 위치 좌표 조회
  - `GEODIST`: 두 위치 간 거리 계산
  - `GEORADIUS`: 반경 내 위치 검색
- **사용 사례**:
  - 근처 장소 찾기
  - 위치 기반 추천
  - 지오펜싱

### 8. Probabilistic > HyperLogLog (HLL)
- **데이터 타입**: 확률적 카디널리티 추정을 위한 특수한 문자열 타입
- **특징**:
  - 고유한 요소의 개수(cardinality)를 매우 적은 메모리로 추정 (표준 오차 0.81%)
  - 정확한 개수 대신 근사치를 제공하지만, 메모리 효율성이 매우 뛰어남
  - 최대 2^64개의 고유 항목을 약 12KB의 고정된 메모리로 처리 가능
  - 병합(merge)이 가능하여 분산 환경에서 유용
- **주요 명령어**:
  - `PFADD`: 새로운 요소 추가
  - `PFCOUNT`: 고유 요소 수 추정
  - `PFMERGE`: 여러 HLL을 하나로 병합
- **사용 사례**:
  - 일일/주간/월간 고유 방문자 수 추적
  - 대규모 데이터 세트에서 중복되지 않는 이벤트 수 집계
  - A/B 테스트에서 사용자 그룹별 고유 참여자 수 비교

### 9. JSON (Redis Stack)
- **데이터 타입**: JSON 문서
- **특징**:
  - JSON 문서를 기본 데이터 타입으로 지원
  - 경로(Path) 기반 접근으로 특정 필드만 조회/수정 가능
  - RediSearch와 연동하여 JSON 필드 기반 검색 및 인덱싱 지원
- **주요 명령어**:
  - `JSON.SET key path value`: JSON 문서 저장
  - `JSON.GET key [path]`: JSON 문서 또는 특정 필드 조회
  - `JSON.DEL key [path]`: JSON 문서 또는 특정 필드 삭제
  - `JSON.ARRAPPEND key path value`: 배열에 요소 추가
  - `JSON.OBJKEYS key [path]`: 객체의 키 목록 조회
- **사용 사례**:
  - 복잡한 중첩된 데이터 구조 저장 (예: 사용자 프로필, 설정)
  - API 응답 캐싱
  - 도큐먼트 지향 애플리케이션
  - 실시간 분석을 위한 반정형 데이터 저장
- **성능 고려사항**:
  - 전체 문서 대신 필요한 필드만 조회하는 것이 효율적
  - 자주 접근하는 필드는 별도의 키로 분리 고려
  - 큰 문서는 메모리 사용량에 주의
- **설치 요구사항**:
  - RedisJSON 모듈을 별도로 컴파일 및 로드 필요
  - 공식 설치 가이드: [RedisJSON 설치](https://redis.io/docs/latest/develop/data-types/json/developer/#cloning-the-git-repository)

## Redis 트랜잭션 제어

### 1. 트랜잭션 기본
- **MULTI/EXEC/DISCARD**
  - `MULTI`: 트랜잭션 시작
  - `EXEC`: 큐에 있는 모든 명령 실행
  - `DISCARD`: 트랜잭션 취소 (EXEC 전에만 가능)
- **주요 특징**
  - 원자성(Atomicity) 보장: 모든 명령이 성공하거나 아무 것도 실행되지 않음
  - 격리성(Isolation) 보장: 실행 중 다른 클라이언트의 명령이 끼어들지 않음
- **예시**
  ```
  > MULTI
  > SET user:1:name "John"
  > INCR user:1:visits
  > EXEC
  ```


## Redis 인덱싱

### 1. 기본 키(Primary Key) 기반 접근
- Redis는 모든 데이터를 고유한 키로 식별하며, 이 키를 통한 직접 접근을 기본으로 제공합니다.
- 이차 인덱스나 복합 인덱스가 필요할 경우, 추가적인 데이터 구조를 활용해 구현해야 합니다.

### 2. 이차 인덱스(Secondary Index) 구현
- 집합(SET)을 사용하여 특정 필드 값으로 레코드를 조회할 수 있는 인덱스 생성
  - `SADD` 명령어를 사용하여 집합(SET) 기반의 인덱스 생성
  - RDBMS의 인덱스와 유사하지만, 애플리케이션 레벨에서 수동으로 관리 필요

  ```
  # 이름으로 사용자 ID를 찾기 위한 인덱스 생성
  SADD user:name:John 1     # "John"이라는 이름을 가진 사용자 ID 1 추가
  SADD user:name:John 3     # "John"이라는 이름을 가진 또 다른 사용자 ID 3 추가
  
  # 사용 예시: "John"이라는 이름을 가진 모든 사용자 ID 조회
  SMEMBERS user:name:John
  ```

  **주요 특징**:
  - **역방향 조회**: 기본 키(사용자 ID)가 아닌 필드 값(이름)으로 조회 가능
  - **다대다 관계 지원**: 하나의 값에 여러 레코드 연결 가능
  - **실시간 업데이트 필요**: 원본 데이터 변경 시 인덱스도 함께 업데이트해야 함

  **사용 시 주의사항**:
  1. 인덱스 키의 TTL 설정을 원본 데이터와 동기화
  2. 대소문자 일관성 유지 필요 (예: "John"과 "john"은 다른 키로 처리)
  3. 인덱스 유지를 위한 추가 메모리 사용 고려

- **정렬된 집합(Sorted Set) 인덱스**
  - 범위 쿼리 가능
  ```
  # 나이별 사용자 인덱스
  ZADD user:age 25 user:1 30 user:2
  # 20-30세 사용자 조회
  ZRANGEBYSCORE user:age 20 30

## 성능 최적화 가이드라인

1. **메모리 최적화**
   - 적절한 데이터 타입 선택 (예: 작은 카운터는 String 대신 Hash의 필드로)
   - `HASH`, `LIST`, `SET`, `ZSET`에 대해 적절한 최대 요소 수 설정 (`*-max-*-entries`)
   - `MEMORY USAGE` 명령으로 키별 메모리 사용량 모니터링

2. **성능 모니터링**
   - `SLOWLOG`로 느린 쿼리 추적
   - `INFO` 명령으로 서버 상태 모니터링
   - `MEMORY STATS`로 메모리 사용 패턴 분석

3. **명령어 최적화**
   - 파이프라이닝으로 네트워크 왕복 최소화
   - `MULTI`/`EXEC` 대신 파이프라인 사용 고려
   - `KEYS *` 대신 `SCAN` 사용

## 참고 자료
- [Redis 공식 문서](https://redis.io/documentation)
- [Redis 명령어 레퍼런스](https://redis.io/commands/)
- [Redis 데이터 타입 튜토리얼](https://redis.io/topics/data-types)
- [Redis 메모리 최적화 가이드](https://redis.io/topics/memory-optimization)
- [Redis 지속성 설명](https://redis.io/topics/persistence)
- [Redis 복제 가이드](https://redis.io/topics/replication)
- [Redis 클러스터 튜토리얼](https://redis.io/topics/cluster-tutorial)
- 주종면, 『빅데이터 저장 및 분석을 위한 NoSQL & Redis』