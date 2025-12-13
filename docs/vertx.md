## 🚀 Vert.x 란?
Vert.x는 JVM 기반의 **비동기(Asynchronous), 이벤트 기반(Event-driven), Non-blocking** 애플리케이션을 만들기 위한 툴킷입니다. “스레드를 요청마다 늘리는 방식” 대신, **Event Loop + 콜백(핸들러) + 메시지 패싱**을 통해 높은 동시성을 달성하는 모델을 제공한다는 점입니다.
Java, Kotlin, Groovy 등 다양한 언어를 지원해 개발자 친화적이며, 멀티 리액터(Multi-Reactor) 패턴을 통해 고성능 병렬 처리를 가능하게 합니다.

## Multi-Reactor 패턴이란?
Node.js가 기본적으로 단일 Event Loop 중심이라면, Vert.x는 기본 설정으로 대략 **CPU 코어 수 × 2** 수준의 Event Loop 스레드를 생성합니다. 다만 이 값은 **기본값(default)**으로, 서비스 특성/리소스/배포 환경에 따라 `VertxOptions#setEventLoopPoolSize` 등으로 조정할 수 있습니다.
각 이벤트 루프 스레드는 새로운 작업(예: 요청 처리)을 감지하고 빠르게 적절한 Verticle로 전달합니다.

- **Event Loop 스레드의 역할**
  - 네트워크 이벤트(HTTP), 타이머, Event Bus 메시지 등 “처리할 이벤트”를 빠르게 핸들러로 전달
  - 반드시 **짧고 빠르게 끝나는 작업**을 처리해야 함
- **중요한 전제**
  - Event Loop는 “논블로킹”이어야 성능이 나옵니다.
  - Event Loop에서 블로킹이 발생하면 그 스레드가 맡은 모든 요청/이벤트가 밀려 **지연이 전파**됩니다.
---

## 핵심 개념 1: Verticle (실행/배포 단위)

Verticle은 Vert.x가 코드를 배포하고 실행하는 기본 모듈이자, 비즈니스 로직을 담는 가장 작은 실행 단위입니다. Vert.x는 각 Verticle 인스턴스를 하나의 이벤트 루프 또는 워커 스레드(블로킹 작업 허용)에 전담 배치해 순차적으로 이벤트를 처리하게 합니다. 
즉, 한 Verticle 인스턴스는 지정된 단일 스레드에서만 실행되어 다른 스레드가 동시에 접근하지 않으므로 일관된 컨텍스트를 유지하고, 복잡한 동기화나 데이터 경합 문제를 의식하지 않고도 로직을 작성할 수 있습니다.

Vert.x가 보장하는 핵심 규칙은 다음과 같습니다.

- **싱글 스레드 실행 보장**  
  한 Verticle 인스턴스에는 동시에 하나의 스레드만 접근하므로, 락을 잡거나 복잡한 동기화 코드를 넣을 필요가 없습니다.

- **메시지 기반 협업**  
  Verticle 간 협업은 Event Bus를 통한 메시지 패싱으로 이뤄집니다. 상태를 직접 공유하지 않고, 이벤트 기반으로 데이터를 주고받으면서 결합도를 낮춥니다.

- **비즈니스 로직 캡슐화**  
  API 요청 처리, 데이터 파이프라인 이벤트 대응, 메시지 큐 소비처럼 외부 이벤트에 즉시 반응해야 하는 비지니스 로직을 Verticle 단위로 캡슐화하면, 배포·스케일 전략이 자연스럽게 정리됩니다.

Verticle을 통해 “반응형” 애플리케이션 구조가 명확하게 드러납니다. 하나의 Verticle이 하나의 책임에 집중하고, Event Bus를 통해 느슨하게 연결된 모듈들이 고성능 이벤트 드리븐 서비스를 구현합니다.


### Verticle의 종류:

- **Standard Verticle**
  - Event Loop 스레드에서 실행
  - “짧은 non-blocking 작업”에 적합

- **Worker Verticle**
  - Worker 스레드에서 실행
  - DB 쿼리, 파일 I/O 같은 블로킹 작업, CPU-heavy 작업을 격리할 때 사용

## 핵심 개념 2: Event Loop (Non-blocking의 중심)
### Event Loop 란?
   Vert.x의 이벤트 루프는 초고속 작업자(worker)와 같습니다. 요청, 타이머, 메시지 등 처리할 일이 생기면 즉시 대응합니다.

이벤트 루프 스레드는 항상 논블로킹으로 동작해야 하며, 빠르게 작업을 끝내고 다음 이벤트를 처리합니다.

예를 들어 CPU 코어가 4개라면 (기본 설정 기준으로) 8개의 이벤트 루프 스레드가 생성될 수 있으며, 이를 통해 효율적인 동시성을 제공합니다.

