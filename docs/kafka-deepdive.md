---
title: "카프카 심화 (1) - 순서 보장과 확장성을 결정짓는 파티셔닝 전략"
layout: post
categories: [Architecture, Kafka]
tags: [Kafka, Partitioning, Scalability, DistributedSystem]
---

# Kafka 심층 이해: Kafka의 확장성과 데이터 일관성

Apache Kafka는 현대 분산 시스템에서 서비스 간 데이터 흐름을 연결하는 핵심 이벤트 스트리밍 플랫폼입니다. 대규모 데이터 스트림을 실시간으로 처리하면서도, 각 파티션을 디스크 기반 append-only 분산 로그 구조로 저장하여 높은 처리량과 내구성을 동시에 제공합니다.

단순한 메시지 브로커를 넘어, 시스템 전반의 데이터 파이프라인을 구성하는 중심 인프라로서 수평 확장성(Scalability)과 복제 기반 일관성(Consistency)을 균형 있게 달성하도록 설계되어 있습니다.

본 포스팅에서는 카프카의 
* 핵심 설계 요소인 파티셔닝 전략
* Partition Capacity Planning
* 분산 환경에서의 순서 보장
* 그리고 장애 상황에서도 정합성을 유지하는 ISR(In-Sync Replica) 메커니즘을
심도 있게 다룹니다.

---

## 1. 파티션 단위 설계와 확장성

카프카 아키텍처 설계에서 **Partitioning**, **Ordering**, **ISR**은 독립적인 기능이 아니라, 서로 연계되어 성능, 순서, 신뢰성을 함께 보장하는 상호 보완적 메커니즘입니다.

1.  **성능(Performance):** **Partitioning**을 통해 메시지를 파티션 단위로 분산하여 병렬 처리량을 확보하고, 동시에 같은 파티션 내 순서를 유지할 수 있도록 합니다.
2.  **무결성(Integrity):** **Ordering**은 같은 파티션 내 메시지 순서를 보장하며, 프로듀서와 파티션 키 설계, ack 정책과 함께 동작합니다.
3.  **신뢰성(Reliability):** **ISR**와 복제 메커니즘을 통해 장애 시에도 데이터 정합성과 가용성을 유지합니다.

---

## 2. 확장성의 토대: 파티셔닝 전략

파티셔닝은 토픽이라는 논리적 저장소를 물리적인 **로그(Log) 파일**로 분할하여 브로커들에 분산 저장하는 핵심 장치입니다. 카프카는 데이터를 수정 불가능한 **Append-only log** 형태로 디스크에 순차 기록(Sequential I/O)하여 쓰기 성능을 극대화합니다.

### 주요 파티셔닝 기법
1.  **Strict Ordering (Hash-based):**

```partition = hash(key) % partition_count```
- 메시지 키의 해시값을 기반으로 특정 키를 동일한 파티션에 고정 배정합니다. 
   - 특정 엔티티(예: 사용자 ID)의 이벤트 순서를 보장해야 할 때 필수적입니다.
2.  **Sticky Partitioning:** 
- 키가 없는 메시지를 전송할 때, 배치 단위로 같은 파티션에 전송하여 디스크 I/O 연속성과 배치 처리 효율을 최적화합니다.
   - 배치가 완료되거나 일정량에 도달하면 다음 파티션으로 이동  
   - 장점: 네트워크 전송 효율 향상 + CPU 사용량 최적화

3.  **Custom Partitioner:** 
- 비즈니스 로직에 따라 특정 파티션에 우선순위를 부여하거나 지리적 위치에 기반한 할당이 필요할 때 사용합니다.

> [!NOTE]
> 파티션 수는 증가시킬 수는 있지만, 직접적인 축소는 지원되지 않습니다. 잘못 산정된 파티션 수는 운영 복잡도와 장애 복구 시간(MTTR)에 영향을 줄 수 있으므로 신중하게 산정해야 합니다.

