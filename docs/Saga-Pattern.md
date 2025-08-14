---
layout: default
---

## Saga 패턴
Saga 디자인 패턴은 마이크로 서비스 간의 트랙잭션을 조정하여 데이터 일관성을 보장하는 패턴이다. Saga 패턴은 마이크로서비스의 트랜잭션에 대한 이벤트를 게시하여 다음 마이크로서비스에 대한 트랜잭션을 트리거한다. 만약 단계 중 실패가 발생 시 이전 마이크로서비스에 롤백 이번트를 게시하여 트랜잭션을 롤백하도록 트리거한다.    

Saga 패턴은 분산 트랜잭션에서 전체 트랜잭션이 성공적으로 완료되거나 개별 마이크로서비스에 오류가 발생할 경우 초기 상태로 롤백되도록 보장할 수 있다.     
모든 마이크로서비스는 자체 데이터베이스를 가지고 있어 일관성을 유지하면서 트랜잭션을 관리할 수 있다. Saga 패턴 이러한 로컬 트랜잭션을 하나씩 순차적으로 호출하여 처리한다. 각 로컬 트랜잭션은 데이터베이스를 업데이트하고 다음 로컬 트랜잭션을 트리거하기 위해 이벤트를 게시해서 정합성을 맞춘다. 이 단계 중 하나에 실패하면 이전 마이크로서비스의 변경 사항을 롤백하고 데이터 일관성을 복원하는 보상 트랜잭션인 롤백 트랜잭션이 트리거된다. 즉 일관성 유지가 필요한 트랜잭션을 묶어서 처리하는 대신 로컬 트랜잭션을 하나씩 순차적으로 처리하고 이번트 게시하여 다음 로컬 트랜잭션을 처리한다.  

## Saga 패턴의 유형
Saga 패턴을 구현하는 방법에는 'choreography'와 'orchestration'이라는 두 가지 유형이 있다.
>### Choreography Saga Pattern
Choreography Saga Pattern은 publish-subscribe 원칙을 적용하여 트랜잭션을 조율하는 기능을 제공한다. 각 마이크로서비스는 자체 로컬 트랜잭션을 실행하고 메시지 브로커 시스템에 이벤트를 게시하여 다른 마이크로서비스에서 로컬 트랜잭션을 트리거한다.      
아래 그림과 같이 Choreography Saga는 각자의 책임을 가지기 때문에 서비스 간의 결합도는 느슨하지만, 복잡도가 높다. 이 방법은 마이크로서비스 트랜잭션 단계가 너무 많지 않은 심플한 워크플로에 적합하다.      
![image](https://github.com/low-hill/Knowledge/assets/6086626/a54ab0ca-3fbb-4027-abdb-abe0a8ad26f1)

>### Orchestration Saga Pattern
Orchestration Saga는 트랜잭션을 중앙 집중식으로 관리한다. 중앙 집중식 컨트롤러 마이크로서비스는 마이크로서비스의 로컬 트랜잭션을 순차적으로 실행하도록 호출하고, 단게 중 하나에 실패하면 보상 트랜잭션으로 롤백 단계를 실행한다.
Orchestration Saga는 중앙 컴포넌트가 트랜잭션을 제어하므로 서비스 간의 복잡성은 줄어들지만, 서비스 간의 결합도가 높아진다. 이 방법은 많은 단계를 포함하는 복잡한 워크플로에 적합할 수 있지만 중앙 컴포넌트가 장애 발생시를 고려해야 한다.     
![image](https://github.com/low-hill/Knowledge/assets/6086626/3fb9079a-7500-4936-8db9-7420a2afeb91)

### 보상 트랜잭션(Compensating Transaction)
SAGA 패턴을 사용하려면 보상 트랜잭션을 사용하여 오류 발생 시 각 마이크로서비스에서 변경한 내용을 취소할 수 있다. 이렇게 하면 전체 트랜잭션이 성공적으로 완료되거나 초기 상태로 롤백되도록 보장할 수 있다.   

Reference
* [Saga 분산 트랜잭션 패턴](https://learn.microsoft.com/ko-kr/azure/architecture/reference-architectures/saga/saga)
* [Microservices Series Part 1: Introduction to the Saga Pattern for Distributed Transactions](https://blog.stackademic.com/microservices-series-part-1-introduction-to-the-saga-pattern-for-distributed-transactions-be59b45b7e80)
* [Saga Pattern for Microservices Distributed Transactions](https://medium.com/design-microservices-architecture-with-patterns/saga-pattern-for-microservices-distributed-transactions-7e95d0613345)
* [MSA 환경에서 데이터 관리를 위한 필수사항- 고가용성과 데이터 동기화](https://www.samsungsds.com/kr/insights/mas_data.html)