---
layout: default
---
# 1. 개요

Querydsl은 Hibernate와 같은 ORM 프레임워크의 타입 안전성 문제를 해결하는 훌륭한 대안입니다. 메타모델 클래스를 활용하여 타입 안전한 방식으로 쿼리를 작성하면서도, **읽기 쉽고 유지보수가 용이한** 코드를 생성할 수 있게 도와줍니다. Querydsl를 사용하면 개발자는 더 안전하고 효율적인 쿼리 작성이 가능해지며, 복잡한 데이터베이스 작업을 더 직관적으로 처리할 수 있습니다.

# 2. Querydsl의 목적

객체 관계 매핑(Object-Relational Mapping, ORM) 프레임워크는 엔터프라이즈 자바의 핵심입니다. ORM은 객체 지향 접근 방식과 관계형 데이터베이스 모델 간의 불일치를 해결하며, 개발자가 더 깔끔하고 간결한 영속성 코드 및 도메인 로직을 작성할 수 있게 돕습니다.

하지만 ORM 프레임워크에서 가장 중요한 설계 요소 중 하나는 **올바르고 타입 안전한 쿼리를 작성할 수 있는 API**입니다. 

가장 널리 사용되는 자바 ORM 프레임워크인 **Hibernate** (그리고 밀접하게 연관된 JPA 표준)는 SQL과 매우 유사한 **문자열 기반의 쿼리 언어인 HQL**(또는 JPQL)을 제공합니다. 이 접근 방식의 명백한 단점은 **타입 안전성 부족**과 **정적 쿼리 검증의 부재**입니다. 또한, 더 복잡한 쿼리에서는 (예를 들어, 실행 시점에 조건에 따라 쿼리를 동적으로 구성해야 할 때) **문자열 연결을 사용해 쿼리를 생성하는 방식**이 일반적으로 **매우 불안정하고 오류가 발생하기 쉽습니다**.

JPA 2.0 표준에서 **Criteria Query API**가 도입되어 개선되었습니다. 이 API는 메타모델 클래스를 활용해 **타입 안전한 방식**으로 쿼리를 생성할 수 있는 새로운 방법을 제공했으나, 지나치게 장황하고 읽기 어려운 코드**를 생성하게 되었습니다. 예를 들어, Jakarta EE 튜토리얼에서 `SELECT p FROM Pet p`와 같은 간단한 쿼리를 작성하려면 다음과 같은 코드가 필요합니다:

```java
CriteriaBuilder cb = entityManager.getCriteriaBuilder();
CriteriaQuery<Pet> cq = cb.createQuery(Pet.class);
Root<Pet> pet = cq.from(Pet.class);
cq.select(pet);
TypedQuery<Pet> query = entityManager.createQuery(cq);
List<Pet> result = query.getResultList();
```

위와 같은 코드가 길고 복잡하게 느껴지는 것은 당연한 일입니다. 이에 따라, **생성된 메타데이터 클래스를 활용하면서도 더 직관적이고 읽기 쉬운 API**를 제공하는 **Querydsl** 라이브러리가 등장했습니다. Querydsl은 바로 이 아이디어를 기반으로 하여, **직관적이고 가독성 좋은 API**로 쿼리 작성 방식을 혁신적으로 개선하였습니다.

# 3. Querydsl 클래스 생성
이제 Querydsl의 API를 구현하는 메타클래스를 생성하고 조회하는 코드를 작성하는 방법에 대해 알아봅니다.
## 3.1. Maven에 Querydsl 추가
Querydsl을 프로젝트에 포함하기 위해서는 Maven pom.xml 파일에 몇 가지 의존성을 추가하고, JPA 어노테이션을 처리하기 위한 플러그인을 설정하면 됩니다. 먼저 Querydsl 버전을 <properties> 섹션에 정의합니다. 이 부분은 Querydsl의 최신 버전을 Maven Central에서 확인한 후 설정할 수 있습니다.
```
<properties>
    <querydsl.version>5.0.0</querydsl.version>
</properties>
```
다음으로, pom.xml 파일의 <dependencies> 섹션에 아래와 같은 의존성을 추가합니다:
```
<dependencies>
    <!-- Querydsl APT (Annotation Processing Tool) 의존성 -->
    <dependency>
        <groupId>com.querydsl</groupId>
        <artifactId>querydsl-apt</artifactId>
        <version>${querydsl.version}</version>
        <classifier>jakarta</classifier>
        <scope>provided</scope>
    </dependency>

    <!-- Querydsl JPA 의존성 -->
    <dependency>
        <groupId>com.querydsl</groupId>
        <artifactId>querydsl-jpa</artifactId>
        <classifier>jakarta</classifier>
        <version>${querydsl.version}</version>
    </dependency>
</dependencies>
```
querydsl-apt 의존성은 JPA 어노테이션을 처리하는 툴로, 소스 파일을 컴파일 전에 처리하여 Q-타입 클래스를 생성합니다. 예를 들어, User 클래스가 @Entity 어노테이션으로 정의되어 있으면, 생성되는 Q-타입 클래스는 QUser.java 파일로 생성됩니다.

