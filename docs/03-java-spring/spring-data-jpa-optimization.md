---
sidebar_label: "1. 적절한 인덱스 사용"
layout: default
---
JPA 성능 최적화에는 데이터베이스 상호 작용 향상, 불필요한 쿼리 감소, 데이터 조회 및 조작 최적화를 목표로 하는 전략이 포함 된다. 다음은 Spring Data JPA를 사용할 때 성능을 최적화하는 데 도움이 되는 몇 가지 팁이다.
## 1. 적절한 인덱스 사용
* 쿼리 실행 계획을 분석하고 WHERE, JOIN, ORDER BY 절에서 자주 사용되는 column을 식별하여, 해당 column들에 인덱스를 생성하여 데이터 검색 속도를 향상한다. JOIN이나 WHERE 또는 ORDER BY에 자주 사용되는 컬럼 수정이 빈번하지 않으며 데이터 중복이 적은 컬럼을 선택하는 것이 좋다.
* 과도한 인덱스 생성은 성능을 저하시킬 수 있다. insert, update, delete 등의 변동 사항 발생 시 인덱스도 수정되어 추가 비용이 발생하기 떄문에 성능이 저하된다.
  * INSERT: 새로운 데이터에 대한 인덱스를 추가
  * DELETE: 삭제하는 데이터의 인덱스를 사용하지 않는다는 작업을 진행
  * UPDATE: 기존의 인덱스를 사용하지 않음 처리하고, 갱신된 데이터에 대해 인덱스를 추가

적절한 인덱스로 성능 향상 시키는 예는 다음과 같을 수 있다.
데이터베이스에 책과 저자에 대한 테이블이 있고 특정 저자의 모든 책을 검색하는 쿼리를 자주 실행 한다고 가정하면 book 테이블의 author_id 인덱스를 추가해야 한다.

```
@Entity
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String isbn;
    
    @ManyToOne
    @JoinColumn(name = "author_id")
    @org.hibernate.annotations.Index(name = "author_id_index") // Adding an index
    private Author author;

    // Constructors, getters, setters
}


@Entity
public class Author {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;

    // Constructors, getters, setters
}
```


## 2. Fetch 전략과 N+1 문제

JPA에서 연관 엔티티를 조회할 때 중요한 성능 문제 중 하나가 N+1 문제입니다.
N+1 문제는 부모 엔티티를 조회하는 쿼리 1번 + 각 부모 엔티티마다 자식 엔티티를 조회하는 쿼리 N번이 실행되어 총 N+1번 쿼리가 발생하는 현상입니다.

## N+1 문제 해결 방법
Fetch 전략을 통한 최적화 시 아래와 같은 상황을 고려할 수 있다.
* 연관관계에 매핑되어 있는 엔티티의 불필요한 로드를 방지하려면 적절한 Fetch 전략을 선택해야 한다.
* 성능 최적화를 위해 연관된 엔티티를 한 번의 쿼리로 효율적으로 로드 할 수 있다.

JPA/Hibernate에서는 N+1 문제를 해결하거나 완화하기 위해 여러 Fetch 전략을 제공합니다.

### Fetch Join (JPQL/HQL)
Fetch Join은 동적 쿼리에서 JOIN FETCH를 사용해 관련 데이터를 메인 쿼리에서 함께 조회하는 방법이다.
* 조회 시점에 JOIN FETCH를 사용해 연관 엔티티를 한 번에 가져옴
* to-one 연관 관계는 안전하게 동시에 fetch join 가능
```
List<Author> authors = em.createQuery(
    "select a from Author a join fetch a.books", Author.class)
    .getResultList();
```
> [!IMPORTANT] 
> Fetch Join 사용 시 주의 사항
* 컬렉션(to-many) 관계를 동시에 fetch join하면
→ 데이터베이스에서 카테시안 곱이 발생하여 성능이 크게 저하될 수 있음
* fetch join 대상에 WHERE 절 제한을 적용하면 컬렉션이 불완전하게 조회될 수 있음
* 페이지네이션/제한 쿼리(setFirstResult / setMaxResults, LIMIT / OFFSET)에서는 fetch join 사용 금지

### EntityGraph
EntityGraph를 사용하면 JPQL을 수정하지 않고도 조회 시점에 필요한 연관 데이터를 함께 로딩하도록 지정할 수 있다.

```
@EntityGraph(attributePaths = {"books", "author"})
List<Author> findAllWithBooks();
```


### Batch fetching

Batch fetching은 ToMany 관계의 조인에서는 오직 필요한 정보만 조회되도록 쿼리를 최적화하는 데 사용되는 기술로, 연관관계에 매핑되어 있는 엔티티를 로드할 때 수행되는 개별 데이터베이스 쿼리 수를 줄여 성능을 향상시키고 N+1 쿼리 문제를 최소화한다.

* Batch fetching로 단일 쿼리로 여러 엔티티를 조회하여 N+1 쿼리 문제를 해결
* @BatchSize 혹은 configuration properties으로 batch size를 설정
  * @BatchSize( size = n ) - SQL IN절에서 n개만큼 조회

Order와 OrderItem이라는 두 개의 엔티티를 Batch fetching으로 주문 항목 정보를 조회하는 예를 살펴본다.

```
@Entity
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Other order attributes, getters, setters
}

@Entity
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) // Use LAZY to avoid loading items eagerly
    @JoinColumn(name = "order_id")
    private Order order;

    // Other order item attributes, getters, setters
}
```

