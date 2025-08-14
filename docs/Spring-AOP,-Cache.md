---
layout: default
---

# **AOP**
### AOP(Cross-Cutting)

핵심적인 기능에서 부가적인 기능을 분리한다. 분리한 부가기능을 Aspect라는 모듈 형태로 만들어서 설계하고 개발하는 방법


### Aspect 구성

Aspect: 부가기능을 담고 있는 객체

Advise: 실질적인 부가기능을 담은 구현체, Aspect는 '무엇'을 '언제' 할지를 정의

@Around, @Before, @After, @AfterReturning, @AfterThrowing
PointCut: 부가 기능이 적용되어야 할 대상(메소드)을 선정하는 방법

execution(), @annotion, 등등
execution(리턴 타입  타겟이 되는 메소드  argument-매개변수)
ex) execution(* com.dashboard.service.DashboardService(..))
JointPoint: Advise가 적용될 위치, controller에서 정의된 method들의 args(매개변수)를 담고 있는 객체


```
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;


@Aspect
public class UserAuthAspect {
    private static final Logger logger = LoggerFactory.getLogger(AccountAuthAspect.class);

    @Autowired
    private UserAuthService userAuthService;


    @Pointcut("execution(* com.demo.dashboard.service.DashboardService.getBoard(..))")
    public void dashBoardAccountAuth() {}

    @Pointcut("execution(* com.demo.billing.service.BillingService.*(..))")
    public void billingAccountAuth() {}

    @Before("dashBoardAccountAuth() || billingAccountAuth()")
    public void before(JoinPoint joinPoint) {
        Object[] obj = joinPoint.getArgs();
        CommonReqModel model  = (CommonReqModel) obj[0];
        boolean hasDefaultAuth = userAuthService.getAuthInfo(model);
        model.setHasDefaultAuth(hasDefaultAuth);
    }
}
```

# **Cache**
<h3 data-original-attrs="{&quot;style&quot;:&quot;&quot;}" style="text-align: left;">Cache 추상화 이해하기</h3><p>핵심부분에서 추상화는 Java method에 캐싱을 적용함으로써 캐시에 보관된 정보로 메서드의 실행 횟수를 줄여준다. 즉 대상 메서드가 실행될때마다 추상화가 해당 메서드가 같은 인자로 이미 실행되었는 확인하는 캐싱 동작을 적용한다. 해당 데이터가 존재한다면 메서드를 실행하지 않고 결과를 반환하고 존재하지 않는다면 메서드를 실행하고 그 결과를 캐싱한 뒤에 사용자에게 반환해서 다음번 호출시에 사용 할 수 있게 한다.</p><p>Spring cache는 cache 추상화를 지원하는데 EhCache, Redis, Couchbase 등 캐시 저장소와 빠르게 연동하여 bean으로 설정 할 수 있도록 도와준다.</p>

***

### 캐싱 전략의 종류:
#### 1. 애플리케이션 레벨 캐시:
> @Cacheable 어노테이션을 사용하여 메서드의 결과를 캐시합니다. 이 방식은 반복적인 요청에 대해 동일한 결과를 반환하도록 하여 데이터베이스 쿼리 호출을 줄입니다.

```
@Cacheable(value = "userCache", key = "#userId")
public User getUserById(Long userId) {
    return userRepository.findById(userId);
}

```

#### 2. Redis 캐시:
> Redis는 빠른 읽기 성능을 제공하는 In-memory 데이터 저장소로, 자주 조회되는 데이터를 저장하기에 적합합니다. Spring Boot에서는 Spring Data Redis를 통해 Redis와의 연동이 가능합니다. 
Redis를 사용하면, 자주 조회되는 데이터가 메모리에 저장되어 빠르게 응답을 처리할 수 있습니다. 캐시 만료 기간(1시간)을 설정하여 데이터가 오래된 경우에는 자동으로 갱신될 수 있도록 합니다.

***