이제, apt-maven-plugin 플러그인을 설정하여 빌드 과정에서 Q-타입 클래스를 자동으로 생성하도록 합니다.
```
<plugin>
    <groupId>com.mysema.maven</groupId>
    <artifactId>apt-maven-plugin</artifactId>
    <version>1.1.3</version>
    <executions>
        <execution>
            <goals>
                <goal>process</goal>
            </goals>
            <configuration>
                <outputDirectory>target/generated-sources/java</outputDirectory>
                <processor>com.querydsl.apt.jpa.JPAAnnotationProcessor</processor>
            </configuration>
        </execution>
    </executions>
</plugin>
```
이 플러그인은 Maven 빌드 중 process 단계에서 Q-타입 클래스를 생성합니다. outputDirectory는 생성된 클래스가 위치할 경로를 지정하는 설정입니다.

다음으로, 생성된 소스 파일을 IDE에서 인식할 수 있도록 해당 폴더를 소스 폴더로 추가해야 합니다.

예시 모델로, User와 BlogPost 엔티티가 있는 간단한 JPA 모델을 사용합니다:
```
@Data
@Entity
public class User {
    @Id
    @GeneratedValue
    private Long id;
    private String login;
    private Boolean disabled;
    @OneToMany(cascade = CascadeType.PERSIST, mappedBy = "user")
    private Set<BlogPost> blogPosts = new HashSet<>(0);
}

@Data
@Entity
public class BlogPost {
    @Id
    @GeneratedValue
    private Long id;
    private String title;
    private String body;
    @ManyToOne
    private User user;
}

```
위 Entity로 Q-타입 클래스를 생성하려면, 빌드 명령어를 실행합니다:
```
mvn compile
```
## 3.2. 빌드된 클래스 확인하기
target/generated-sources/java 디렉토리로 이동하면, 도메인 모델과 동일한 구조의 패키지와 클래스가 생성된 것을 볼 수 있습니다. 다만, 모든 클래스 이름은 Q로 시작합니다 (QUser, QBlogPost 등).

QUser.java 파일을 열어보면, 이 클래스가 User 엔티티와 관련된 쿼리를 작성하는 데 사용된다는 것을 알 수 있습니다. 이 파일에서 눈에 띄는 점은 @Generated 어노테이션이 붙어 있다는 점입니다. 이는 이 파일이 자동으로 생성되었으며 수동으로 수정하지 말아야 한다는 뜻입니다. 도메인 모델 클래스를 수정한 후에는 mvn compile을 다시 실행하여 관련된 모든 Q-타입을 재생성해야 합니다.

또한, QUser 클래스에서 주목할 점은 다음과 같은 정적 인스턴스입니다:
```
public static final QUser user = new QUser("user");
```

이 인스턴스는 대부분의 Querydsl 쿼리에서 User 엔티티를 참조할 때 사용됩니다. 예를 들어, 여러 테이블을 조인하는 복잡한 쿼리를 작성할 때 제외하고는 이 인스턴스를 활용합니다.

각 엔티티 클래스의 필드마다 해당하는 *Path 필드가 생성됩니다. 예를 들어, QUser 클래스에는 NumberPath id, StringPath login, SetPath blogPosts와 같은 필드가 생성되며, 이는 쿼리에서 해당 필드를 참조할 때 사용됩니다. 이 필드들은 나중에 쿼리를 작성하는 데 사용되는 fluent fluent API의 일부가 됩니다.

# 4. Querydsl로 쿼리 작성하기
## 4.1. 간단한 조회 및 필터링 쿼리
쿼리를 작성하려면 먼저 JPAQueryFactory 인스턴스를 생성해야 합니다. JPAQueryFactory는 기본적으로 EntityManager를 필요로 하고, 이 EntityManager는 EntityManagerFactory.createEntityManager() 호출이나 @PersistenceContext 주입을 통해 사용할 수 있습니다.
```
EntityManagerFactory emf = Persistence.createEntityManagerFactory("com.baeldung.querydsl.intro");
EntityManager em = emf.createEntityManager();
JPAQueryFactory queryFactory = new JPAQueryFactory(JPQLTemplates.DEFAULT, em);


QUser user = QUser.user;

User c = queryFactory.selectFrom(user)
  .where(user.login.eq("David"))
  .fetchOne();
```

위 코드에서 QUser는 QUser.user(클래스의 정적 인스턴스)로 생성됩니다. selectFrom() 메서드는 쿼리를 빌드하는 첫 번째 단계입니다. where() 메서드를 사용하여 조건을 추가하며, user.login은 QUser 클래스의 StringPath 필드를 참조합니다. StringPath는 eq() 메서드를 통해 필드 값과의 비교를 할 수 있게 합니다.

마지막으로 fetchOne() 메서드를 호출하여 데이터베이스에서 결과를 조회합니다. 이 메서드는 조건에 맞는 객체가 없으면 null을 반환하고, 만약 조건에 맞는 객체가 여러 개 있으면 NonUniqueResultException 예외를 발생시킵니다.

***
Reference
* https://www.baeldung.com/intro-to-querydsl
