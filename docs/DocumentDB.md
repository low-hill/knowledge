---
layout: default
---
## DocumentDB 개요
Amazon DocumentDB는 MongoDB와 대부분 호환되는, 완전 관리형 native JSON document 데이터베이스입니다.      
MongoDB의 일부 기능은 지원하지 않지만, 기본적인 보안, 백업, 확장성, 장애 복구 등이 기본 제공되는 관리형 데이터베이스 서비스이기 때문에 사용자는 많은 운영 부담에서 벗어날 수 있습니다.
AWS의 DMS(Database Migration Service)를 사용하면 MongoDB에서 DocumentDB로 쉽게 마이그레이션할 수 있습니다.
DocumentDB는 JSON 기반 애플리케이션을 위한 완벽한 솔루션이 될 수 있으며, 관리의 부담 없이 MongoDB와 유사한 개발 환경을 제공합니다. 많은 운영 작업을 AWS가 대신 처리하기 때문에 사용자는 애플리케이션 개발에만 집중할 수 있습니다.         

## 가격
물론 기능 평가뿐만 아니라 DocumentDB로 마이그레이션하기 전에 가격도 반드시 고려해야 합니다.
DocumentDB의 가격은 다음 4가지 요소에 기반합니다:
* 인스턴스 타입과 인스턴스 수
* 데이터베이스 스토리지: GB당 $금액/월 (리전마다 다름)
* 백업 스토리지: GB당 $금액/월 (리전마다 다름)
* 클러스터 스토리지 볼륨의 I/O 요청 수: 100만 요청당 $0.22 (리전마다 다름)
1번부터 3번까지는 기존 MongoDB에서 마이그레이션하는 경우에 추정이 비교적 쉽지만, 4번 비용 요소는 까다롭습니다. 실제 소비하기 전에 예상 I/O 요청 수를 어떻게 예측할 수 있을까요? 자세히 살펴봅시다.

## Reference
* https://aws.amazon.com/documentdb/pricing/
* https://www.tecracer.com/blog/2023/08/calculating-aws-documentdb-storage-i/os.html