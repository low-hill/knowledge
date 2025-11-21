## 🚀 Vert.x 란?
Vert.x는 JVM 기반의 반응형(Reactive) 툴킷으로, 비동기적이고 이벤트 중심적인 애플리케이션을 손쉽게 구축할 수 있도록 설계되었습니다. 
Java, Kotlin, Groovy 등 다양한 언어를 지원해 개발자 친화적이며, 멀티 리액터(Multi-Reactor) 패턴을 통해 고성능 병렬 처리를 가능하게 합니다.

## Multi-Reactor 패턴이란?
Node.js가 단일 이벤트 루프 스레드로 동작하는 것과 달리, Vert.x는 CPU 코어 × 2 개수만큼 이벤트 루프 스레드를 생성합니다. 
각 이벤트 루프 스레드는 새로운 작업(예: 요청 처리)을 감지하고 빠르게 적절한 Verticle로 전달합니다. 

즉, Vert.x는 단일 스레드 병목을 피하고, 여러 개의 Event Loop Thread를 활용해 하드웨어 성능을 극대화합니다.

## 🔑 Vert.x의 핵심 개념

### 1. Verticle — Vert.x의 실행 단위

Verticle은 Vert.x가 코드를 배포하고 실행하는 기본 모듈이자, 비즈니스 로직을 담는 가장 작은 실행 단위입니다. Vert.x는 각 Verticle 인스턴스를 하나의 이벤트 루프(논블로킹 작업 전용) 또는 워커 스레드(블로킹 작업 허용)에 전담 배치해 순차적으로 이벤트를 처리하게 합니다. 
즉, 한 Verticle 인스턴스는 지정된 단일 스레드에서만 실행되어 다른 스레드가 동시에 접근하지 않으므로 일관된 컨텍스트를 유지하고, 복잡한 동기화나 데이터 경합 문제를 의식하지 않고도 로직을 작성할 수 있습니다.

Vert.x가 보장하는 핵심 규칙은 다음과 같습니다.

- **싱글 스레드 실행 보장**  
  한 Verticle 인스턴스에는 동시에 하나의 스레드만 접근하므로, 락을 잡거나 복잡한 동기화 코드를 넣을 필요가 없습니다.

- **메시지 기반 협업**  
  Verticle 간 협업은 Event Bus를 통한 메시지 패싱으로 이뤄집니다. 상태를 직접 공유하지 않고, 이벤트 기반으로 데이터를 주고받으면서 결합도를 낮춥니다.

- **비즈니스 로직 캡슐화**  
  API 요청 처리, 데이터 파이프라인 이벤트 대응, 메시지 큐 소비처럼 외부 이벤트에 즉시 반응해야 하는 비지니스 로직을 Verticle 단위로 캡슐화하면, 배포·스케일 전략이 자연스럽게 정리됩니다.

Verticle을 통해 “반응형” 애플리케이션 구조가 명확하게 드러납니다. 하나의 Verticle이 하나의 책임에 집중하고, Event Bus를 통해 느슨하게 연결된 모듈들이 고성능 이벤트 드리븐 서비스를 구현합니다.


#### Verticle의 종류:

- Standard Verticle: 이벤트 루프 스레드에서 실행. 빠른, 논블로킹 작업에 적합.

- Worker Verticle: 워커 스레드에서 실행. DB 쿼리, 파일 I/O 같은 블로킹 작업에 적합.

#### Event Loop 란?
   Vert.x의 이벤트 루프는 초고속 작업자(worker)와 같습니다. 요청, 타이머, 메시지 등 처리할 일이 생기면 즉시 대응합니다.

이벤트 루프 스레드는 항상 논블로킹으로 동작해야 하며, 빠르게 작업을 끝내고 다음 이벤트를 처리합니다.

CPU 코어가 4개라면 기본적으로 8개의 이벤트 루프 스레드가 생성되어, 효율적인 동시성을 제공합니다.

2. Event Bus
   
EventBus는 Verticle 간 통신을 위한 고속 인메모리 메시징 시스템입니다. 
클러스터 환경에서는 JVM을 넘어 네트워크를 통해 다른 노드의 Verticle과도 메시지를 주고받을 수 있고 아래와 같은 3가지 메시징 패턴을 제공합니다.
A fast, in-memory messaging system used for inter-verticle communication.
It supports 3 messaging patterns across the same JVM or even across the network in a clustered setup.

Publish/Subscribe: 모든 구독자에게 메시지를 브로드캐스트.

Point-to-Point: 특정 주소의 한 소비자에게만 메시지 전달.

Request/Reply: 요청-응답 패턴으로 결과를 반환.