---

## 3. Partition 산정 및 Capacity Planning
Kafka 설계에서 핵심 고민은 “**토픽에 몇 개의 Partition을 할당할 것인가**“이며, Partition 수는 단순히 데이터를 분산 저장하는 역할을 넘어 다음 요소에 직접적인 영향을 미칩니다.

- Producer 처리량
- Consumer 병렬 처리
- 브로커 리소스 사용량
- 클러스터 운영 안정성
따라서 Partition 수는 단순한 설정값이 아니라 **Kafka 시스템 전체 처리 능력을 결정하는 핵심 설계 요소**입니다.

---

### 3.1 Partition 수 산정
Confluent의 블로그에서는 목표 처리량($T_{target}$)을 달성하기 위해 프로듀싱($P$)과 컨슈밍($C$) 양단의 임계치를 계산할 것을 제안합니다.

$$N = \max\left(\frac{T_{target}}{P_{max}}, \frac{T_{target}}{C_{max}}\right)$$

각 항목의 의미는 다음과 같습니다.
| 항목           | 의미                                      |
| ------------ | --------------------------------------- |
| ($T_{target}$) | 토픽 전체에서 처리해야 하는 목표 처리량                  |
| ($P_{max}$)    | Producer가 단일 Partition에 기록할 수 있는 최대 처리량 |
| ($C_{max}$)    | Consumer가 단일 Partition에서 읽을 수 있는 최대 처리량 |


### 계산 예시
다음과 같은 환경을 가정합니다.
```
Target throughput = 200 MB/s
Producer throughput per partition = 20 MB/s
Consumer throughput per partition = 50 MB/s
```
* Producer 기준 Partition 수: 200 / 20 = 10 partitions
* Consumer 기준 Partition 수: 200 / 50 = 4 partitions

따라서 필요한 최소 Partition 수는 다음과 같습니다.
* max(10, 4) = 10 partitions

즉 이 경우 전체 처리량을 만족시키기 위해 **최소 10개의 Partition이 필요합니다.**


### Partition Throughput 값에 대한 이해

위 계산 예시에서는 이해를 돕기 위해 **단일 Partition 처리량을 고정된 값으로 가정**했습니다.

하지만 실제 환경에서는 Partition 당 처리량이 다음 요소에 따라 크게 달라질 수 있습니다.

- 메시지 크기
- compression 사용 여부
- producer batch 설정
- network throughput
- broker disk 성능
- consumer processing logic

따라서 실제 시스템 설계에서는 실제 처리량은 측정해야 합니다.


### Consumer 병렬 처리 고려
위 공식은 **throughput 기준 최소 Partition 수**를 계산합니다.  
하지만 실제 시스템에서는 **Consumer 병렬 처리 수**도 함께 고려해야 합니다.

Kafka의 Consumer Group 모델에서는 다음과 같은 제약이 있습니다.
* 하나의 Partition은 **Consumer Group 내에서 하나의 Consumer만 읽을 수 있음**
* Partition 수가 Consumer 병렬 처리의 상한이 됨
따라서 실제 시스템에서는 Consumer 병렬 처리를 고려하여 다음 조건도 충족해야 합니다.
`Partition ≥ Consumer instances`

---

### 3.2 브로커 리소스, 스토리지, 네트워크, 운영 고려
Partition 수가 많아지면 브로커 메모리와 OS Page Cache, 스토리지, 네트워크 모두 영향을 받습니다.

### 브로커 메모리
- **JVM Heap**: 컨트롤러 메타데이터, 요청 처리, fetch/compression buffer 등 연산용으로 사용. 일반적으로 4~6GB 권장  
- **OS Page Cache**: 디스크 로그를 읽고 Consumer에 전달하는 역할. Kafka 로그 접근 효율을 위해 충분한 RAM 확보 권장  
- Partition 증가 시 index mmap, metadata 등 **OS Page Cache 및 Heap 메모리 사용량이 증가**를 고려하여 적절히 설정 필요


