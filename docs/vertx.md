## 🚀 Vert.x 란?
Vert.x는 JVM 기반의 **비동기(Asynchronous), 이벤트 기반(Event-driven), Non-blocking** 애플리케이션을 만들기 위한 툴킷입니다. “스레드를 요청마다 늘리는 방식” 대신, **Event Loop + 콜백(핸들러) + 메시지 패싱** 을 통해 높은 동시성을 달성하는 모델을 제공한다는 점입니다.
Java, Kotlin, Groovy 등 다양한 언어를 지원해 개발자 친화적이며, 멀티 리액터(Multi-Reactor) 패턴을 통해 고성능 병렬 처리를 가능하게 합니다.

## Vert.x의 Multi-Reactor 구조
### Multi-Reactor 패턴이란?
전통적인 단일 Event Loop 기반 모델과 달리, Multi-Reactor 패턴은 여러 개의 Event Loop 스레드를 사용해 동시에 많은 이벤트를 처리하는 구조입니다.

예를 들어, Node.js는 기본적으로 단일 Event Loop를 사용하지만, Vert.x는 여러 개의 Event Loop를 활용하여 더 높은 처리량을 낼 수 있도록 설계되어 있습니다.
### Vert.x의 Event Loop 구조
Vert.x는 기본적으로 **CPU 코어 수 × 2** 수준의 Event Loop 스레드를 생성합니다.
이 값은 기본 설정이며, 서비스 특성이나 리소스 상황에 따라 `VertxOptions#setEventLoopPoolSize`로 조정할 수 있습니다.

각 Event Loop 스레드는 서로 독립적으로 동작하며, 들어오는 요청이나 이벤트를 병렬적으로 처리합니다.

### 이벤트 처리 흐름
Vert.x에서 요청이 처리되는 흐름은 다음과 같습니다:

1. 클라이언트 요청(HTTP 등)이 들어옴
2. 여러 Event Loop 중 하나가 요청을 수신
3. Event Loop가 적절한 Verticle 핸들러로 이벤트를 전달
4. 핸들러가 비즈니스 로직을 수행하고 응답을 반환

이 구조 덕분에 여러 요청을 동시에 효율적으로 처리할 수 있습니다.

### 중요한 전제: Non-Blocking
Multi-Reactor 구조가 성능을 발휘하려면 반드시 논블로킹 방식을 유지해야 합니다. 
* Event Loop는 짧고 빠른 작업 처리에 최적화되어 있음
* 하나의 Event Loop에서 블로킹이 발생하면
  * 해당 스레드가 담당하는 모든 요청이 지연되고
  * 결과적으로 전체 시스템 성능 저하로 이어짐

따라서 시간이 오래 걸리는 작업은 별도의 Worker 스레드에서 처리해야 합니다.

이처럼 Event Loop와 Worker 스레드가 역할을 나누는 구조 위에서,
실제 애플리케이션을 구성하는 기본 단위가 바로 Verticle입니다.

---

## 핵심 개념 1: Verticle (실행/배포 단위)

Verticle은 Vert.x가 코드를 배포하고 실행하는 기본 모듈이자, 비즈니스 로직을 담는 가장 작은 실행 단위입니다. 
Vert.x는 각 Verticle 인스턴스를 하나의 Event Loop 또는 Worker 스레드 컨텍스트에 할당하고,
해당 컨텍스트 내에서 순차적으로 이벤트를 처리하도록 합니다.
즉, 한 Verticle 인스턴스는 지정된 단일 스레드에서만 실행되어 다른 스레드가 동시에 접근하지 않으므로 일관된 컨텍스트를 유지하고, 복잡한 동기화나 데이터 경합 문제를 의식하지 않고도 로직을 작성할 수 있습니다.

Vert.x가 보장하는 핵심 규칙은 다음과 같습니다.

- **싱글 스레드 실행 보장**
  하나의 Verticle 인스턴스는 동일한 컨텍스트 내에서 순차적으로 실행되며, 동시에 여러 스레드에서 접근되지 않습니다.

- **메시지 기반 협업**
  Verticle 간 협업은 Event Bus를 통한 비동기 메시지 기반으로 이뤄집니다.  
  상태를 직접 공유하지 않고 이벤트로 통신함으로써 결합도를 낮추고,
  분산 환경에서도 확장 가능한 구조를 만듭니다.

- **비즈니스 로직 캡슐화**
  API 요청 처리, 데이터 파이프라인 이벤트 대응, 메시지 큐 소비 등  
  외부 이벤트에 반응하는 로직을 Verticle 단위로 분리할 수 있습니다.  
  이를 통해 배포 및 스케일 전략을 자연스럽게 구성할 수 있습니다.

