---
layout: default
---
# 1. Docker 이미지의 최적화가 중요한 이유
Docker 이미지의 최적화가 중요한 이유는 공간 및 비용을 절약할 수 있기 때문입니다. Docker의 이미지가 커질수록 다음과 같은 비용이 발생합니다:

* 시간: 빌드 및 배포 cycle이 느려짐
* 비용: 저장소와 네트워크 대역폭 비용 증가
* 성능: 애플리케이션의 응답이 저하됨

***
# 2. Docker 이미지 최적화 방법
과도하게 커진 Docker 이미지가 디스크 공간을 차지하고, 배포 속도를 느리게 만듭니다. 아래는 이미지 크기를 최대 99%까지 줄이며, 효율적인 Docker 운영을 실현할 수 있는 방법에 대해 살펴봅니다.

1. 멀티 스테이지 빌드 (Multi-stage builds)
    * 여러 빌드 스테이지를 사용해 불필요한 빌드 파일을 최종 이미지에서 제외할 수 있습니다.
2. 레이어 최적화 (Layer optimizations)
    * RUN 명령을 최적화하고, 변경이 적은 레이어는 상단에 위치시켜 효율적인 캐싱을 유도합니다.
3. 최소화된 베이스 이미지 사용 (Minimal base images)
    * 최소한의 라이브러리만 포함된 이미지를 사용하여 필요한 요소만 포함하도록 합니다.
4. Distroless 이미지 사용(Advanced techniques like distroless images)
    *  운영체제 요소가 없는 최소 이미지를 사용하여, 보안성을 높이고 크기를 줄일 수 있습니다.
5. 보안 최적화 (Security best practices)

위 방법으로 일반적으로 작성된 Dockerfile의 이미지를 축소하는 방법에 대해 상세하게 살펴봅니다.

***
# 3. 최적화 상세 과정
하위와 같이 Python 기반 애플리케이션을 위한 Dockerfile을 살펴보겠습니다.
```
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "main.py"]
```
이 Dockerfile이 결과적으로 큰 이미지로 생성하게 되는 이유는 다음과 같습니다:

* 전체 Python 이미지 사용: python:3.9와 같은 풀 이미지를 사용하면, 불필요한 빌드 도구와 라이브러리까지 함께 포함되기 때문에 이미지 크기가 커집니다.
* 빌드 도구 및 개발 라이브러리 포함: 실행 환경에 필요한 라이브러리 외에도, 개발에 필요한 도구들이 포함되어 있어 최종 이미지 크기를 불필요하게 증가시킵니다.
* 효율적이지 않은 레이어 캐싱: Dockerfile에서 각 명령어가 새로운 레이어를 생성하는데, 이 과정에서 중복되거나 불필요한 파일들이 이미지에 포함될 수 있습니다.
다음은 위와 같은 이미지 축소를 위한 여러 최적화 방법을 살펴보겠습니다.
## 3.1 멀티 스테이지 빌드 (Multi-stage Builds)
멀티 스테이지 빌드는 빌드 환경과 실행 환경을 분리하여 최종 Docker 이미지 크기를 크게 줄일 수 있습니다. 이를 통해 빌드에 필요한 도구나 라이브러리를 최종 이미지에 포함시키지 않고, 오직 실행에 필요한 파일만 포함할 수 있습니다.(빌드 시 의존성과 실행 시 의존성 분리)
### 3.1.1 빌드 환경과 실행 환경 분리
멀티 스테이지 빌드를 통해, 빌드 단계에서만 필요한 도구들을 포함시킨 후, 최종 이미지는 최소한의 환경만 남기게 됩니다. 다음은 이를 적용한 Dockerfile의 예입니다.

> 빌드 스테이지 (Build Stage)

첫 번째 스테이지에서는 python:3.9-slim 이미지를 사용하여 빌드 환경을 구성합니다. 이 단계에서 필요한 의존성을 설치하고, 애플리케이션 코드를 복사한 후, PyInstaller와 같은 도구를 사용해 실행 파일을 생성합니다.
```
FROM python:3.9-slim AS builder

# 필요한 빌드 툴 설치
RUN apt-get update && apt-get install -y --no-install-recommends build-essential gcc && rm -rf /var/lib/apt/lists/*

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 설치
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# 애플리케이션 코드 복사
COPY . .

# 모델 컴파일 (필요시)
RUN python compile_model.py

# PyInstaller 설치 및 실행 파일 생성
RUN pip install pyinstaller
RUN pyinstaller --onefile inference.py

```
이 빌드 스테이지에서는 실행에 필요한 파일을 준비하는 데 필요한 도구들만 포함됩니다. 하지만 이 단계에서 생성되는 파일들은 실행 환경에 필요하지 않기 때문에, 두 번째 스테이지에서 제거할 수 있습니다.

> 프로덕션 스테이지 (Production Stage)

두 번째 스테이지는 최소화된 실행 환경을 설정하는 단계입니다. 이 스테이지에서는 scratch 이미지를 사용하여 운영체제나 불필요한 라이브러리 없이 실행에 필요한 최소한의 파일만 포함된 이미지를 생성합니다.
```
FROM scratch

# 작업 디렉토리 설정
WORKDIR /app

# 빌드 스테이지에서 필요한 파일만 복사
COPY --from=builder /app/dist/inference /app/inference
COPY --from=builder /app/model /app/model

# 실행 파일 실행
ENTRYPOINT ["/app/inference"]
```
이와 같은 방식으로 빌드 도구와 라이브러리를 제외하고, 오직 실행에 필요한 최종 파일만 복사하여 최소화된 이미지를 생성할 수 있습니다. 최종적으로 생성된 이미지는 약 85MB 크기로, 처음 1.2GB였던 이미지에 비해 90% 이상 크기가 줄어듭니다.

멀티 스테이지 빌드는 이미지를 효율적이고 깔끔하게 최적화할 수 있는 매우 강력한 방법입니다. 이를 통해 애플리케이션의 실행 환경을 간소화하고, 불필요한 파일을 제거할 수 있습니다.

## 3.1 레이어 최적화: 최소화된 레이어로 더 작은 이미지 만들기
Dockerfile에서 각 명령어는 새로운 레이어를 생성합니다. 따라서 각 명령어를 최소화하고, 여러 명령어를 하나로 합치는 것이 중요합니다. 예를 들어, 패키지를 설치하고 불필요한 파일을 삭제하는 명령을 하나로 결합하면 이미지 크기를 줄일 수 있습니다.

예시:
```
RUN apt-get update && apt-get install -y python3-pip python3-dev && \
    pip3 install numpy pandas && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

```
위처럼 **&&**를 사용하여 여러 명령어를 하나의 RUN 명령으로 결합하면, Docker가 레이어를 줄여 최종 이미지를 최적화할 수 있습니다.
***

* [Docker pros are shrinking images by 99%: The hidden techniques you can’t afford to miss](https://aws.plainenglish.io/docker-pros-are-shrinking-images-by-99-the-hidden-techniques-you-cant-afford-to-miss-a70ee26b4cbf)
* https://dev.to/devops_descent/mastering-docker-essential-best-practices-for-efficiency-and-security-34ij?context=digest
