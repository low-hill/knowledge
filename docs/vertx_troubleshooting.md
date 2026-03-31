---
title: Vert.x Troubleshooting
layout: default
---

# 실무 환경에서의 Vert.x 운영 포인트 6가지

> **요약**: Vert.x 도입 시 성능 저하와 운영 이슈를 예방하기 위해 반드시 고려해야 할 'Event Loop 모니터링', 'Blocking 처리 전략', 'Context 관리', '인스턴스 튜닝', 'EventBus 효율성', 'DB 최적화', 'Future 활용'에 대한 실무적인 가이드를 정리했습니다.

---

## 1. BlockedThreadChecker 임계값 조정 및 정밀 분석

Vert.x는 Event Loop가 일정 시간 이상 차단될 경우 경고 로그를 출력합니다. 기본 설정은 2초(2000ms)이지만, 실시간성이 요구되는 환경에서는 이 기준을 더 엄격하게 관리할 필요가 있습니다.

### 임계값(Threshold) 튜닝

`VertxOptions`를 통해 감시 주기를 단축하여, 개발 단계에서 미세한 병목 구간을 조기에 발견하는 것이 좋습니다.

```java
VertxOptions options = new VertxOptions()
    .setBlockedThreadCheckInterval(500) // 체크 주기: 0.5초
    .setMaxEventLoopExecuteTime(500 * 1_000_000L) // 허용 점유 시간: 0.5초
    .setWarningExceptionTime(500 * 1_000_000L); // 경고 시간 초과 시 스택 트레이스 포함

Vertx vertx = Vertx.vertx(options);
```

### 정밀 분석 방법

로그에 출력되는 스택 트레이스는 감시 시점의 스냅샷이므로 실제 원인 파악에 한계가 있을 수 있습니다. 정확한 분석을 위해서는 **JFR(Java Flight Recorder)**이나 APM 도구를 활용하여 해당 핸들러의 실행 시간과 리소스 점유율을 교차 검증해야 합니다.

---

## 2. Blocking 작업 처리 전략: executeBlocking과 Worker Verticle

Blocking 코드를 처리할 때는 작업의 성격에 따라 적절한 격리 전략을 선택해야 합니다.

### 전략 A: executeBlocking (공용 Worker Pool)

단순한 DB 조회나 짧은 파일 I/O 등 가벼운 블로킹 작업에 적합합니다. 
공용 Worker Thread Pool을 사용하므로 구현이 간편하지만, 특정 작업이 스레드를 오래 점유할 경우 전체 처리 성능에 영향을 줄 수 있습니다.

### 전략 B: Worker Verticle (전용 Worker Pool)

암호화 연산이나 대용량 데이터 처리 같이 CPU 점유가 높거나 수행 시간이 긴 작업은 독립된 **Worker Verticle**로 분리하는 것이 유리합니다.

```java
// Worker Verticle 배포 설정
DeploymentOptions options = new DeploymentOptions()
    .setWorkerPoolName("heavy-crypto-pool")
    .setWorkerPoolSize(10); // 풀 크기 지정

vertx.deployVerticle("com.my.HeavyWorkerVerticle", options);
```

**핵심**: 모든 블로킹 작업을 기본 풀(Default Pool)에서 처리하기보다, 작업 부하에 따라 스레드 풀을 **격리(Isolation)**하여 시스템 안정성을 확보해야 합니다.

---
## 3. 비동기 환경에서의 Context 관리

Spring 프레임워크에 익숙한 경우 `ThreadLocal`을 사용하여 요청 컨텍스트를 전달하려는 시도를 하기 쉽습니다. 하지만 Vert.x 환경에서는 다음과 같은 이유로 `ThreadLocal` 사용을 지양해야 합니다.

### ThreadLocal 사용 시 문제점

1. **Thread Reuse (스레드 재사용)**: Event Loop 스레드는 다수의 요청을 처리하므로, `ThreadLocal` 값을 적절히 초기화하지 않을 경우 다른 요청 간 데이터 오염(Data Leak)이 발생할 수 있습니다.
2. **Boundary Crossing (스레드 전환)**: `executeBlocking` 등을 사용하여 Event Loop에서 Worker Thread로 작업이 넘어갈 때, 스레드가 변경되므로 저장된 값을 참조할 수 없습니다.