Verticle을 통해 “반응형(reactive)” 애플리케이션 구조가 명확해집니다.  
각 Verticle은 하나의 책임에 집중하고, Event Bus를 통해 느슨하게 연결되며,  
이러한 구조가 고성능 이벤트 드리븐 시스템의 기반이 됩니다.


### Verticle의 종류:

- **Standard Verticle**
  - Event Loop 스레드에서 실행
  - “짧은 non-blocking 작업”에 적합

- **Worker Verticle**
  - Worker 스레드에서 실행
  - DB 쿼리, 파일 I/O 같은 블로킹 작업, CPU-heavy 작업을 격리할 때 사용

## 핵심 개념 2: Event Loop (Non-blocking의 중심)
### Event Loop 란?
   Vert.x에서 Event Loop는 이벤트 기반(Event-driven) 실행 모델의 핵심 구성 요소로,
   이벤트를 큐에서 가져와 등록된 핸들러(handler)에 디스패치하는 역할을 합니다.

이 구조는 Reactor Pattern에 기반한 이벤트 처리 모델입니다.

### Event Loop Thread
각 Event Loop는 하나의 전용 스레드에서 실행됩니다.
이 스레드를 Event Loop Thread라고 하며, 각 Event Loop와 1:1로 매핑됩니다.
해당 스레드에서 단일 스레드 방식으로 이벤트를 순차적으로 처리합니다.

* Vert.x는 일반적으로 ` CPU 코어 수 × 2` 개수만큼 Event Loop Thread를 생성합니다.
  - 예를 들어 CPU 코어가 4개라면 약 8개의 Event Loop 스레드가 생성됩니다.
* 이를 통해 **소수의 스레드로 높은 동시성**을 효율적으로 처리할 수 있습니다.
* 단, 각 Event Loop는 단일 스레드에서 동작하며, 전체적으로는 여러 Event Loop를 통해 동시성을 제공합니다.

#### Event Loop에서 하면 안 되는 작업 (대표 예시):
Event Loop Thread가 블로킹되면 전체 이벤트 처리에 영향을 주므로 다음 작업은 피해야 합니다:
- 블로킹 I/O
  - 동기 DB 접근 (JDBC)
  - 동기 HTTP 호출 (블로킹 클라이언트)
  - 파일 I/O 직접 수행

- 명시적 블로킹
  - `Thread.sleep()`
  - 락 대기 (`synchronized`, `wait` 등)

- 오래 걸리는 CPU 작업
  - 대용량 JSON 직렬화 / 파싱
  - 압축, 암호화
  - 이미지 처리 등

> 이러한 작업은 Event Loop Thread를 블로킹시켜, 다른 이벤트 처리를 지연시키고 전체 시스템의 응답성을 저하시킵니다.

---
## 핵심 개념 3: Blocking 작업 처리 (executeBlocking / Worker)
Vert.x에서 Non-blocking을 유지하는 핵심 원칙은:

> Event Loop에서는 절대 오래 걸리는 작업을 수행하지 않는다.

불가피한 Blocking 작업은 "**격리**"를 통해 Event Loop에 영향을 주지 않도록 해야 합니다.

### Blocking 작업이 위험한 이유 (Event Loop Block)
Event Loop의 목적은 이벤트를 빠르게 처리하고 다음 이벤트로 넘어가는 것입니다.
여기서 블로킹이 발생하면:
- 해당 Event Loop Thread가 맡은 모든 요청/타이머/EventBus 메시지가 동시에 지연
- 시스템 성능 저하 → p99 latency 급증
- 타임아웃 증가 → 재시도 폭증 → 부하 눈덩이 효과
- BlockedThreadChecker 경고 로그 발생

### 선택지 A: executeBlocking (공통 Worker Pool)
불가피한 짧은 Blocking 작업은 Vert.x 인스턴스가 관리하는 공통 Worker Pool에서 실행되도록 처리할 수 있습니다.
- executeBlocking에서 수행되는 작업은 Worker Pool에서 실행되고,
- 작업 완료 후 결과 콜백(onSuccess/onFailure)은 원래 Event Loop 컨텍스트에서 실행됩니다.

✔️ 특징
- 적용이 쉽고, 점진적으로 Non-blocking 구조로 전환할 때 유용
- 호출 시간이 짧고(예: 짧은 DB 조회), 호출 빈도가 적정 수준일 때 적합

🔹 예시
```java
vertx.executeBlocking(() -> {
  // 여기서는 블로킹 작업 허용 (예: JDBC, 파일 I/O 등)
  return blockingCall();
}, false)
  // 결과 콜백은 Event Loop 컨텍스트에서 실행
  .onSuccess(result -> {
    // 다음 비동기 로직...
  })
  .onFailure(err -> {
    // 에러 처리...
  });
```