### 스토리지 설정
스토리지 요구량은 다음과 같이 계산할 수 있습니다.
```스토리지 = 일일 수집량 × 보관 기간 × 복제 계수```
### 네트워크 고려
브로커 아웃바운드 트래픽:
```아웃바운드 = (복제 계수 - 1) × Inbound + Consumer 그룹 수 × Inbound```
Partition과 Consumer 수가 많아지면 네트워크 부하가 급증하므로, 충분한 대역폭과 낮은 레이턴시를 확보해야 합니다.

### 운영 고려사항
1. 파일 디스크립터(FD)
    * Partition 로그 세그먼트와 네트워크 연결에 사용
    * Partition 증가 → FD 사용량 증가
    * 권장: 최소 100,000+
2. Partition Rebalance
    * Partition 수가 많으면 Consumer Rebalance, Leader Election, Metadata 전송 시간이 증가
    * Partition/Consumer 수를 신중하게 설계
3. Partition 증가 제한
    * Partition 수는 늘릴 수 있으나 줄일 수 없음
    * 메시지 키 기반 해시 매핑 변경 → 기존 순서 깨짐
    * 순서 보장 요구 토픽에서는 주의 필요
  
---

## 4. 트레이드오프: 순서 보장 vs 병렬 처리

Kafka는 파티션 단위로만 순서를 보장합니다. 따라서 토픽 전체에 대한 전역 순서를 유지하려면 단일 파티션 구성이 필요하지만, 이는 확장성을 제한합니다. 이러한 제약 때문에 대부분의 실무 시스템은 메시지 키를 활용하여 동일 엔티티(예: userId, orderId) 단위로만 순서를 보장하는 전략을 채택합니다. 동일한 키를 가진 메시지는 동일한 파티션으로 라우팅되므로, 특정 엔티티 내부의 이벤트 흐름은 순차적으로 처리됩니다. 이를 통해 엔티티 수준의 정합성을 유지하면서도, 서로 다른 엔티티 간에는 병렬 처리를 허용하여 시스템 전체 처리량을 극대화할 수 있습니다.

### 순서 보장이 필수적이지 않은 경우 (Maximizing Throughput)
모든 시스템이 엄격한 순서를 요구하는 것은 아닙니다. 예를 들어:
* 로그 수집 파이프라인
* 메트릭 집계 시스템
* 통계성 이벤트 처리

이러한 경우에는 개별 이벤트의 시간적 순서보다 유실 없는 수집과 높은 처리량이 더 중요한 요구사항이 됩니다. 특히 합계(sum), 개수(count), 평균(avg)과 같은 교환법칙이 성립하는 집계 연산에서는 이벤트 순서가 결과에 영향을 주지 않습니다.

이 경우 메시지 키를 지정하지 않고 기본 파티셔닝 전략(Round-robin 또는 Sticky Partitioning)을 활용하면, 파티션 간 부하가 균등하게 분산되어 병렬 처리 효율을 극대화할 수 있습니다.

### 파티션 단위 순서 보장과 쓰기 안정성
1.   **Message Key 활용:** 
* 메시지 키를 지정하면 동일한 키를 가진 레코드는 항상 동일한 파티션으로 전송됩니다. 
* Kafka는 파티션 내부에서 오프셋 증가 순서를 보장하므로, 특정 엔티티에 대한 이벤트는 시간적 순서대로 소비될 수 있습니다. 
* 이는 엔티티 단위의 상태 관리(Stateful Processing)에 필수적인 설계 방식입니다.
2.   **Idempotent Producer (멱등성 전송):** 
* `enable.idempotence=true` 설정을 활성화하면, 프로듀서는 브로커로부터 발급받은 Producer ID(PID)와 시퀀스 번호를 함께 전송합니다. 
* 브로커는 이를 기반으로 재시도 상황에서도 중복 레코드 append를 방지하고, 동일 파티션 내에서 순서 역전이 발생하지 않도록 검증합니다.

