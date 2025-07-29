## 메타의 LLaMa
Meta는 자체 개발한 초대형 언어 모델(LLM)인 LLaMA의 소스코드를 공개하는 방식으로 오픈소스 전략을 추진하고 있고, 이를 통해 다양한 프로젝트에서 LLaMA를 원하는 목적에 맞게 커스터마이징하여 사용할 수 있게 되었다.

작지만 강력한 LLM, LLaMA(Large Language Model Meta AI)
메타의 LLaMA는 70억, 130억, 330억, 650억개의 매개변수를 가지는 네 가지 모델로 구성되어 있다. 이 모델들은 1750억개의 매개변수를 가진 GPT-3.5와 비교했을 때 매개변수 수가 적지만, 그럼에도 불구하고 높은 성능과 모델 학습의 유연성을 자랑하며 개발자들 사이에서 인기를 끌고 있다.

## 구글의 LaMDA와 PaLM2
### LaMDA
LaMDA는 'Language Model for Dialogue Applications'의 줄임말로, 대화를 위한 언어 모델을 가리킨다. 일반적인 언어 모델처럼 텍스트가 입력되면 그 다음 단어를 예측하는 방식으로 학습된다. 또한, LaMDA는 대량의 텍스트 데이터로 학습되었으며, 이 과정은 사전학습(Pre-training)이라고 한다. 약 30억 개의 문서와 11억 개의 대화(총 134억 개의 개별 발언)를 학습 데이터로 사용하였다. 이러한 점은 GPT 등 다른 모델과 차이가 없다.
### PaLM2
PaLM2는 약 5400억개의 매개변수를 가진 초대형 언어 모델이다. 이는 GPT-3의 1750억개에 비해 약 3배에 달하는 매개변수 수를 보유하고 있으며, 이 덕분에 다양한 자연어 처리(NLP) 벤치마크에서 최고 점수를 기록하였다. 이런 결과는 모델의 규모가 클수록 성능이 향상되는 가설이 아직까지도 유효하다는 것을 입증하였다.

## 그밖의 sLLM(small Large Language Model)
### sLLM란?
언어 모델의 매개변수(parameter)를 줄이고 비용을 절약하는 동시에 미세조정(fine-tuning)을 통해 정확도를 높이는 '맞춤형 LLM'이라는 개념을 포함하고 있다.     
초대형 언어 모델(sLLM)의 등장은 앞서 설명했던 Meta의 LLaMA의 출시를 시작으로 했다. 메타는 기본 버전인 66B(매개변수 650억 개)와 함께 다양한 크기의 '라마' 버전을 출시했는데, 이 중에서 가장 작은 모델의 매개변수는 단지 70억개(7B 버전)에 불과했다.     
메타는 매개변수 수를 늘리는 것이 아닌, LLM 학습에 사용되는 텍스트 데이터 단위인 토큰의 양을 증가시키는 방법을 택하여 모델의 품질을 향상시켰다고 밝혔다. 이 방식은 LLM의 훈련 과정에서 토큰의 양을 늘리면서 모델의 성능을 개선할 수 있음을 보여주었고, 단순히 매개변수의 수를 늘리는 것이 아닌 다른 방식으로 모델의 품질을 높이는 가능성을 제시하였다.       

스탠포드 대학교 연구팀은 라마 7B를 기반으로 한 초대형 언어 모델(sLLM) '알파카'를 개발하여 공개하였다. 그리고 이와 병행해서, AI 칩 전문 기업인 세레브라스 역시 다양한 형태의 sLLM 모델들을 선보였다. 이 중에서 주목받는 모델은 지난주에 갓잇AI가 출시한 '엘마'라는 sLLM 모델로, 이는 특히 사내 구축형(온프레미스) 서비스를 제공한다는 점에서 독특하다.

이런 형태의 서비스는 클라우드 기반 서비스와는 달리, 기업의 민감한 데이터가 외부에 노출되는 것을 방지하면서 머신러닝 연산을 수행하는데 최적화된 구조를 가지고 있다. 이를 통해, 엘마는 데이터 보안에 민감한 기업들이 자체 데이터를 안전하게 활용하여 머신러닝 모델을 학습시킬 수 있는 환경을 제공하며, 이는 다른 sLLM 모델들이 제공하지 못하는 독특한 가치를 제공한다.

