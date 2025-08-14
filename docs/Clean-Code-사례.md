---
layout: default
---
## Constant를 사용하여 숫자를 표현

하드 코딩된 숫자를 사용하면 코드 가독성이 떨어지고 유지보수가 어려워진다. 매직 넘버 사용으로 인해 값의 목적을 이해하기 어려워지고 값을 변경하거나 재사용이 필요한 경우 잠재적인 버그를 유발할 수 있다. Constant로 의미 있는 이름을 제공하고 코드 가독성을 향상시킵니다.

하위처럼 코드에서 직접적으로 숫자를 사용하는 대신 Constant를 사용함으로 코드 가독성을 개선 한다.
```
// Bad example: Magic number used directly in the code
if (score >= 70) {
    System.out.println("Pass");
}
```

```
// Good example: Constants used for better readability
final int PASS_THRESHOLD = 70;
if (score >= PASS_THRESHOLD) {
    System.out.println("Pass");
}
```

## 깊은 중첩을 피하고 초기 반환을 사용

깊게 중첩된 코드는 가독성을 떨어뜨리고 로직을 이해하기 어렵게 만든다. 깊은 중첩은 논리를 추론하고 모든 경우가 올바르게 처리되었는지 확인하기가 더 어려워져 버그를 유발할 수 있다.  또한 깊은 중첩은 코드 리뷰가 어렵고 향후 코드 변경을 오류 발생 가능성이 높은 상태로 만들 수 있다.
초기 반환은 코드의 가독성을 개선하고 유지 보수가 쉬워진다.

if의 깊은 중첩문 대신 초기 반환을 사용하는 예제 코드이다.

```
// Bad example: Deeply nested if-else blocks
public void processOrder(Order order) {
    if (order != null) {
        if (order.isComplete()) {
            if (order.isPaid()) {
                // Process the order
            } else {
                // Handle payment processing
            }
        } else {
            // Handle incomplete order
        }
    }
}
```

```
// Good example: Use early returns to flatten the code
public void processOrder(Order order) {
    if (order == null) {
        return;
    }

    if (!order.isComplete()) {
        // Handle incomplete order
        return;
    }

    if (!order.isPaid()) {
        // Handle payment processing
        return;
    }

    // Process the order
}
```

## 다수의 상수 및 옵션은 Enum을 사용

Enum은 고정된 옵션 또는 상수 집합에 대해 Type-Safety를 보장합니다. 정수나 문자열을 사용하는 것에 비해 더 나은 컴파일타임 검사와 향상된 가독성을 제공합니다.

Enum을 사용하지 않고 옵션에 대해 임의의 정수나 문자열 값을 사용할 경우, 이러한 값을 잘못 해석하거나 오용하여 일관성 없거나 오류가 발생할 가능성이 있습니다.

```
// Bad example: Using integers for representing days of the week
int monday = 1;
int tuesday = 2;
int wednesday = 3;
// ...

// Good example: Using enums for days of the week
public enum DayOfWeek {
    MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY;
}
```

## 예외 처리
적절한 예외 처리는 코드가 예외 상황에서 정상적으로 처리될 수 있도록 보장하고 디버깅 및 로깅 목적으로 의미 있는 오류 메시지를 표시할 수 있다.

예외를 적절하게 처리하지 않으면 예상치 못한 프로그램 crash, 데이터 손상 또는 보안 취약점이 발생할 수 있다. 처리되지 않은 예외는 프로덕션 환경에서 발생하는 문제의 원인을 파악하기 어렵다.

generic exception 대신에 각각의 exception에 대한 예외를 처리해야 한다.

```
// Bad example: Catching and swallowing exceptions
try {
    // Code that may throw an exception
} catch (Exception e) {
    // Ignoring the exception
}
```

```
// Good example: Handle exceptions appropriately
try {
    // Code that may throw an exception
} catch (SpecificException ex) {
    // Handle specific exception
} catch (AnotherException ex) {
    // Handle another specific exception
} catch (Exception e) {
    // Handle any other unexpected exception
    // Optionally log the error
}
```

## 객체지향 설계의 기본원칙

객체지향 설계는 캡슐화, 모듈화 및 관심사의 분리 등 원칙으로 유지 보수 가능하고 확장 가능한 코드를 만들어낸다.

그렇지 않으면 코드가 수정 또는 확장하기 어려운 거대하고 강하게 결합된 코드로 이어질 수 있습니다. 또한 코드를 테스트하거나 재사용하기 어렵다."

* None-OOP 코드
```
// Bad example: A monolithic class without proper abstraction
public class Car {
    // A lot of unrelated methods and fields
    // ...

    public void startEngine() {
        // Code to start the engine
    }

    public void playRadio() {
        // Code to play the radio
    }

    // ...
}
```

* OOP 코드
```
// Good example: Properly designed classes with single responsibility
public class Car {
    private Engine engine;
    private Radio radio;

    public void startEngine() {
        engine.start();
    }

    public void playRadio() {
        radio. Play();
    }
}
```

## Interface와 Abstraction

인터페이스와 추상화는 느슨한 결합을 촉진하여 코드가 구체적인 구현이 아닌 추상화에 의존한다. 이를 통해 유연성이 확보되며 유지보수와 테스트가 더 쉬워진다.

```
// Bad example: Concrete implementation without interfaces
public class Square {
    public void draw() {
        // Code to draw a square
    }
}

// Good example: Use interfaces and abstraction
public interface Shape {
    void draw();
}

public class Square implements Shape {
    @Override
    public void draw() {
        // Code to draw a square
    }
}
```

## Loop
컬렉션, 배열 및 객체를 순회할 때 더 깔끔하고 간결한 구문을 제공합니다.

```
// Bad example: Using traditional for loop for iteration
List<String> fruits = Arrays.asList("Apple", "Banana", "Orange");
for (int i = 0; i < fruits.size(); i++) {
    System.out.println(fruits.get(i));
}

// Good example: Use enhanced for loop for readability
for (String fruit : fruits) {
    System.out.println(fruit);
}
```

## Collection과 Classes에 Generic 사용

Generic을 사용하면 Type-Safety를 보장되고, 컴파일타임에 검사로 명시적인 형 변환 필요성을 줄입니다.

```
// Bad example: Non-generic collection without type safety
List names = new ArrayList();
names.add("Alice");
names.add(42); // Could add any type of object

// Good example: Use generics for type safety
List<String> names = new ArrayList<>();
names.add("Alice");
// names.add(42); // Compiler error, can only add strings
```

Reference

[Java: Best Practices for Writing Clean and Professional Code](https://medium.com/javarevisited/java-best-practices-for-writing-clean-and-professional-code-6b575ce224f)