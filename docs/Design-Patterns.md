# Singleton Pattern
싱글톤 디자인 패턴는 클래스가 하나의 인스턴스만 가지도록 하고 여러 번 호출이 되더라도 인스턴스를 새로 생성하지 않고 최초 호출 시에 만들어두었던 인스턴스를 재활용하는 패턴이다.
싱글톤 디자인 패턴는 어플리케이션에서 프로그램 전체에서 사용되는 구성 설정, 데이터베이스 커넥션 풀 또는 로거 관리와 같이 클래스의 인스턴스 수를 하나로 제한하려는 경우에 자주 사용된다.    

* 싱글톤 패턴을 사용하면 리소스를 효율적으로 관리할 수 있다. 
  * 예를 들어 데이터베이스 커넥션 풀을 하나의 인스턴스로 제한하여 많은 수의 데이터베이스 연결을 생성을 방지

* 싱글톤 패턴을 올바르게 구현하면 하나의 인스턴스만 생성되도록 함으로써 스레드 안전성을 제공할 수 있다.
  * 이는 멀티스레드 환경에서 경쟁을 방지하고 적절한 동기화를 보장하기 위해 매우 중요
```
public class ConfigurationManager {
    
    private static ConfigurationManager instance;

    private String databaseUrl;
    private int maxConnections;

    // Private constructor to prevent creating multiple instances
    private ConfigurationManager() {
        this.databaseUrl = "jdbc:mysql://localhost:3306/mydatabase";
        this.maxConnections = 10;
    }

    // Method to get the one and only instance of ConfigurationManager
    public static ConfigurationManager getInstance() {
        if (instance == null) {
            instance = new ConfigurationManager(); // Create the instance if it doesn't exist yet
        }
        return instance;
    }

    // Getter methods for configuration settings
    public String getDatabaseUrl() {
        return databaseUrl;
    }

    public int getMaxConnections() {
        return maxConnections;
    }

    public void setMaxConnections(int maxConnections) {
        this.maxConnections = maxConnections;
    }
}
```

***
# Factory Design Pattern
팩토리 패턴은 객체 생성의 과정을 추상화하는 *생성형 디자인 패턴*입니다. 이 패턴은 객체를 생성할 때, 객체의 구체적인 타입을 명시하지 않고, 서브클래스나 전문화된 팩토리 클래스에 객체 생성 책임을 위임합니다. 이러한 추상화는 코드의 유연성과 유지보수성을 높여줍니다. 

## 팩토리 디자인 패턴의 구성 요소

팩토리 디자인 패턴을 구현하기 전에 패턴을 구성하는 주요 요소들에 대해 이해합니다. 각 구성 요소는 객체 생성 과정을 분리하여 유연성과 확장성을 제공하는데 중요한 역할을 합니다. 아래는 팩토리 패턴의 핵심 구성 요소들입니다:

1. **Product (제품)**  
   Product는 생성할 객체의 타입을 정의하는 인터페이스 또는 추상 클래스입니다. 이 요소는 팩토리가 생성해야 할 객체들이 가져야 할 공통적인 속성이나 메서드를 선언합니다. 실제 객체들이 이 인터페이스를 구현하거나, 추상 클래스를 확장하여 구체화됩니다.

2. **Concrete Product (구체적인 제품)**  
   Concrete Product는 Product 인터페이스를 구현하거나 Product 추상 클래스를 상속받는 실제 클래스들입니다. 이들은 팩토리가 생성하는 실제 객체들로, 특정한 기능을 수행하는 인스턴스를 제공합니다. 즉, 팩토리 패턴에서 정의된 '제품'이 구체적인 형태로 나타나는 클래스들입니다.

3. **Factory (팩토리)**  
   Factory는 객체를 생성하는 팩토리 메서드를 선언하는 인터페이스 또는 추상 클래스입니다. 팩토리의 주요 역할은 객체 생성을 추상화하여, 실제 객체 생성 방법에 대한 세부 구현을 외부에서 숨기고, 객체를 효율적으로 생성할 수 있는 메서드를 제공하는 것입니다.

4. **Concrete Factory (구체적인 팩토리)**  
   Concrete Factory는 Factory 인터페이스를 구현하거나 Factory 추상 클래스를 상속받는 구체적인 클래스입니다. 이 클래스는 팩토리 메서드를 구현하여, 특정한 종류의 Product 객체를 생성하는 역할을 합니다. 각 Concrete Factory는 특정 Product 유형을 생성하는 방법을 정의하며, 이로써 다양한 종류의 객체들을 유연하게 생성할 수 있도록 합니다.