* Batch fetching으로 order item 조회하기

@BatchSize으로 연관관계에 매핑되어 있는 엔티티 조회를 위한 배치 사이즈를 지정하여 단일 쿼리로 설정 한 사이즈의 엔티티를 가져올 수 있다. 아래와 같이 size를 10으로 설정하면 order와 그에 해당되는 order item을 10개씩 가져온다.
```
@Entity
@BatchSize(size = 10) // Set the batch size for batch fetching
public class Order {
    // ...
}
```

## 3. Caching

캐싱은 데이터베이스 접근 횟수를 줄여 애플리케이션 성능을 크게 개선할 수 있다.

* Spring Cache나 Ehcache 또는 Caffeine과 같은 third-party 솔루션을 사용하여 데이터베이스 접근 횟수를 줄인다.
* 2차 캐시를 적절히 활용하여 데이터베이스 접근 횟수를 줄인다. 
  * 2차 캐시는 애플리케이션 범위의 캐시로, 애플리케이션을 종료할 때까지 캐시가 유지된다

아래 예는 @Cacheable를 함수에 적용하여 캐시 생성, @CacheEvict로 캐시 제거, @CachePut 캐시 수정하는 코드이다.

```
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;

@Service
public class ProductService {

    @Cacheable("products")
    public Product getProductById(Long productId) {
        // Simulate fetching data from the database
        return databaseService.fetchProductById(productId);
    }

    @CacheEvict(value = "products", key = "#productId")
    public void updateProduct(Long productId, Product updatedProduct) {
        // Simulate updating data in the database
        databaseService.updateProduct(productId, updatedProduct);
    }

    @CachePut(value = "products", key = "#productId")
    public Product updateProduct(Long productId, Product updatedProduct) {
        // Simulate updating data in the database
        databaseService.updateProduct(productId, updatedProduct);

        return updatedProduct;
    }
}
```
 
## 4.쿼리 최적화

쿼리 최적화로 데이터베이스 부하를 최소화하고 응답 시간이 더 빨라지도록 한다.

* JPQL 또는 Criteria API 쿼리를 효율적으로 작성하여 필요한 데이터만 가져오도록 한다. SELECT * 사용을 지양한다.
* projection 필요한 필드만 가져온다.(예: SELECT NEW 또는 DTO Projection)

아래는 쿼리 메소드를 사용하여 데이터를 조회하는 코드이다.
* findBy[FieldName][Between]

```
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByPriceBetween(double minPrice, double maxPrice);
}
```

## 5. Pagination과 정렬

페이징 및 정렬을 사용하면 대량의 데이터를 처리할 때 애플리케이션의 성능이 향상될 수 있다. 데이터베이스 전체를 조회하는 대신 조회 결과 수를 제한하고 특정 기준에 따라 정렬하면 데이터베이스에서 처리하고 반환해야 하는 데이터의 양을 줄여 응답 시간을 단축하고 성능을 향상시킬 수 있다.

Spring Data JPA 내에서 Pageable 인터페이스로 페이징을 구현한다. 이 인터페이스를 사용하면 단일 페이지 갯수, 정렬 및 페이지 번호를 정의할 수 있습니다.

```
Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
```
위 코드에서 pageNumber는 현재 페이지 번호이고, pageSize는 페이지당 반환할 결과 수이며, sortBy는 내림차순으로 정렬할 필드이다.

Once you have a Pageable object, you can use it to query the database and get a page of results. Here's an example of using paging and sorting to get a page of results from a Product repository:


아래는 Pageable 오브젝트 생성 후 페이징 및 정렬된 결과를 조회하는 코드이다.
```
public Page<Product> findProducts(String keyword, Pageable pageable) {
    return productRepository.findByName(keyword, pageable);
}
```

## 6. @Transactional(readOnly = true)

@Transactional(readOnly = true)를 사용하면 불필요한 데이터 변경(등록, 수정, 삭제)을 예방할 수 있고 성능을 최적화 할 수 있다.
  * 영속성 컨텍스트가 변경 감지를 위한 Snapshot을 따로 저장하지 않아 메모리 절약 및 성능 향상
  * JPA 세션 flush 모드가 MANUAL로 설정되어 트랜젝션 커밋시 영속성 컨텍스트가 자동으로 flush되지 않으므로 Entity 예상치 못한 수정을 방지
  * 직관적으로 메서드가 조회용 메서드임을 알 수 있어 가독성 향상

```
@Service
@Transactional(readOnly = true)
public class OrderService {
    @Autowired
    private OrderRepository orderRepository;

    public List<Order> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findOrdersByStatus(status);
    }
}
```

## 7. Batch 처리

Use batch processing for bulk inserts, updates, and deletes. Spring Data JPA supports batch operations through the saveAll() and deleteAllInBatch() methods.

Spring Data JPA에서 saveAll() 및 deleteAllInBatch() 메서드를 통해 Batch Insert/Delete를 구현합니다.

```
@Service
public class OrderService {
    @Autowired
    private OrderRepository orderRepository;

    public List<Order> saveOrders(List<Order> orders) {
        return orderRepository.saveAll(orders);
    }
}
```

Reference
* https://medium.com/@avi.singh.iit01/optimizing-performance-with-spring-data-jpa-85583362cf3a
* https://medium.com/@harrymarkjava/this-one-java-optimization-cut-our-api-response-time-by-90-2eaefadf663e