⚠️ 주의 사항
- 공통 Worker Pool을 과도하게 점유하면 전체시스템 응답성이 저하될 수 있음
- 호출 시간이 짧고, 동시성/빈도가 높지 않은 작업에 적합

### 선택지 B: Worker Verticle (전용 Worker Pool)
무겁거나 오래 걸리는 작업은 전용 Worker Pool에서 실행되는 Worker Verticle로 격리하는 것이 안전합니다.
- Worker Verticle에서 수행되는 작업은 Worker Thread에서 실행되며,
- 작업 완료 후 자동으로 원래 Event Loop 컨텍스트로 돌아오지 않습니다.
- 필요하면 Event Bus나 runOnContext를 통해 명시적으로 Event Loop로 결과 전달해야 합니다.

✔️ 특징
- CPU 점유가 큰 작업에 적합
  - 암호화 / 압축 / 대량 데이터 변환
  - 복잡한 이미지 처리

⚠️ 주의 사항
  - Worker Pool도 제한된 자원이며, 무한하지 않음
  - pool size를 키우면 throughput이 늘 수 있지만, 과하면 컨텍스트 스위칭/경합으로 역효과가 날 수 있음
  - CPU/메모리 자원 상황에 맞게 적절히 설정 필요
---
## 핵심 개념 4: Event Bus (Verticle 간 메시징)
Vert.x Event Bus는 서로 다른 Verticle 또는 서비스 구성 요소 간에 느슨하게 결합된 통신을 가능하게 해주는 경량 분산 메시징 시스템입니다.

메시지는 문자열 기반의 address를 통해 라우팅되며, 동일 JVM 내부에서는 고속의 in-memory 방식으로, 클러스터 환경에서는 네트워크를 통해 노드 간 전달됩니다.

또한 Event Bus는 다음 세 가지 메시징 패턴을 지원합니다.

- publish-subscribe
- point-to-point
- request-reply

이때 전달되는 메시지는 기본적으로 best-effort(최선 노력) 방식으로 처리됩니다.
즉, 일부 메시지가 유실될 수 있으며, 내구성을 제공하지 않는다는 점이 중요한 특징입니다.

### 메시지 전달 패턴
Event Bus는 메시지를 전달하는 세 가지 방식을 제공합니다.

#### Publish/Subscribe
Publish/Subscribe 패턴은 특정 address에 메시지를 발행하면, 해당 address를 구독하고 있는 모든 consumer에게 메시지를 전달하는 브로드캐스트 방식입니다.

**특징**
- 동일 이벤트를 여러 consumer가 동시에 수신 가능
- 여러 consumer가 동시에 처리하는 구조이므로 순서가 보장되지 않을 수 있음

#### Point-to-Point
Point-to-Point 패턴은 특정 address에 등록된 하나의 consumer에게 메시지를 전달합니다.

만약 여러 consumer가 등록되어 있다면, Event Bus는 round-robin 방식으로 메시지를 분산 처리합니다.

**특징**
- 한 메시지는 단일 consumer만 처리
- 여러 consumer가 있는 경우 round-robin으로 분산 처리되어 순서가 보장되지 않을 수 있음

### Request/Reply
Request/Reply 패턴은 메시지를 보내고, consumer가 처리한 결과를 다시 응답으로 받는 비동기 RPC 스타일 통신 방식입니다.

Event Bus는 내부적으로 reply address를 생성하여 요청-응답 흐름을 자동으로 연결합니다.

**특징**
- 단일 consumer가 순차적으로 처리하는 경우에만 순서가 유지됨
- 응답 기반 구조 → 타임아웃 설정 필수

### 메시지 전달 시 고려사항
세 가지 패턴 모두 메시지를 전달할 때 몇 가지 공통 특성과 주의점이 있습니다.
- **메시지 순서**
  - 단일 sender → 단일 consumer의 경우만 FIFO 순서 보장
  - 다중 consumer, 클러스터 환경에서는 순서 보장 불가
- **Failure 설계**
  - Event Bus는 재시도/보장 메커니즘이 없기 때문에, 소비자 실패 시 에러 처리 방식과 재시도 전략을 별도로 설계해야 함
- **직렬화 비용**
  - 객체를 JSON으로 변환해 보내면 직렬화/역직렬화 비용이 병목이 될 수 있음(대량 트래픽 시 Custom Codec 권장)
- **Back Pressure 부재**
  - producer 속도를 제한하지 않음 → 빠른 producer + 느린 consumer 조합 시 메모리 증가 및 OOM 위험
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