## 팩토리 디자인 패턴의 장단점 분석
### 주요 장점:              
팩토리 패턴은 객체 생성 로직을 중앙화하여 코드의 유지보수성을 높이고, 새로운 객체를 추가할 때 기존 코드를 변경하지 않아도 되는 장점이 있습니다. 그러나 패턴의 사용이 불필요하게 복잡성을 초래할 수 있으며, 클라이언트가 팩토리에 의존하게 되는 단점도 존재합니다. 따라서 객체 생성이 복잡하거나 다양한 형태를 가질 때 유용하게 사용할 수 있으며, 적절한 상황에서만 적용하는 것이 중요합니다. 
1. **객체 생성의 결합도 감소:** 클라이언트는 필요한 객체의 구체적인 클래스에 대해 알 필요가 없습니다. 클라이언트는 팩토리 메서드를 통해 객체를 요청하고, 팩토리는 적절한 객체를 생성하여 반환합니다.
   
2. **유지보수성 향상:** 객체 생성 로직이 팩토리에 집중되어 있기 때문에 객체 생성 방식에 변경이 필요할 경우, 해당 팩토리 내에서만 수정하면 됩니다. 이로 인해 클라이언트 코드나 다른 시스템 부분에 영향을 주지 않게 됩니다.

3. **변경에 대한 유연성 증가:** 팩토리 패턴은 새로운 객체 타입을 추가할 때 유리합니다. 새로운 객체 유형(구체적인 제품)을 추가할 때 기존 코드를 변경하지 않고 새로운 팩토리를 추가하는 방식으로 해결할 수 있습니다. 이는 코드의 확장성을 높이고, 새로운 요구사항에 유연하게 대응할 수 있게 합니다.

4. **일관된 객체 생성 보장**  
   팩토리 패턴은 공통된 인터페이스(Product)를 통해 객체 생성 규칙을 강제합니다. 이 일관성은 코드 유지보수를 쉽게 하고, 오류를 최소화하는 데 기여합니다.


### 단점
1. **전체 코드베이스 복잡도 증가**  
   팩토리 패턴을 구현하면 코드베이스에 새로운 추상화 계층이 추가됩니다. 이는 개발자에게는 추가적인 학습 부담을 줄 수 있고, 패턴을 잘 이해하지 못한 개발자에게는 혼란을 야기할 수 있습니다.

2. **팩토리 로직에 대한 의존성**  
   클라이언트 코드가 구체적인 제품(Concrete Products)에서 분리되기는 하지만, 여전히 구체적인 팩토리(Concrete Factories)에 강하게 의존합니다. 따라서 팩토리 로직에 큰 변화가 있을 경우 여러 부분에서 영향을 받을 수 있습니다.

3. **복잡한 객체 생성이 아닐 경우 오버엔지니어링**  
   객체 생성이 복잡하지 않거나 변동성이 적은 경우, 팩토리 패턴을 적용하면 오히려 불필요한 복잡성을 초래할 수 있습니다. 이 패턴은 객체 생성 과정에 변수가 많거나 복잡할 때 가장 효과적입니다.


***
# Strategy Pattern
전략 패턴은 특정한 계열의 알고리즘(공통 인터페이스 또는 추상 클래스를 구현하는 구체적인 클래스)을 정의하고 각 알고리즘을 캡슐화하고 상호 교환 가능하게 만드는 행위 소프트웨어 디자인 패턴이다. 알고리즘을 사용하는 컨텍스트(context)​를 변경하지 않고도 알고리즘의 행위를 변경할 수 있다. 이 패턴은 컨텍스트와 전략 객체 간의 느슨한 결합을 촉진하여 코드를 확장 가능하고 유지보수에 용이하도록 한다.     
## 전략 패턴에서 컨텍스트와 전략 객체는 핵심 구성 요소
* 컨텍스트(Context)
  * 전략을 사용하는 클라이언트 객체입니다. 이 객체는 전략을 설정하고 실행하는 역할을 합니다.
* Strategy
  * 알고리즘(행위)을 정의하는 인터페이스입니다. 여러 가지 알고리즘이 이 인터페이스를 구현하여 제공됩니다.