<h3 data-original-attrs="{&quot;style&quot;:&quot;&quot;}" style="text-align: left;">선언적인 어노테이션 기반의 캐싱</h3><h4 data-original-attrs="{&quot;style&quot;:&quot;&quot;}" style="text-align: left;">@Cacheable </h4><div>메소드에 지정 가능하고 지정된 메서드의 캐시 설정에 따라 데이터가 한번 생성되면 데이터가 캐싱되며, 다음 호출 시에 캐시에 저장된 데이터가 리턴된다.</div><div>@Cacheable 설정 옵션은 다음과 같다.</div><div><ul data-original-attrs="{&quot;style&quot;:&quot;&quot;}" style="text-align: left;"><li>value</li><ul><li>캐싱 공간의 대표 명칭</li></ul><li>key</li><ul><li>Spring Expression Language(SpEl)으로 key생성을 지정 </li><li>지정하지 않으면 모든 파라미터를 조합한 해시코드 값을 키로 생성</li></ul><li>condition</li><ul><li>조건부 캐싱. SpEL로 지정하고 표현식이 true면 메서드를 캐시</li></ul></ul><div>사용가능한 SpEL evaluation context</div></div><div>

이름 | 위치 | 설명 | 예시
-- | -- | -- | --
methodName | root object | 호출되는 메서드의 이름 | #root.methodName
method | root object | 호출되는 메서드 | #root.method.name
target | root object | 호출되는 대상 객체 | #root.target
targetClass | root object | 호출되는 대상 클래스 | #root.targetClass
args | root object | 대상을 호출하는데 사용한 인자(배열) | #root.args[0]
caches | root object | 현재 실행된 메서드 캐시의 컬렉션 | #root.caches[0].name
argument name | evaluation context | 메서드 인자의 이름. 어떤 이유로든 이름을 사용할 수 없다면(예: 디버깅 정보가 없는 경우) a<#arg>에서 인자 이름을 사용할 수도 있고 #arg은 (0부터 시작하는) 인자의 인덱스를 의미한다. | iban나 a0 (p0를 사용하거나 별칭으로 p<#arg> 형식을 사용할 수 있다)

<p><br></p><p>유의해야 할 점</p></div><font data-keep-original-tag="false"><hr class="more">@Cacheable은 Spring AOP를 이용하기 때문에 동일한 클래스 내 @Cacheable이 설정된 메서드를 호출할 경우 캐싱된 결과를 가져오지 못하고 메서드를 재실행 한다. 이를 해결하기 위한 방법은 internal call이 아닌 Proxy Bean를 참조하여 캐싱된 데이터를 받아 오는 것이다.</font><div><br></div>


***

## 캐시 무효화 전략:
> @CacheEvict 어노테이션을 사용하여 캐시된 데이터를 삭제하거나 갱신할 수 있습니다. 예를 들어, 데이터를 수정하거나 삭제하는 API에서 해당 데이터의 캐시를 무효화하여 최신 데이터를 반영하도록 합니다.
## 캐시 갱신 전략:
> @CachePut 어노테이션을 사용하여 메서드를 실행하고 캐시를 갱신할 수 있습니다. 예를 들어, 데이터가 변경될 때 캐시도 함께 업데이트하는 방식입니다.

## 캐싱 전략 적용 시 고려사항:
* 캐시 만료 시간: 데이터를 언제 캐시에서 제거할지, 즉 캐시 만료 시간을 어떻게 설정할지 결정해야 합니다. 데이터 변경 주기나 중요도에 따라 설정을 다르게 해야 합니다.
* 캐시 일관성: 데이터 변경 시 캐시가 일관성 있게 갱신되는지 확인해야 합니다. 이를 위해 @CacheEvict와 @CachePut을 적절히 사용하여 캐시를 무효화하고 갱신할 수 있습니다.



<div>[참고]   https://ifuwanna.tistory.com/202<br><p></p><br><div><br><br></div><div><br></div><div><br></div><div><br></div><div><br></div><br><div><br></div><div><br></div><div><br></div><div><br></div><div><br></div><div><br></div><div><br style="color: rgb(0, 0, 0); font-family: Times; font-size: medium; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: left; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial;">