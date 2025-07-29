### 1. Filtering Collections
  
  Stream API와 Lambda 표현식을 사용하면 읽기 쉬운 간결한 코드로 컬렉션 순회 및 필터링이 가능하다.

```
List<String> letters= Arrays.asList("a", "b", "c");
for (String letter : letters) {
    if (letter.endsWith("c")) {
        System.out.println(letter);
    }
}
```

* Lambda 적용
```
List<String> letters= Arrays.asList("a", "b", "c");
letters.stream()
       .filter(letter -> letter.endsWith("c"))
       .forEach(System.out::println);
```

### 2. 정렬

Lambda 표현식으로 보다 간결한 형식으로 정렬 메서드를 사용하여 코드가 더욱 간결해진다.

```
List<String> names = Arrays.asList("Aaron", "Bobby", "Charlotte");

Collections.sort(names, new Comparator<String>() {
    public int compare(String name1, String name2) {
        return name1.compareTo(name2);
    }
});
```

* Lambda 적용
```
List<String> names = Arrays.asList("Aaron", "Bobby", "Charlotte");
names.sort((name1, name2) -> name1.compareTo(name2));
```

### 3. 집계

Stream API와 Lambda로 컬렉션에 대한 집계를(sum, average) 보다 우아하게 구현할 수 있습니다.

```
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
int sum = 0;
for (Integer num : numbers) { 
    sum += num; 
}

```

* Lambda 적용
```
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
int sum = numbers.stream()
                 .reduce(0, Integer::sum);
```

### 4. 특정 조건 필터링 및 기본값 설정

Optional 클래스를 사용하여 특정 조건 필터링 및 기본값 설정를 처리한다.

```
String name = "world";
if (name != null && name.length() > 0) {
    System.out.println("Hello, " + name);
} else {
    System.out.println("Hello, Stranger");
}
```

* Lambda 적용
```
String name = "world";
name = Optional.ofNullable(name)
               .filter(n -> n.length() > 0)
               .orElse("Stranger");
System.out.println("Hello, " + name);
```

### 5. 내부 클래스

간결한 코드로 가독성을 향상시킨다.

```
new Thread(new Runnable() {
    public void run() {
        System.out.println("Thread is running.");
    }
}).start();
```

* Lambda 적용
```
new Thread(() -> {
    // do something
}).start();

new Thread(() -> System.out.println("Thread is running.")).start();
```

### 6. Collection 원소 변환

Lambda의 map()을 사용하여 원소를 변환하여 가독성을 향상 시킨다.

```
List<String> names = Arrays.asList("Aaron", "Bobby", "Charlotte");
List<String> uppercaseNames = new ArrayList<>();
for (String name : names) {
    uppercaseNames.add(name.toUpperCase());
}
```

* Lambda 적용
```
List<String> names = Arrays.asList("Aaron", "Bobby", "Charlotte");
List<String> uppercaseNames = names.stream()
                                   .map(String::toUpperCase)
                                   .collect(Collectors.toList());
```

### 7. Collection 그룹화와 카운트

내부 클래스의 선언 및 구현 없이 간결하게 구현한다. ex) groupingBy、counting、summingInt

#### Grouping

```
List<String> names = Arrays.asList("Aaron", "Bobby", "Charlotte");
Map<Integer, List<String>> namesGroupByLength = new HashMap<>();
for (String name : names) {
    int length = name.length();
    if (!namesGroupByLength.containsKey(length)) {
        namesGroupByLength.put(length, new ArrayList<>());
    }
    namesByLength.get(length).add(name);
}
System.out.println("Names grouped by length: " + namesGroupByLength);
```

* Lambda 적용
```
List<String> names = Arrays.asList("Aaron", "Bobby", "Charlotte");

Map<Integer, List<String>> namesGroupByLength = names.stream()
        .collect(Collectors.groupingBy(String::length));

System.out.println("Names grouped by length: " + namesGroupByLength);
```

#### Couting

```
List<String> names = Arrays.asList("Aaron", "Bobby", "Charlotte");
int namesStartWithA = 0;
for (String name : names) {
    if (name.contains("A")) {
        namesStartWithA++;
    }
}
System.out.println("Number of names containing 'A': " + namesStartWithA);
```

* Lambda 적용
```
List<String> names = Arrays.asList("Aaron", "Bobby", "Charlotte");
long namesStartWithA = names.stream()
        .filter(name -> name.contains("A"))
        .count();
System.out.println("Number of names containing 'A': " + namesStartWithA);
```

### 8. Collection 병렬 처리

컬렉션 데이터 양이 많은 경우 Stream API와 Lambda를 사용하여 병렬처리가 쉬워진다. parallelStream()로 백만 개의 정수의 평균을 병렬처리 한다.

```
List<Integer> numbers = new ArrayList<>();
for (int i = 0; i < 1000000; i++) {
    numbers.add(ThreadLocalRandom.current().nextInt(100));
}

//
long startTimeSeq = System.currentTimeMillis();
double averageSequential = numbers.stream()
                                 .mapToInt(Integer::intValue)
                                 .average()
                                 .getAsDouble();
long endTimeSeq = System.currentTimeMillis();
System.out.println("Sequential Average: " + averageSequential);
System.out.println("Time taken (Sequential): " + (endTimeSeq - startTimeSeq) + "ms");


//Parallel
long startTimePar = System.currentTimeMillis();
double averageParallel = numbers.parallelStream()
                               .mapToInt(Integer::intValue)
                               .average()
                               .getAsDouble();
long endTimePar = System.currentTimeMillis();
System.out.println("Parallel Average: " + averageParallel);
System.out.println("Time taken (Parallel): " + (endTimePar - startTimePar) + "ms");
```

Reference
  * [8 Scenarios worth Using Java Lambda For](https://medium.com/@malvin.lok/8-scenarios-worth-using-java-lambda-for-3277bcacf28a)