#### Event Loop에서 하면 안 되는 것(대표 예시):
- 동기 DB 접근(JDBC)
- 동기 HTTP 호출(블로킹 클라이언트)
- 파일 I/O를 그대로 수행
- `Thread.sleep`
- 큰 JSON 직렬화/압축/암호화 같은 오래 걸리는 CPU 작업
Event Loop에서 이런 작업을 하면, 그 순간부터는 “비동기”처럼 보여도 실제로는 **Non-blocking이 깨진 상태**가 됩니다.
---
## 핵심 개념 3: Blocking 작업 처리 (executeBlocking / Worker)
Blocking 작업은 “없애거나”, “격리하거나” 둘 중 하나입니다.  
Vert.x에서 Non-blocking을 지키는 핵심은 **Event Loop에서는 절대 오래 걸리는 작업을 수행하지 않는 것**이고, 불가피하다면 **Worker로 격리**하는 것입니다.
### Blocking 작업이 위험한 이유 (Event Loop stall)
Event Loop는 “이벤트를 빠르게 처리하고 다음 이벤트로 넘어가는 것”이 목적입니다.  
여기서 블로킹이 발생하면 해당 Event Loop 스레드가 맡은 모든 요청/타이머/EventBus 메시지가 동시에 지연됩니다.
- **증상**
  - p99 latency 급증
  - 타임아웃 증가 → 재시도 폭증 → 더 큰 부하(눈덩이)
  - BlockedThreadChecker 경고 로그
### 선택지 A: executeBlocking (공용 Worker Pool)
짧은 블로킹 작업을 “공용 worker pool”로 넘겨 처리합니다.
- 예) 호출 시간이 짧고(짧은 DB 조회 등) 호출 빈도/동시성이 과하지 않을 때
- **장점**
  - 적용이 쉽고, 점진적으로 non-blocking 구조로 전환할 때 유용
- **주의 사항**
  - 공용 풀을 잠식하면 전체 시스템이 같이 느려질 수 있음
```java
vertx.executeBlocking(() -> {
  // 여기서는 블로킹 작업 허용 (예: JDBC, 파일 I/O 등)
  return blockingCall();
}, false)
  // onSuccess/onFailure는 원래 컨텍스트(event loop)로 돌아와 실행됨
  .onSuccess(result -> {
    // 다음 비동기 로직...
  })
  .onFailure(err -> {
    // 에러 처리...
  });
```

### 선택지 B: Worker Verticle (전용 Worker Pool)
무겁거나 오래 걸리는 작업(CPU-heavy/긴 I/O)은 전용 worker pool로 **격리**하는 편이 안전합니다.
- 예) 암호화/압축/대량 변환처럼 CPU 점유가 큰 작업
- 주의 사항
  - worker pool도 자원이며 무한하지 않습니다.
  - pool size를 키우면 throughput이 늘 수 있지만, 과하면 컨텍스트 스위칭/경합으로 역효과가 날 수 있음
---
## 핵심 개념 4: Event Bus (Verticle 간 메시징)
EventBus는 Verticle 간 통신을 위한 고속 인메모리 메시징 시스템입니다. 
로컬(JVM 내부)에서 매우 빠르게 동작하며, 클러스터 환경에서는 JVM을 넘어 네트워크를 통해 다른 노드의 Verticle과도 메시지를 주고받을 수 있고 아래와 같은 3가지 메시징 패턴을 제공합니다.
- **Publish/Subscribe**
  - 모든 구독자에게 브로드캐스트
- **Point-to-Point**
  - 특정 주소의 한 소비자에게만 메시지 전달.
- **Request/Reply**
  - 요청-응답 패턴으로 결과를 반환.

Event Bus를 사용할 때는 아래를 같이 고려하는 게 실무적으로 중요합니다.
- **Timeout**
  - request/reply는 타임아웃을 두지 않으면 장애 시 대기가 누적될 수 있음
- **Failure 설계**
  - 소비자 실패 시 어떤 에러를 돌려줄지, 재시도는 어디에서 할지
- **직렬화 비용**
  - 객체를 JSON으로 변환해 보내면 직렬화/역직렬화 비용이 병목이 될 수 있음
---
## Backpressure(흐름 제어) 감각
높은 동시성 시스템은 “받는 속도 > 처리 속도”가 되는 순간 쉽게 무너집니다.  
Vert.x에서 backpressure는 “이벤트 루프를 빠르게 유지하기 위한 안전장치”에 가깝습니다.
- 생산자가 너무 빨라지면 큐가 차고
- 큐가 차면 지연이 증가하고
- 결국 타임아웃/메모리 급증/장애로 이어질 수 있습니다.
Vert.x에서의 흐름 제어 포인트(개념)
- HTTP 응답을 큰 payload로 한 번에 쓰기보다 스트리밍/청크 전송 고려
- DB 대용량 조회는 RowStream/cursor 기반 streaming으로 소비 속도에 맞춰 fetch
---

운영 이슈와 실무 튜닝은 아래 문서에 정리했습니다.  
- [Vert.x Troubleshooting](vertx_troubleshooting.md)