### 해결: 요청 컨텍스트는 "명시적으로 전달"하고, 관측 목적이면 표준 Tracing을 사용

요청 컨텍스트(예: `traceId`, `requestId`, `userId`)를 비동기 흐름에서 안전하게 다루려면, ThreadLocal 대신 아래 우선순위를 권장합니다.

- **(1) 명시적으로 전달**
  - 메서드 파라미터로 전달
  - EventBus 메시지 payload 또는 headers로 전달
- **(2) 관측/추적 목적이면 표준 Tracing 도구(OpenTelemetry 등)**로 전파를 구성
- **(3) Vert.x `Context`는 "같은 실행 컨텍스트 내부"에서의 부가 데이터 저장 용도로 제한적으로 사용**

아래는 Vert.x Web을 기준으로, 요청 단위 컨텍스트를 생성/보관하고(Event Loop) 내부 비동기 경계(EventBus, executeBlocking)를 넘길 때 **명시적으로 전달**하는 예시입니다.

#### 예시 A) RoutingContext에 requestId + 사용자 컨텍스트 생성/보관

```java
record RequestContext(String requestId, String userId) {}

var router = Router.router(vertx);

router.route().handler(ctx -> {
  var requestId = ctx.request().getHeader("x-request-id");
  if (requestId == null || requestId.isBlank()) {
    requestId = java.util.UUID.randomUUID().toString();
  }

  var userId = ctx.request().getHeader("x-user-id");
  if (userId == null || userId.isBlank()) {
    userId = "anonymous";
  }

  var requestContext = new RequestContext(requestId, userId);
  ctx.put("requestContext", requestContext);

  ctx.response().putHeader("x-request-id", requestId);
  ctx.next();
});
```

#### 예시 B) EventBus request/reply: headers로 requestId + 사용자 컨텍스트 명시적 전달

```java
// Producer (HTTP Handler)
router.get("/users/:id").handler(ctx -> {
  var requestContext = (RequestContext) ctx.get("requestContext");
  var targetUserId = ctx.pathParam("id");

  var options = new DeliveryOptions()
    .addHeader("x-request-id", requestContext.requestId())
    .addHeader("x-user-id", requestContext.userId());

  vertx.eventBus().<String>request("user.service.get", targetUserId, options)
    .onSuccess(reply -> ctx.response().end(reply.body()))
    .onFailure(ctx::fail);
});

// Consumer (Service)
vertx.eventBus().consumer("user.service.get", msg -> {
  var requestId = msg.headers().get("x-request-id");
  var callerUserId = msg.headers().get("x-user-id");
  var targetUserId = (String) msg.body();

  msg.reply("targetUser=" + targetUserId + ", caller=" + callerUserId + ", requestId=" + requestId);
});
```

#### 예시 C) executeBlocking 경계: 파라미터로 전달(가장 단순/안전)

```java
router.get("/blocking").handler(ctx -> {
  var requestContext = (RequestContext) ctx.get("requestContext");

  vertx.executeBlocking(() -> {
    // worker thread에서 실행됨: ThreadLocal/Context 자동 전파에 의존하지 말 것
    return blockingCall(requestContext);
  }, false)
    .onSuccess(result -> ctx.response().end(result))
    .onFailure(ctx::fail);
});

private String blockingCall(RequestContext requestContext) {
  return "done, requestId=" + requestContext.requestId() + ", userId=" + requestContext.userId();
}
```

---

## 4. 하드웨어 스펙에 맞춘 인스턴스 튜닝

Vert.x의 성능을 극대화하려면 하드웨어 리소스(CPU Core)에 맞춰 Event Loop와 Verticle 인스턴스 수를 적절히 배치해야 합니다.

### Event Loop Thread Size

