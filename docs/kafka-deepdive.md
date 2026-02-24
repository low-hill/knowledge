---
title: "카프카 심화 (1) - 순서 보장과 확장성을 결정짓는 파티셔닝 전략"
layout: post
categories: [Architecture, Kafka]
tags: [Kafka, Partitioning, Scalability, DistributedSystem]
---

# Kafka Enterprise Guide: Architecture & Operations

> 실무 관점에서의 카프카 설계 결정(Design Decision)과 장애 대응 패턴을 정리한 문서입니다.

---

## 📋 목차

| 주차 | 주제 | 핵심 키워드 | 상태 |
| --- | --- | --- | --- |
| **Part 1** | **Partitioning & Ordering** | 파티션 산정, 키 설계, 순서 보장 | ✅ 진행중 |
| **Part 2** | **Core Architecture** | Zero-copy, Sequential I/O, ISR | ⏳ 예정 |
| **Part 3** | **Retry Strategies** | Non-blocking Retry, Backoff | ⏳ 예정 |
| **Part 4** | **DLQ & Recovery** | Poison Pill, 데이터 복구 패턴 | ⏳ 예정 |


---
## 🟢 Part 1: 파티셔닝 전략과 데이터 순서 보장

Apache Kafka는 높은 처리량과 확장성을 제공하는 분산 메시징 플랫폼입니다. 시스템 설계 시 데이터의 순서 보장과 처리 효율을 결정짓는 핵심 요소인 파티셔닝에 대해 정리합니다.

파티셔닝은 시스템의 **Throughput(처리량)** 과 **Message Ordering(순서 보장)** 이라는 두 마리 토끼 사이에서 최적의 균형점을 찾는 **엔지니어링 의사결정**의 핵심으로, 이 트레이드오프의 본질을 파헤쳐 봅니다.

## 1. Kafka 파티션의 핵심 개념
파티션은 토픽을 분할하여 병렬 처리를 가능하게 하는 단위입니다.
- **병렬성**: 파티션 수만큼 컨슈머 그룹 내의 컨슈머가 동시에 데이터를 처리할 수 있습니다.
- **순서 보장**: Kafka는 **파티션 내에서는** 메시지의 순서를 보장하지만, 여러 파티션 간의 전역적인 순서는 보장하지 않습니다.

### 2. 파티션 수 산정의 원칙

파티션은 병렬 처리의 단위이자 확장의 핵심이다. 카프카의 로그 세그먼트 구조상 **파티션 축소는 불가능**하므로 초기 산정이 중요하다.

* **정량적 산정:** $\text{Target Throughput} / \text{Individual Consumer Throughput}$
* **고려사항:** 파티션이 과도할 경우 브로커 장애 시 리더 선출(Leader Election) 오버헤드가 발생하여 가용성에 영향을 줄 수 있다.

### 3. 순서 보장(Ordering) 메커니즘

카프카는 **파티션 단위의 순서 보장**만을 제공한다. 전체 토픽 순서 보장이 필요하다면 파티션을 1개로 제한해야 하며, 이는 확장성을 포기하는 트레이드오프를 수반한다.

* **Key-based Partitioning:** 메시지 키를 해싱하여 특정 파티션에 할당.
* 동일 키 메시지는 항상 동일 파티션으로 전달되어 순서 보장.
* **Hot Partition 문제:** 특정 키에 데이터가 쏠릴 경우 해당 파티션을 담당하는 컨슈머가 병목 지점이 됨.


* **Sticky Partitioning (v2.4+):** 키가 없을 때 배치 효율을 높이기 위해 특정 파티션으로 메시지를 모아 보내는 최신 기본 전략.

### 3. 확장성(Scalability) 설계 팁

* **Over-provisioning:** 향후 트래픽 증가를 고려하여 필요한 파티션보다 1.5~2배 정도 넉넉히 생성하는 것이 실무적으로 유리하다.
* **Key Hashing 주의:** 파티션 개수가 변경되면 기존 키가 매핑되던 파티션 번호가 바뀌므로, 상태 기반 처리를 하는 경우 데이터 정합성 이슈가 발생할 수 있다.

---

## ⚪ Day 2: Core Architecture (Coming Soon)

* [ ] Page Cache와 Sequential I/O의 상관관계
* [ ] Zero-copy 전달 방식의 네트워크 효율성
* [ ] ISR(In-Sync Replicas) 관리를 통한 고가용성 보장

---

## 📚 주요 참고 문헌 (References)

* *Kafka: The Definitive Guide (2nd Ed.)* - Gwen Shapira et al.
* *Effective Kafka* - Emil Koutanov
