Spring Boot에서 Tomcat의 구성과 설정을 최적화하여 어플리케이션의 성능과 리소스 활용도를 높여야 한다. 다음과 같은 방법으로 Tomcat을 튜닝할 수 있다.
> 스레드 풀 설정

> NIO 또는 APR 커넥터 사용

> JVM 최적화
  
## 

## 1. 스레드 풀 설정

**configuration 파일을 통한 설정**

***

Spring Boot 어플리케이션에서 어플리케이션에 대한 스레드 처리를 최적화하도록 내장된 Tomcat 서버를 구성해야 한다. 

Tomcat 스레드 설정을 구성하려면 application.properties 또는 application.yml 파일에서 server.tomcat 속성을 사용한다. 주요 속성은 다음과 같다.

* server.tomcat.threads.max: 스레드 풀의 최대 스레드 수를 설정
* server.tomcat.threads.min-spare: 스레드 풀에 대기중인 최소 스레드 수를 설정
* server.tomcat.accept-count: 들어오는 연결 요청에 대한 최대 대기열 길이를 설정

**Executor를 통한 설정** 

***

Spring Boot 어플리케이션에서 executor Bean을 생성 및 구성하여 스레드 풀을 유연하게 관리할 수 있다.

```
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

@Configuration
public class ExecutorConfig {
    @Bean
    public ThreadPoolTaskExecutor threadPoolTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10);
        executor.setMaxPoolSize(200);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("custom-executor-");
        return executor;
    }
}
```


## 2. NIO 혹은 APR Connectors 설정

NIO 혹은 APR connector를 사용하면 웹 어플리케이션의 성능을 향상할 수 있고 많은 수의 동시접속 처리 및 non-blocking I/O 작업에도 효과적이다. 이는 웹어플리케이션 빠른 응답과 향상된 확장성을 가능하게 하고 다음과 같이 사용한다.


**NIO Connector**

NIO를 사용하면 Tomcat이 적은 스레드로 더 많은 연결을 처리하여 스레드 관리 오버헤드를 줄이고 동시 접속이 많은 어플리케이션에 적합합니다.

spring boot configuration 파일에서 다음과 같이 설정한다.
```
server.tomcat.protocol="org.apache.coyote.http11.Http11NioProtocol"
```


**APR Connector**

APR Connector를 사용하면 트랙픽이 많은 어플리케이션성능을 향상 시킨다. APR Connector를 사용하려면 서버에 APR 라이브러리를 설치하고 해당 라이브러리를 어플리케이션에 추가하여 빌드되어야 한다.

spring boot configuration 파일에서 다음과 같이 설정한다.
```
server.tomcat.protocol="org.apache.coyote.http11.Http11AprProtocol"
```

## 3. JVM Optimization

JVM을 최적화하여 톰캣 기반 어플리케이션이 효율적으로 실행되고 최적의 성능을 발휘하는데 매우 중요하다. 다음은 JVM 최적화를 위한 고려 사항이다.

* **적절한 JVM 버전 선택**
  * 적절한 최신 JVM 버전을 사용하고 있는지 확인해야 한다. Oracle의 JDK, OpenJDK 및 AdoptOpenJDK는 일반적으로 Tomcat과 함께 사용되는데, 지원되고 안전하며 애플리케이션과 호환되는 버전을 선택한다.

* **적절한 가비지 컬렉션 선택**
  * 가비지 컬렉션는 JVM의 메모리 관리를 담당하므로 적절한 가비지 컬렉션을 선택하면 어플리케이션의 성능에 큰 영향을 미칠 수 있다.
  * 상황에 따라 필요한 가비지 컬렉션 방식을 설정해서 사용해야 하고 일반적으로 선택할 수 있는 방식은 다음과 같다.
       > Parallel Garbage Collector (GC)
      * 대부분의 애플리케이션 특히 수명이 짧은 객체가 많은 어플리케이션에 적합.
       > CMS GC (Concurrent Mark-Sweep)
      * stop-the-world 시간이 짧지만 오버헤드가 발생한다.
       > G1 Garbage Collector
      * 64비트 컴퓨터 최적화된 GC로 4GB 이상의 Heap size 에 적합
      * 지연 시간이 짧고 pause time이 예측가능한 어플리케이션에 적합 (빠른 응답과 짧은 pause time)
       > ZGC (Z Garbage Collector)
      * 최신 JVM 버전(Java 15에 release)에서 사용할 수 있는 지연 시간이 GC로 대량의 메모리(8MB ~ 16TB)를 low-latency로 잘 처리
      * 큰 heap size에서도 low-pause를 보장하기 때문에 빠른 응답시간을 제공해야 하는 어플리케이션에 적합

* **Heap Memory 설정**

  최적의 JVM 성능을 위해서는 적절한 힙 사이즈 설정이 중요하다. 일반적인 힙 크기 옵션은 다음과 같다.

  * -Xmx (maximum heap size): 에플리케이션의 메모리 필요에 따라 적절한 값으로 설정
  * -Xms (initial heap size): 시작 성능과 메모리 효율성을 고려하여 초기 힙 사이즈를 설정
  * -Xmn (young generation size): 객체 생성 패턴을 고려하여 young generation 사이즈 설정

* **JVM Option 설정**
  
  JVM 옵션을 설정하면 성능 및 메모리 관리에 영향을 미칠 수 있는데 일반적으로 사용되는 옵션은 아래와 같다.

  * -XX:MaxMetaspaceSize: 최대 metaspace size
  * -XX:MaxDirectMemorySize: 최대 direct memory size (어플리케이션 direct memory 사용이 빈번한 경우)

부하 테스트를 수행하여 실제 트래픽을 시뮬레이션하고 성능 저하 없이 예상되는 부하를 처리할 수 있는지 확인 해야 한다.

Reference
* [3 Ways to tune Apache Tomcat in Spring Boot](https://medium.com/@dharampro/3-ways-to-tune-apache-tomcat-in-spring-boot-891691915cb2)
* [spring boot docs application-properties server.tomcat](https://docs.spring.io/spring-boot/docs/current/reference/html/application-properties.html#appendix.application-properties.server)
* [Garbage Collector 제대로 알기](https://velog.io/@recordsbeat/Garbage-Collector-%EC%A0%9C%EB%8C%80%EB%A1%9C-%EC%95%8C%EA%B8%B0#gc%ED%8A%9C%EB%8B%9D%EC%9D%B4%EB%9E%80-%EC%96%B4%EB%96%A4%ED%96%89%EC%9C%84)
* [Java 메모리 관리](https://learn.microsoft.com/ko-kr/azure/spring-apps/concepts-for-java-memory-management)