기본적으로 Vert.x는 `CPU Core * 2`개의 Event Loop 스레드를 생성합니다.
컨테이너(Docker/K8s) 환경에서는 `Runtime.getRuntime().availableProcessors()`가 호스트의 전체 코어가 아닌, **컨테이너에 할당된 Limit**을 정확히 인식하는지 확인해야 합니다. (JDK 버전에 따라 cgroup 인식 동작이 다르니, 현재 런타임이 quota/limit을 반영하는지 확인하고 필요 시 관련 JVM 옵션을 조정)

- **컨테이너 환경 이슈**: 컨테이너 환경에서는 JVM이 **컨테이너에 할당된 CPU Limit(CGroup)**을 정확히 인식하도록 해야 하며, 그렇지 않으면 Vert.x 이벤트 루프와 Worker Pool 스레드가 실제 할당량보다 과도하게 생성되어 성능 저하가 발생할 수 있습니다.
- **수치 튜닝**: `Core * 2`는 I/O 대기 시간을 효율적으로 활용하기 위한 기본값이지만, 절댓값은 아닙니다. 어플리케이션의 성격(CPU 집약적 vs I/O 집약적)에 따라 `VertxOptions`에서 수동으로 최적화할 수 있습니다.

### Verticle Instance Scaling

단 하나의 Verticle 인스턴스만 띄우면 하나의 Event Loop 스레드만 사용하게 됩니다. 멀티 코어 환경을 100% 활용하려면, 배포 시 `instances` 옵션을 설정하여 병렬 처리량을 늘려야 합니다.

```java
// CPU 코어 수만큼 인스턴스를 복제하여 배포
int cores = Runtime.getRuntime().availableProcessors();

DeploymentOptions options = new DeploymentOptions()
    .setInstances(cores); // 코어 수만큼 인스턴스 생성

vertx.deployVerticle("com.my.MainVerticle", options);
```

이렇게 하면 각 Verticle 인스턴스가 서로 다른 Event Loop 스레드에 할당되어, 트래픽을 각 코어로 분산(Load Balancing) 처리할 수 있게 됩니다.

## 5. EventBus 효율성: Serialization Overhead 줄이기

Vert.x의 핵심인 **EventBus**는 편리하지만, 무심코 사용하면 시스템 병목으로 작용할 수 있습니다. 특히 JsonObject로 변환하거나 mutable 객체를 반복 복사/재사용하는 구조에서는, 로컬 통신에서도 깊은 복사로 인한 CPU와 메모리 비용이 발생할 수 있습니다.”

### 주요 병목 원인
EventBus로 메시지를 전송할 때 payload 형태에 따라 **(로컬이라도) 메시지 복사/변환 비용**이 발생할 수 있습니다. 또한 클러스터링(노드 간 전송) 환경에서는 wire 전송을 위한 **인코딩/디코딩** 비용이 추가됩니다.

따라서 실무에서 흔히 경험하는 병목은 다음과 같은 payload 처리 비용입니다:
1. **불필요한 JSON stringify/parse**
2. **큰 객체의 반복 복사**
3. **클러스터링 시 wire codec 비용**

### 해결: 목적에 맞는 payload + (필요 시) Custom Codec

- **로컬 단일 JVM**: 가능하면 **불변(immutable) DTO**를 사용하고, 큰 payload를 `JsonObject`로 변환을 최소화합니다.
- **클러스터링 가능성 있음**: 초기에부터 **wire codec(encode/decode)** 전략을 갖추거나, 로컬 최적화용 codec와 분리합니다.

```java
// 로컬 통신용 Codec 예시
class LocalObjCodec implements MessageCodec<MyObj, MyObj> {
    public MyObj transform(MyObj s) { return s.copy(); } // 안전 복사
    public void encodeToWire(...) { throw new UnsupportedOperationException(); }
    public MyObj decodeFromWire(...) { throw new UnsupportedOperationException(); }
}

// Codec 등록 및 전송
vertx.eventBus().registerDefaultCodec(MyObj.class, new LocalObjCodec());
vertx.eventBus().send("local.addr", myInstance);
```

---

## 6. 고성능 DB 처리를 위한 Reactive 패턴 (Client, Streaming, Composition)