## LLM을 이용하는 다양한 방법
### 1. API 서비스를 활용하기
> 장점
> * 고성능
> * 사용한 만큼 비용 부과하는 정책
> * 큰 모델을 곧바로 서비스에 적용 가능
> * AI 개발자 별로도 필요 없고, 기존 개발자들도 이용 가능     

> 단점
> * 서버 관리가 잘 된다는 보장이 없음(OpenAI 서버에 영향을 받음)
> * GPT-4와 같은 경우는 매우 낮은 Quota
> * 서비스 유지가 의존적   

   
### 2. sLLM을 활용하기
> 장점
> * 원하는 형태의 출력이 가능
> * 비싸지 않은 학습 비용
> * CPU 등으로 서빙하면 비용 절감도 가능      

> 단점
> * 제한된 성능
> * Task별 Finetune용 데이터 구축 필요 -> LLM 학습용 텍스트 구축보다 어려움
> * AI 연구 / 개발 인력 필요
> * LLM보다 성능이 좋을지 알 수 없다        

## 상황별 현실적 접근 방법      
* 큰 IT 기업 / 대기업
  * 자체 데이터 및 자체 GPU 사용 (A100 * 1000대 이상)
* 자유로운 스타트업
  * Privacy / 법률 이슈가 없다면 ChatGPT/GP-4
* 대기업과 자유로운 스타트업 그 사이
  * 보안 및 고객 Privacy도 챙겨야 하고, 법률적 문제도 있는 경우

* instruct tuning
* one, zero, few




Reference:
* https://blog-ko.superb-ai.com/what-is-the-alternative-to-llm-in-chatgpt/[
* https://medium.com/rahasak/creating-custom-chatgpt-with-your-own-dataset-using-openai-gpt-3-5-model-llamaindex-and-langchain-5d5837bf9d56#id_token=eyJhbGciOiJSUzI1NiIsImtpZCI6IjZmOTc3N2E2ODU5MDc3OThlZjc5NDA2MmMwMGI2NWQ2NmMyNDBiMWIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIyMTYyOTYwMzU4MzQtazFrNnFlMDYwczJ0cDJhMmphbTRsamRjbXMwMHN0dGcuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIyMTYyOTYwMzU4MzQtazFrNnFlMDYwczJ0cDJhMmphbTRsamRjbXMwMHN0dGcuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDQxODYyMjY5NTg0MzkzNTcxMDEiLCJlbWFpbCI6Imp4eTUxMzBAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5iZiI6MTcwOTE2NzczMiwibmFtZSI6Iuq5gOyghOyYgSIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NKbjVjMXNMQnhvRHh1ZzdxWEZtd19PTnJlcWxOSGhVdFA5amg1b1dDWW1XNUk9czk2LWMiLCJnaXZlbl9uYW1lIjoi7KCE7JiBIiwiZmFtaWx5X25hbWUiOiLquYAiLCJsb2NhbGUiOiJ6aC1DTiIsImlhdCI6MTcwOTE2ODAzMiwiZXhwIjoxNzA5MTcxNjMyLCJqdGkiOiJjNjYwZGUxYWZiNTg1NWM2ZWZiMzIzYjZkYzJiZTE3NjIxZDdlMGM2In0.Wb85xpveMFPqpkRIhRb8TZnL512F6-MY7nboSffjEcdQDUUmwC0ExsRlhqMltos8Axgi0D0nRR2dlwk5x7zVGmoNfL56xBnfXSjBO3D-dwHYbeeWkklnHojFlgECNi-kerK0kzU9y-tpg8fZPinQLZTnLWyTUuz51layg0cXfe6IE2VEqs1-hML2A-49N8C4L-ZZSGXzynv3hyQqFgHfJQ7_-zySHTHNol6XVp52GRTmb0Voq8-CgHgoIGcvfHBnBa5ut3ObptHHhwed2ATHpQ0hfgTA9OAF3T12Sk2kDp_nDTMAGEqeGrlMaB9vamif2zaots2bRKVvIl0iUT9kbA
* https://www.datacamp.com/tutorial/how-to-build-chatbots-using-openai-api-and-pinecone
* https://www.youtube.com/watch?v=7HbugcCBXwE