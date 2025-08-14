---
layout: default
---

## 서버리스란?
서버리스는 개발자가 서버를 관리할 필요 없이 애플리케이션을 빌드하고 실행할 수 있는 클라우드 애플리케이션 개발 및 실행 모델이다. 
서버리스 아키텍처는 인프라를 관리할 필요 없이 애플리케이션과 서비스를 구축하고 실행하는 방식이다.
서버리스 모델을 사용하면 개발자는 유휴 용량에 대한 비용을 지불하지 않는다. 비용 청구는 코드 실행을 시작하면 시작되고 실행을 멈추면 종료되고, 일반적으로 실행 시간 및 요구되는 리소스를 바탕으로 가격이 책정된다.

## 서버리스 서비스 유형
* functions / code execution (Lambda)
* APIs (API Gateway)
* Databases (Aurora DB, DynamoDB)
* Object storage (S3)
* orchestration (CloudWatch events, CICD with CodePipeline, CodeBuild, AI, SageMaker)
 
## 서버리스 장점
* 실제 사용량에 대해서만 비용이 청구되므로 경제적
* 인프라 관리가 아닌 코드 작성에 집중할 수 있어 개발자 생산성 향상
* 간단한 패키징 및 배포 

## 서버리스 단점
* 실행되는 함수가 호출되기 위해 컨테이너가 실행되는 대기 시간(Cold-Start)이 존재하기 때문인데 느리다. 빠른 응답이 필요한 제품의 경우 서버리스는 좋은 선택이 아닐 수 있다. 

***
   
## AWS Lambda
AWS Lambda는 서버리스 컴퓨팅 서비스로, 사용자가 서버를 프로비저닝하거나 관리할 필요 없이 코드를 실행할 수 있도록 해준다. Lambda 함수는 사용자가 작성한 코드를 실행하고, 필요한 리소스를 자동으로 할당하며, 실행 시간에 따라 과금된다. 이 서비스를 사용하면 애플리케이션의 일부 또는 전체를 클라우드에서 실행할 수 있어 관리 작업을 최소화하고 확장성과 유연성을 높일 수 있다.

## Lambda Layer
Lambda Layer를 통한 코드 및 구성 공유는 Lambda 함수의 **[복잡성을 줄이는]** 데 중요한 요소가 될 수 있다.          
AWS Lambda는 인프라 구축 없이 애플리케이션을 구축할 수 있는 강력한 도구를 제공한다. 그러나 Lambda 함수를 배포하는 과정은 코드 파일을 물리적으로 복사해야 하므로 많은 리소스와 시간이 소요될 수 있다. 이러한 방식은 특히 복잡성을 가진 서버리스 애플리케이션을 작업할 때 코드 중복을 초래할 수 있습니다. AWS Lambda Layer는 공통 요소를 생성하여 Lambda 함수에 통합할 수 있게 함으로써 복잡성을 줄입니다. 

