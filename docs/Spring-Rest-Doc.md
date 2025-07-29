* 신뢰도가 높은 document를 생성해주는 RESTful 서비스의 문서화 도구. 기본적으로 Asciidoctor를 사용하여 HTML를 생성한다. 필요 한 경우 Markdown을 사용하도록 변경할 수 있다.

### 장점
* Spring MVC test framework, Spring WebFlux WebTestClient, REST ASSured 3를 통해 작성된 테스트가 성공해야 문서 작성 됨. 
  * API 신뢰도를 높이고 더불어 테스트 코드의 검증을 강제로 하게 만드는 문서화 도구
* 실제 코드에 추가되는 코드가 없다.
  * 프로덕션 코드와 분리되어 Swagger같이 Config설정 코드나 어노테이션이 프로덕션 코드에 추가될 일이 없다.

### Spring Rest Docs Flow
* Test → Snippets → Template → Document
  * 테스트 코드를 실행하면 ./build/generated-snippets폴더에REST docs snippets 파일들이 생성
    * curl-request
    * http-request
    * http-response
    * httpie-request
    * request-body
    * response-body
  * 생성된 파일들을 의도하는 대로 템플릿에 배치 템플릿을 기준으로 html 파일을 생성

### Minimum requirements
* Java 8
* Spring Framework 5( 5.0.2 or later)

### 작업환경
* Java 11
* Spring boot 2.7.4 
* MockMvc 
* AsciiDoc

### gradle 의존성 주입
* ./build.gradle 설정
```
plugins { ...
    id 'org.asciidoctor.jvm.convert' version '3.3.2'
        ...
}
group = 'com.example'
version = '0.0.1-SNAPSHOT'
sourceCompatibility = '11'
repositories {
    mavenCentral()
}
ext {
    set('snippetsDir', file("build/generated-snippets"))    //
}
configurations {
    asciidoctorExtensions
}
dependencies {
        ...
    implementation 'org.springframework.boot:spring-boot-starter-web'
    asciidoctorExtensions 'org.springframework.restdocs:spring-restdocs-asciidoctor'
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testImplementation 'org.springframework.restdocs:spring-restdocs-mockmvc'
...
}
tasks.named('asciidoctor') {
    inputs.dir snippetsDir
    dependsOn test
    configurations 'asciidoctorExtensions'  //
}
bootJar {
    dependsOn asciidoctor
}
```
* gradle7에서 org.asciidoctor.convert(v 1.5.9) 플러그인이 에러가 발생하여 위와 같은 설정으로 사용
-> [Asciidoctor 빌드 오류](https://jinseobbae.github.io/spring/2022/01/26/gradle-asciidoc-error.html) 참고

### 테스트 코드 작성
```
@Test
public void findById() throws Exception {
    User userRes = new User(1L, "u1", "u1@bespinglobal.com");
    this.mockMvc.perform(RestDocumentationRequestBuilders.get("/user/{userId}", userRes.getId()))
            .andExpect(status().isOk())
            .andDo(document("user-get-one",
                    pathParameters(
                            parameterWithName("userId").description("")
                    ),
                    responseFields(
                            fieldWithPath("data").description(""),
                            fieldWithPath("data.id").type(JsonFieldType.NUMBER).description(""),
                            fieldWithPath("data.name").type(JsonFieldType.STRING).description(""),
                            fieldWithPath("data.email").type(JsonFieldType.STRING).description("")
                    )
             ));
}
```

### document 작성 방법

* RestDocumentationRequestBuilders로 API 호출
* path 파라미터
```
pathParameters(
  parameterWithName("userId").description("아이디") 
)
```
* Request body
```
requestFields(
                fieldWithPath("id").description("")
)
```
* Json Response
```
responseFields( fieldWithPath("data").description("결과메시지")
)
```
  * response 접근 방법
    * 배열일때 [].으로 접근
      * fieldWithPath("[].id").type(JsonFieldType.STRING).description("상세 설명...") 
    * 배열에 이름이 있을때  *.[]로 접근
      * fieldWithPath("data.[].id").type(JsonFieldType.STRING).description("상세 설명...")
  * responsefield example
```
this.mockMvc.perform(get("/user"))
                ...
                .andDo(document("user-get-all",
                        responseFields(
                                fieldWithPath("data").description(""),
                                fieldWithPath("data.[].id").type(JsonFieldType.NUMBER).description(""),
                                fieldWithPath("data.[].name").type(JsonFieldType.STRING).description(""),
                                fieldWithPath("data.[].email").type(JsonFieldType.STRING).description("")

```

* test 수행 시 ./build/generated-snippets/ 하위에 문서(*.adoc)가 생성 된다.
  * <img width="209" alt="image" src="https://github.com/low-hill/Knowledge/assets/6086626/a7057f70-479f-4ff7-b5be-88dfb47cb536">

### snippets 연결 및 문서화
생성된 snippets 파일들을 연결해줄 사용자 정의 .adoc파일을 "src/docs/aciidocs"경로에 생성하고 문서를 구성 한다.
* snippets 파일 연결
  * include::{snippets}/test-example/curl-request.adoc[]
  * Asciidoctor User Manual → https://docs.asciidoctor.org/asciidoctor/latest/
* include로 각각의 파일 삽입하는 대신 operation으로 원하는 파일만 가져옴

```
[[resources_user]]
== User Sample
[[resources_user_list]]
=== User
`GET`
operation::user-get-all[snippets='response-fields,http-response']
[[resources_user_get_one]]
=== User
operation::user-get-one[snippets='path-parameters,response-fields,http-response']
```

* 작성 후 build 시 build/docs/asciidoc에 hmtl 파일이 생성 된다.

| Source files | Generated files |
| --- | --- |
|src/docs/asciidoc/*.adoc | build/docs/asciidoc/*.html|
* <img width="722" alt="image" src="https://github.com/low-hill/Knowledge/assets/6086626/aee3ec9f-1951-4ad5-ae16-4a012c75acec">
