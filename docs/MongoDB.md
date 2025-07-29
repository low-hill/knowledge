## Document Database
MongoDB는 문서 지향(Document-Oriented) 데이터베이스 시스템이다.
문서는 "field : value" 쌍으로 구성된 데이터 구조로 JSON 객체와 유사하다. value에는 다른 documents, arrays 및 문서의 배열(arrays of documents)을 포함할 수 있다.
![image](https://github.com/low-hill/Knowledge/assets/6086626/0fc36eac-4a75-4909-bb30-ddd5c6ce1b8e)

## RDBMS와의 구조 비교
RDBMS vs MongoDB 구조 비교

|RDBMS    |      MongoDB|
|------------|--------------|
|Database    |  Database    |
|Table       |  Collection |
|Row         |  Document |
|Column      |  Field |

## 장점
* Embedded documents와 배열의 사용으로 비용이 많이 드는 조인을 줄일 수 있다
* 스키마가 유연하고 확장성이 뛰어남


## Collections, Views, On-Demand Materialized Views를 지원
* MongoDB는 documents를 collection에 저장한다. 
  * collection은 RDB의 테이블과 유사하다.
* Read-only View (MongoDB 3.4 버전부터 지원)
* On-Demand Materialized View (MongoDB 4.2 버전부터 지원)
  * 요청 시 머티리얼라이즈된 뷰는 쿼리 실행 시점에 실제 데이터를 생성하는 뷰이다. 이를 통해 MongoDB는 관계형 데이터베이스의 뷰 기능을 지원하면서도 문서 지향 모델의 장점을 활용할 수 있다. 뷰와 컬렉션을 적절히 사용하면 복잡한 쿼리를 단순화하고 특정 데이터 모델링이 가능합니다.

## MongoDB의 주요 기능
* 높은 성능
  * embedded data models의 지원으로 데이터베이스 시스템의 I/O 줄임
  * 인덱스로 빠른 쿼리를 지원하며 embedded documents와 배열의 키를 포함할 수 있음

## Query API
* MongoDB 쿼리 API는 CRUD뿐만 아니라 다음을 지원한다:
  * 데이터 집계
  * 텍스트 검색 및 지리공간 쿼리


***

## 성능과 가용성을 극대화하기 위해 두 가지 핵심 기술
### Replication: 데이터 가용성과 내구성 확보
Replication은 데이터의 가용성과 내구성을 확보하기 위해 MongoDB에서 동일한 데이터를 여러 서버에 복제하는 기술입니다. 데이터베이스의 장애 처리 능력을 강화하고, 읽기 성능을 높이며, 데이터 손실을 방지합니다.
* MongoDB의 복제를 담당하는 replica set은 다음을 제공한다:
   * 자동 장애 조치 (automatic failover)
   * 데이터 중복성 (data redundancy)
     * replica set은 동일한 데이터 세트를 유지관리하는 MongoDB 서버 그룹으로, 중복성을 제공하고 데이터 가용성을 높인다.

````mermaid
graph TB
    Client[클라이언트 애플리케이션]
    
    subgraph "Replica Set"
        Primary[Primary Node]
        Secondary1[Secondary Node 1]
        Secondary2[Secondary Node 2]
        Arbiter[Arbiter]
    end
    
    Client --> Primary
    Client --> Secondary1
    Client --> Secondary2
    
    Primary ==> Secondary1
    Primary ==> Secondary2
    
    Primary -.-o Arbiter
    Secondary1 -.-o Arbiter
    Secondary2 -.-o Arbiter

    style Client fill:#4a4a4a,stroke:#333,color:#fff
    style Primary fill:#FF6B6B,stroke:#333,color:#fff,stroke-width:2px
    style Secondary1 fill:#4ECDC4,stroke:#333,color:#fff,stroke-width:2px
    style Secondary2 fill:#4ECDC4,stroke:#333,color:#fff,stroke-width:2px
    style Arbiter fill:#9B59B6,stroke:#333,color:#fff,stroke-width:2px
````
#### 구성요소
* Primary Node: 모든 쓰기 작업을 처리하는 주 노드
* Secondary Nodes: Primary의 데이터를 복제하여 가지고 있는 보조 노드들
* Arbiter (선택적): 투표권만 가진 노드로, 새로운 Primary 선출 시 참여

#### 동작 방식
* Primary에서 발생하는 모든 쓰기 작업이 oplog에 기록
* Secondary 노드들이 oplog를 실시간으로 동기화
* Primary 장애 시 Secondary 중 하나가 새로운 Primary로 승격

#### 사용 사례
* 고가용성이 필요한 시스템
* 재해 복구(Disaster Recovery) 대비
* 읽기 작업 분산이 필요한 경우

***

### Sharding: 수평 확장성
MongoDB에서 대용량 데이터베이스를 수평 확장하기 위한 기술로, 데이터를 여러 서버에 분산 저장하여 처리 성능을 높이는 방법입니다. 이는 특히 데이터의 크기나 처리량이 커짐에 따라 성능 병목을 방지하는 데 매우 유용합니다.
````mermaid
graph TB
    Client[클라이언트 애플리케이션]
    
    subgraph "라우터 계층"
        Router1[Mongos Router 1]
        Router2[Mongos Router 2]
    end
    
    subgraph "설정 계층"
        Config[Config Servers<br/>ReplicaSet]
    end
    
    subgraph "데이터 계층"
        Shard1[Shard 1]
        Shard2[Shard 2]
        Shard3[Shard 3]
    end

    Client --> Router1 & Router2
    
    Router1 & Router2 --> Config
    
    Router1 --> Shard1 & Shard2 & Shard3
    Router2 --> Shard1 & Shard2 & Shard3

    style Client fill:#4a4a4a,stroke:#333,color:#fff
    style Router1 fill:#FF6B6B,stroke:#333,color:#fff,stroke-width:2px
    style Router2 fill:#FF6B6B,stroke:#333,color:#fff,stroke-width:2px
    style Config fill:#9B59B6,stroke:#333,color:#fff,stroke-width:2px
    style Shard1 fill:#4ECDC4,stroke:#333,color:#fff,stroke-width:2px
    style Shard2 fill:#4ECDC4,stroke:#333,color:#fff,stroke-width:2px
    style Shard3 fill:#4ECDC4,stroke:#333,color:#fff,stroke-width:2px
````
#### 구성 요소
* Shard
  * 실제 데이터를 분산 저장하는 노드들: 데이터의 실제 저장 위치, 각 샤드는 전체 데이터의 일부를 저장하며, 독립적인 서버로 구성될 수 있습니다.
* Router (mongos)
  * 클라이언트 요청을 적절한 샤드로 라우팅: 클라이언트와 샤드 간의 인터페이스로, 클라이언트의 요청을 적절한 샤드로 라우팅하는 역할을 합니다.
* Config Servers
  * 메타데이터와 샤드 구성 정보 저장: 샤드 간의 메타데이터를 관리하는 서버로, 데이터 분배 정보를 저장합니다.


#### Sharding 키 선택
* 샤딩 키는 데이터를 어떻게 분할할지 결정하는 중요한 요소입니다. 샤딩키는 균등하게 분포된 값을 선택해야 합니다. 샤딩 키를 잘못 선택하면 성능에 큰 영향을 미칠 수 있습니다. 예를 들어, user_id나 order_id처럼 균등하게 분포된 값을 선택해야 성능의 불균형을 방지할 수 있습니다.

  * Range Sharding: 범위 기준으로 데이터를 나누는 방식으로, 특정 범위에 해당하는 데이터를 하나의 샤드에서 처리합니다.
  * Hash Sharding: 해시 함수를 이용해 데이터를 균등하게 분배하는 방식으로, 부하가 고르게 분산됩니다.
  * Zone Sharding: 특정 지역(데이터)에 대해 샤드를 지정하여 배치하는 방식입니다.

#### 동작 방식
* 샤드 키(Shard Key)를 기준으로 데이터를 분산
* 각 샤드는 전체 데이터의 일부분만 보유
* 라우터가 요청을 분석하여 적절한 샤드로 전달

### 두 모드의 조합
* 실제 프로덕션 환경에서는 두 모드를 함께 사용하는 것이 일반적입니다.
> 각 샤드를 레플리카 셋으로 구성하여:
> * 고가용성 보장
> * 확장성 확보
> * 데이터 안정성 향상
````mermaid
graph TB
    Client[클라이언트 애플리케이션]
    Router[Mongos Router]
    Config[Config Servers]
    
    subgraph "Shard 1"
        Primary1[Shard1 Primary]
        Secondary1A[Shard1 Secondary 1]
        Secondary1B[Shard1 Secondary 2]
    end
    
    subgraph "Shard 2"
        Primary2[Shard2 Primary]
        Secondary2A[Shard2 Secondary 1]
        Secondary2B[Shard2 Secondary 2]
    end

    Client --> Router
    Router --> Config
    
    Router --> Primary1
    Router --> Primary2
    
    Primary1 --> Secondary1A & Secondary1B
    Primary2 --> Secondary2A & Secondary2B

    style Client fill:#4a4a4a,stroke:#333,color:#fff
    style Router fill:#FF6B6B,stroke:#333,color:#fff,stroke-width:2px
    style Config fill:#9B59B6,stroke:#333,color:#fff,stroke-width:2px
    style Primary1 fill:#FF8C42,stroke:#333,color:#fff,stroke-width:2px
    style Primary2 fill:#FF8C42,stroke:#333,color:#fff,stroke-width:2px
    style Secondary1A fill:#4ECDC4,stroke:#333,color:#fff,stroke-width:2px
    style Secondary1B fill:#4ECDC4,stroke:#333,color:#fff,stroke-width:2px
    style Secondary2A fill:#4ECDC4,stroke:#333,color:#fff,stroke-width:2px
    style Secondary2B fill:#4ECDC4,stroke:#333,color:#fff,stroke-width:2px
````
***

## 다중 스토리지 엔진 지원
* WiredTiger 스토리지 엔진(암호화 포함)
* 인메모리 스토리지 엔진

## collection 
* db.collection_name.drop()
* db.collection_name.deleteMany({})
  * db.users.deleteMany({ age: { $lt: 30 } })
  * db.users.deleteMany({ createdAt: { $gte: new Date('2022-01-01') } })


## 설계 시 고려사항
* 컬렉션 설계
  * 논리적 그룹화
  * 접근 패턴 고려
  * 인덱싱 전략
* 도큐먼트 설계
  * 데이터 접근 패턴
  * 업데이트 빈도
  * 관계 모델링
* 성능 최적화
  * 적절한 인덱스 설정
  * 도큐먼트 크기 관리
  * 효율적인 쿼리 설계

Reference
* [MongoDB 메뉴얼](https://www.mongodb.com/docs/manual/introduction/)