* ConcreteStrategy
  * Strategy 인터페이스를 구현한 구체적인 알고리즘(행위)을 제공합니다.     

## 전략 패턴 장점
* 알고리즘 교체
  * 전략 패턴을 사용하면 클라이언트가 알고리즘을 실행할 때마다, 필요에 따라 다양한 알고리즘을 쉽게 바꿀 수 있습니다.
* 클라이언트 코드와 알고리즘의 분리
  * 알고리즘을 Strategy 인터페이스를 통해 캡슐화함으로써 클라이언트 코드에서 알고리즘에 대한 세부 구현을 알 필요가 없어집니다.
* 개방-폐쇄 원칙
  * 새로운 알고리즘이 추가되어도 기존 코드를 수정할 필요 없이 새로운 ConcreteStrategy를 추가하기만 하면 됩니다.

### 예제로 알아보는 전략 패턴
다음과 같이 결제 어플리케이션에 전략 디자인 패턴을 사용하여 가독성 및 유연성을 향상시키는 예를 살펴본다.     
![image](https://github.com/low-hill/Knowledge/assets/6086626/552ff471-db57-4583-8540-38146ee63152)
* 전략(추상화된 알고리즘/행위) 정의
```
interface PaymentMethod {
    double calculateProcessingFee(double amount);
}
```
* 다양한 행위/알고리즘을 정의하는 구체적인 클래스를 정의
```
@Component
class CreditCardPayment implements PaymentMethod {
    @Override
    public double calculateProcessingFee(double amount) {
        return amount * 0.01;
    }
}

@Component
class DebitCardPayment implements PaymentMethod {
    @Override
    public double calculateProcessingFee(double amount) {
        return amount * 0.02;
    }
}

@Component
class NetBankingPayment implements PaymentMethod {
    @Override
    public double calculateProcessingFee(double amount) {
        return amount * 0.005;
    }
}
```
* 컨텍스트(전략 실행)
```
@Service
@Slf4j
public class PaymentService {
    private final PaymentMethod creditCardPayment;
    private final PaymentMethod debitCardPayment;
    private final PaymentMethod netBankingPayment;
    private Map<String, PaymentMethod> paymentMethodsMap;

    PaymentService(PaymentMethod creditCardPayment, 
            PaymentMethod debitCardPayment, PaymentMethod netBankingPayment) {
        this.creditCardPayment = creditCardPayment;
        this.debitCardPayment = debitCardPayment;
        this.netBankingPayment = netBankingPayment;
    }

    @PostConstruct
    void init() {
        paymentMethodsMap = new HashMap<>();
        paymentMethodsMap.put("CreditCard", creditCardPayment);
        paymentMethodsMap.put("DebitCard", debitCardPayment);
        paymentMethodsMap.put("NetBanking", netBankingPayment);
    }

    public void processPayment(double amount, String paymentMethod) {
        log.info("Processed amount: {}", 
          paymentMethodsMap.get(paymentMethod)
                           .calculateProcessingFee(amount));
    }
}
```
* 클라이언트(전략 교체/전략 실행 결과 얻음)
```
@Component
class PaymentServiceClientRunner {

    private final PaymentService paymentService;

    public PaymentServiceClientRunner(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    public void executePayment() {
        // Process payment with amount 100.0 and payment method as "CreditCard"
        paymentService.processPayment(100.0, "CreditCard");
    }
}
```


Reference
* [Strategy Design Pattern — All You Need To Know](https://medium.com/@basecs101/strategy-design-pattern-all-you-need-to-know-updated-2024-e8a8303bd49e)
* [Strategy Pattern](https://inpa.tistory.com/entry/GOF-%F0%9F%92%A0-%EC%A0%84%EB%9E%B5Strategy-%ED%8C%A8%ED%84%B4-%EC%A0%9C%EB%8C%80%EB%A1%9C-%EB%B0%B0%EC%9B%8C%EB%B3%B4%EC%9E%90)
* https://medium.com/@thecodebean/factory-design-pattern-implementation-in-java-bd16ebb012e2
* https://blog.devgenius.io/design-pattern-factory-method-d218d77a015b
* https://levelup.gitconnected.com/creational-design-pattern-factory-method-2bf56676111b
* https://medium.com/nerd-for-tech/understanding-factory-method-design-pattern-4d7ba8f0dfc4