DB 연동은 백엔드 시스템의 가장 큰 병목 구간입니다. Vert.x에서는 이 구간을 **"어떤 클라이언트로, 어떻게 데이터를 가져와서, 어떻게 조립하느냐"**가 성능을 좌우합니다.

### A. Client 선택: "무늬만 비동기" 탈출하기

Legacy 시스템의 JDBC 드라이버를 `executeBlocking`으로 감싸서 쓰는 것은, 결국 Worker Thread를 잠식하는 임시방편일 뿐입니다.
가능하다면 **Reactive SQL Client**(MySQL, PgClient 등)를 도입하세요. I/O 처리까지 Event Loop 내에서 Non-blocking으로 처리되므로, 적은 리소스로 JDBC 대비 월등한 처리량을 확보할 수 있습니다.

### B. 메모리 관리: `RowStream`을 통한 Backpressure

수만 건의 데이터를 `List`로 한 번에 조회하면 OOM(Out Of Memory) 위험이 큽니다. **RowStream**을 사용하면 데이터를 한 줄씩(Row by Row) 스트리밍하며, 소비 속도에 맞춰 DB 조회 속도를 조절(Backpressure)할 수 있습니다.

```java
connection
  .prepare("SELECT * FROM large_log_table")
  .onComplete(ar1 -> {
    if (ar1.succeeded()) {
      PreparedStatement pq = ar1.result();

      // 50개씩 끊어서 fetch
      RowStream<Row> stream = pq.createStream(50);

      // Error handling
      stream.exceptionHandler(err -> {
        System.out.println("Error: " + err.getMessage());
      });

      // Each row handler
      stream.handler(row -> {
        System.out.println("User: " + row.getString("last_name"));
      });

      // End of stream
      stream.endHandler(v -> {
        System.out.println("End of stream");
      });
    }
  });
```

### C. 흐름 제어: `Future` Composition으로 콜백 지옥 제거

Reactive Client 사용 시 가장 주의할 점은 "콜백 지옥"입니다. Vert.x 4의 강력한 **Future API**를 사용하여 비즈니스 로직을 구조적으로 표현해야 합니다.

* **병렬 조립 (Scatter-Gather)**: `Future.all`
  * 독립적인 두 테이블(User, Order)을 동시에 조회하여 응답 속도 단축.
* **순차 연결 (Chaining)**: `compose`
  * 앞선 쿼리 결과(UserID)를 받아 다음 쿼리(UserDetail)를 실행하는 의존성 처리.

```java
// 예시: 유저 조회 후 -> 주문 내역 병렬 조회
client.query("SELECT id FROM users WHERE name='kim'").execute()
    .compose(rows -> {
        Long id = rows.iterator().next().getLong("id");
        // 주문과 포인트 정보를 동시에(병렬) 조회
        return Future.all(
            client.query("SELECT * FROM orders WHERE uid=" + id).execute(),
            client.query("SELECT * FROM points WHERE uid=" + id).execute()
        );
    })
    .onSuccess(composite -> { /* 결과 조합 */ });
```

---

## 마치며
  
 Vert.x는 Event Loop 기반으로 높은 동시성과 처리량을 만들 수 있지만, 그만큼 **"Event Loop를 막지 않는다"**는 규율과 운영 관점의 튜닝이 필수입니다. 위 운영 포인트를 기준으로 병목을 조기에 발견하고(모니터링), 블로킹/직렬화/대용량 처리 구간을 격리·최적화하면, 시행착오를 줄이면서 안정적으로 운영할 수 있습니다.
  
 ### References

- [Vert.x Core Documentation: VertxOptions (BlockedThreadChecker)](https://vertx.io/docs/vertx-core/java/#_configuring_options)
- [Vert.x Core Documentation: Worker Verticles](https://vertx.io/docs/vertx-core/java/#_worker_verticles)
- [Vert.x Core Documentation: The Context Object](https://vertx.io/docs/vertx-core/java/#_the_context_object)
- [Vert.x Reactive SQL Client: Streaming Results](https://vertx.io/docs/vertx-pg-client/java/#_streaming_results)
- [Vert.x Core Documentation: Composing Futures](https://vertx.io/docs/vertx-core/java/#_composing_futures)