## Lambda Step Function
multi-page user workflows에서 state machines은 자주 등장하는 기능으로, 특정 순서로 작동하고 구성 가능한 출력을 제공해야 한다. AWS는 이러한 요구를 공통 패턴으로 인식하고 Step Functions를 솔루션으로 제시했다.         
[AWS Step Functions](https://lumigo.io/aws-serverless-ecosystem/aws-step-functions-limits-use-cases-best-practices/)를 사용하면 구성 가능한 state machines을 통해 Lambda 함수의 배포 및 사용을 관리할 수 있다. 이를 통해 각 구성 요소가 독립적으로 동작하는 서버리스 애플리케이션에서 전통적인 문제인 애플리케이션 상태를 관리할 수 있다. AWS 대시보드의 사용자 인터페이스를 활용하면 편리한 함수 디자이너를 사용하여 Step Function 기반 상태 머신을 쉽게 구성하거나, [Amazon States Language](https://docs.aws.amazon.com/step-functions/latest/dg/concepts-amazon-states-language.html)를 통해 심도 있는 설정도 가능하다.        
![image](https://github.com/low-hill/Knowledge/assets/6086626/9c4768ce-1ed2-416b-86ad-386ca33396cb)

## Event-driven solutions
AWS Lambda는 온디맨드 인프라로, 이벤트 기반 아키텍처로 작동한다. 이러한 이벤트는 다양한 곳에서 발생하지만 일반적으로 시스템 활동 알림이나 데이터 저장소의 데이터 변경에 따라 달라진다. 아래와 같이 이벤트 트리거를 Data-driven 이벤트, 알림 기반 이벤트, 그리고 명확한 범주에 속하지 않는 기타 유형의 이벤트로 나누어 기술한다.   
   
> ## Data-driven event source
Data-driven event는 주로 데이터를 운영하는 소스에서 제공되고, 이 데이터는 애플리케이션 parameters의 캐시된 집합, 업데이트된 데이터베이스 또는 S3에 새 파일이 될 수 있다. 이러한 서비스들을 통해 사용자 데이터를 변경하는 모든 것은 AWS Lambda를 위한 트리거 이벤트를 생성할 수 있다.           
데이터 스토어를 적절하게 적용하면 사용자 활동에 실시간으로 대응할 수 있기에 아래에서는 Lambda와 통합되는 다섯 가지 인기 있는 데이터 기반 이벤트 소스를 다룬다.

### 1. Amazon RDS
첫 번째는 관계형 데이터베이스 서비스인 Amazon RDS이다. 이 이벤트 소스는 Amazon RDS에 호스팅된 데이터베이스의 활동에 반응합니다. RDS 서비스는 Simple Notification Service(SNS)에 알림을 생성하고, 이를 사용자 지정 AWS Lambda 함수를 호출하도록 구성할 수 있다. 이를 통해 관계형 데이터베이스의 활동을 기반으로 사용자가 지정한 워크플로우를 생성할 수 있다.

### 2. Amazon DynamoDB
Amazon DynamoDB는 데이터 활동에 기반하여 AWS Lambda 이벤트를 생성할 수 있는 NoSQL 기반 데이터베이스 시스템을 제공한다. 이 활동은 DynamoDB Streams에 캡처되며, 여기에는 DynamoDB 테이블의 item-level에서 제공되는 수정 사항의 시간 순서 시퀀스가 표시된다. 이 정보는 최대 24시간 동안 로그에 추가로 저장되어 데이터의 transition state를 캡처할 수 있다. DynamoDB Streams와 AWS Lambda를 연결하여 NoSQL 기반 데이터의 활동에 따라 동적인 워크플로우를 생성할 수 있다.

### 3. Amazon S3
Amazon Simple Storage Service는 모든 수준의 웹 트래픽을 처리할 수 있는 확장 가능한 스토리지 접근 방식을 제공한다. Amazon S3는 특정 S3 버킷 내에서 리소스 생성 및 삭제 시 이벤트를 생성하여 AWS Lambda와 동적으로 통합할 수 있다. 이를 통해 비디오 트랜스코더 및 로그 변환기와 같은 복잡한 파일 관리 flow를 생성할 수 있습니다.

### 4. Amazon Kinesis Data Streams
초당 수천 개의 소스에서 기가바이트의 데이터를 캡처해야 하는 경우 Amazon Kinesis Data Streams(Amazon KDS)와 같은 고용량 실시간 데이터 스트리밍 서비스를 사용하는 것이 좋다. Amazon KDS의 높은 확장성은 사용자 행동 및 기타 활동 스트림에 대한 실시간 분석을 가능하게 하여, 밀리초 단위로 수집된 데이터를 처리하여 다양한 대시보드, 사기 탐지 시스템 등으로 분산할 수 있습니다. AWS Lambda는 이 flow에 동기식으로 플러그인하여 구성된 소스의 중요한 데이터 스트림에 동적으로 반응할 수 있다. 이를 통해 데이터를 일괄로 읽고 처리하며, 스트림 데이터를 적절히 수집하고 전송할 수 있다.

### 5. Amazon ElastiCache
ElastiCache가 데이터 분석 및 검색을 가능한 한 빠르게 제공하도록 설계되었기 때문에 애플리케이션 전반에 쉽게 캐싱을 구현할 수 있다. AWS Lambda는 ElastiCache 시스템의 이벤트에 응답하여 필요할 때 캐시 이벤트에 빠르게 대응할 수 있다.
                          
> ### Notification-driven
Notification-driven을 통해 상당한 양의 데이터를 다룰 수 있지만, 그들의 주요 목적은 한 시스템에서 다른 시스템으로 정보를 라우팅하는 것이다. 이러한 알림 기반 이벤트 소스 중 가장 인기 있는 **Amazon API Gateway**, **Amazon SES**, **Amazon SNS**, Amazon SQS 등 네 가지를 살펴본다.


***


## Lambda Architecture
![image](https://github.com/user-attachments/assets/2c734923-6cb2-4f76-9484-344c8e8aac9e)
Lambda의 내부 작동 방식에 자세히 살펴보면 다음과 같다:
* Frontend Service: Lambda 함수가 호출될 때, rontend Service가 중요한 역할을 합니다. 요청을 적절한 data plane services로 라우팅하고 호출 프로세스의 초기 단계를 관리합니다
* Worker Hosts and MicroVMs: Lambda는 Firecracker에 의해 만들어진 수많은 MicroVM을 관리하는 worker hosts로 운영됩니다. 각 MicroVM은 단일 함수 호출에 전용으로 할당되어 격리되고 안전한 실행 환경을 보장합니다. 또한, 여러 worker hosts가 동일한 Lambda 함수 호출을 동시에 처리할 수 있도록 아키텍처가 설계되었습니다. 이러한 설정은 고가용성과 강력한 로드 밸런싱을 제공할 뿐만 아니라 여러 가용 영역에 걸쳐 서비스의 확장성과 신뢰성을 향상시킵니다
* Firecracker: Firecracker는 Lambda 아키텍처의 핵심 구성 요소입니다. 각 함수 호출에 대해 경량화되고 안전한 MicroVMs을 생성할 수 있게 해줍니다. 이 메커니즘은 Lambda 함수의 요구에 따라 리소스가 효율적으로 할당되고 확장되도록 보장합니다
* Internal Queueing in Lambda: 비동기 호출 프로세스의 경우, AWS Lambda는 내부 큐잉 메커니즘을 구현합니다. 이벤트가 Lambda 함수를 트리거할 때, 이들은 먼저 이 내부 큐에 배치됩니다. 이 시스템은 이벤트를 처리 가능한 마이크로VM에 효율적으로 분배합니다. 내부 큐는 특히 수요 급증이나 높은 처리량 시나리오에서 Lambda 함수의 원활한 운영을 유지하는 데 중요한 역할을 합니다.

***

## Lambda 환경 변수 사용
환경 변수를 사용하면 코드를 업데이트하지 않고도 함수의 동작을 조정할 수 있다. 환경 변수는 함수의 버전별 구성에 저장되는 문자열 쌍이다. Lambda 런타임은 환경 변수를 코드에서 사용할 수 있게 하고, 함수 및 호출 요청에 대한 정보를 포함하는 추가 환경 변수를 설정한다.      
![image](https://github.com/low-hill/Knowledge/assets/6086626/b7bf5e10-c9f5-44e3-86fc-f6768bda0330)

참고: 보안을 높이기 위해 데이터베이스 자격 증명 및 API 키 또는 권한 부여 토큰과 같은 민감한 정보를 저장하기 위해 AWS Secrets Manager를 사용하는 것이 좋다. (자세한 내용은 AWS Secrets Manager로 시크릿 생성 및 관리를 참조)

환경 변수는 함수 호출 전에 평가되지 않는다. 정의한 모든 값은 문자열 그대로 취급되며 확장되지 않는다.


***

### Scaling
애플리케이션의 단일 인스턴스가 대부분의 날의 부하를 처리할 수 있지만, 트래픽이 빠르게 증가할 수 있는 이벤트에 대비해야 한다. 이 문제를 해결하는 방법은 아래와 같이 방법이 있다.
* #### 수직적 확장으로 해결 [Scale Up]
기존 서버에 메모리 또는 더 빠른 CPU를 추가하여 수직적으로 확장하는 것입니다. 하지만 다운타임 없이 이를 달성하기는 쉽지 않다.
* #### 수평적 확장으로 해결 [Scale Out]
애플리케이션의 인스턴스를 더 많이 배포하고 인스턴스 간에 트래픽을 분산하여 수평적으로 확장하는 것이다. 그러면 인스턴스 중 하나가 오작동하더라도 다른 인스턴스로 워크로드를 손쉽게 분산할 수 있다. 또한 다운타임 없이 더 쉽게 작업을 수행할 수 있다.
* #### 트래픽에 따른 리소스 자동 확장 [Auto Scaling]
리소스를 추가하면 비용이 들기 때문에 요금이 증가하지 않도록 주의해야 한다. 다행히도 트래픽에 따라 리소스를 자동으로 확장할 수 있다. 다양한 메트릭을 기반으로 기존 애플리케이션 인스턴스가 한계에 도달했는지 예측하고 그에 따라 조치를 취할 수 있습니다.

### Auto Scaling
Amazon AWS ECS에는 아래와 같은 두 가지 자동 확장 유형이 있다.
* #### Cluster Auto Scaling
Amazon ECS는 Application Auto Scaling 서비스를 활용하여 Auto Scaling를 제공한다.

* #### Service auto scaling


**Reference**
* [서버리스란?](https://www.ibm.com/kr-ko/topics/serverless)
* [서버리스 컴퓨팅](https://www.samsungsds.com/kr/insights/1232763_4627.html)
* [AWS-📚-람다Lambda-개념-원리](https://inpa.tistory.com/entry/AWS-%F0%9F%93%9A-%EB%9E%8C%EB%8B%A4Lambda-%EA%B0%9C%EB%85%90-%EC%9B%90%EB%A6%AC)
* [Using Lambda environment variables](https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html)
* [Defining environment variables](https://wanago.io/2023/03/27/api-nestjs-aws-secret-manager/)
* [Scaling the number of application instances with Amazon ECS](https://wanago.io/2023/03/13/api-nestjs-ecs-scaling/)
* [An Introduction to the AWS Serverless Ecosystem](https://lumigo.io/aws-serverless-ecosystem/)
* [Lambda Internals: the Underneath of AWS Serverless Architecture](https://medium.com/fively/lambda-internals-the-underneath-of-aws-serverless-architecture-5af49e3711f2)