* 즉, Idempotent Producer는 **파티션이 기본적으로 제공하는 순서 보장을 네트워크 오류나 응답 지연 상황에서도 안정적으로 유지하도록 보강**하는 메커니즘입니다.

3. max.in.flight.requests.per.connection과 순서 안정성

* Producer는 동시에 여러 요청을 전송할 수 있는데, 이 최대 요청 수를 `max.in.flight.requests.per.connection`으로 설정합니다.

* 값이 너무 크면 재시도 시 순서가 꼬일 가능성이 있어, 단일 파티션 내 순서가 깨질 수 있습니다.

* Idempotent Producer와 함께 사용하면 Broker가 시퀀스를 추적하여 순서 역전을 방지하지만, 성능과 순서 안정성 간 트레이드오프가 존재합니다.

* 일반적으로 Kafka 2.x 이상에서는 기본값(5)으로 충분하며, 재시도/고순서 워크로드에서는 1~5로 제한하는 것을 권장합니다.

> [!NOTE]
> Idempotent Producer는 단일 파티션 내 쓰기 안정성과 순서 보강을 제공하지만, **Exactly-once 처리(EOS)**를 보장하지 않습니다.
EOS를 달성하려면 트랜잭션 프로듀서와 Consumer `read_committed` 설정이 함께 구성되어야 합니다.
---

## 5. ISR과 복제 기반 데이터 정합성

**ISR(In-Sync Replicas)** 메커니즘은 브로커 장애나 네트워크 지연에도 데이터를 안전하게 복제하고,
컨슈머가 일관된 뷰를 읽을 수 있도록 보장하는 핵심 기능입니다.

### 데이터 정합성 유지 전략
1.  **`acks=all`**: 리더뿐만 아니라 ISR(In-Sync Replica) 집합에 속한 모든 replica가 데이터를 로그에 append했을 때 성공 응답을 반환합니다. 
   - 이를 통해 다수 노드에 복제가 완료된 시점까지 쓰기 성공을 지연시켜 장애 시 데이터 손실 가능성을 최소화합니다.
2.  **`min.insync.replicas`**: 성공 응답을 주기 위해 필요한 최소 ISR 수입니다.
   - 가용성보다 데이터 정합성이 중요한 시스템에서 불완전한 복제를 차단하는 안전장치 역할.
3.  **High Watermark (HW)**: 모든 ISR에 복제가 완료된 마지막 오프셋입니다. 
   - 컨슈머는 이 지점까지만 데이터를 읽을 수 있으며, 이를 통해 리더 교체 상황에서도 일관된 뷰(View)를 유지합니다.


---

## 📚 참고 문헌 및 자료

### 서적
- **Kafka: The Definitive Guide (2nd Ed.)** – Gwen Shapira et al.  
- **Effective Kafka** – Emil Koutanov  

### 공식 문서 & 블로그
- [Apache Kafka – Hardware and OS Recommendations](https://kafka.apache.org/38/operations/hardware-and-os)  
- [Confluent – Kafka Streams Sizing Guide](https://docs.confluent.io/platform/current/streams/sizing.html)  
- [Confluent – Kafka Scaling Best Practices](https://www.confluent.io/learn/kafka-scaling-best-practices/#best-practices-for-scaling-kafka)  
- [Kafka Partition Strategy Guide – Klogic](https://klogic.io/blog/kafka-partition-strategy-guide/?utm_source=chatgpt.com)  
- [Kafka Consumers & Partitions – DevOpsSchool](https://www.devopsschool.com/blog/kafka-consumers-partition-a-complete-guide)  
- [Kafka Capacity Planning – AxonOps](https://axonops.com/docs/data-platforms/kafka/operations/performance/capacity-planning/)  
