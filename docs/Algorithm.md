# System design에서 활용되는 Algorithm
> Sliding Window, Two Pointers, Two Heaps, backtracking, Breadth-First Search (BFS), Depth-First Search (DFS), Topological Sort, Merge Intervals, Trie (Prefix Tree), Union-Find (Disjoint Set), Flood Fill, Segment Tree

## Sliding Window

Sliding window pattern은 array나 list를 순회하면서 “window”(다수개 elements) elements을 추적하여 해결하는데 사용되는 기술이다.
sliding window의 window는 고정된 크기 또는 특정 조건에 따라 확장되거나 축소될 수 있는 가변 크기도 가능합니다. 슬라이딩 윈도우 패턴의 주요 목표는 window를 minimizing 혹은 maximizing하여 요소들의 합이나 unique elements의 갯수와 같은 최적의 솔루션을 찾는 것입니다.

![image](https://github.com/low-hill/Knowledge/assets/6086626/df3603c9-840e-44b1-abf9-dd8ab3486430)

### 적용 사례
* streaming application(video와 audio)
  * 네트워크 상태에 따라 재생 품질을 버퍼링하고 제어
* 데이터 압축 알고리즘
  * Lempel-Ziv-Welch(LZW) 알고리즘: sliding window를 사용하여 반복 패턴을 식별하여 보다 효율적인 인코딩이 가능
* 네트워크 트래픽 패턴을 분석하여 이상 징후나 잠재적인 DDoS 공격을 탐지
* Text search 알고리즘
  * Boyer-Moore: large text내의 substring을 효율적으로 검색


***

## Two Pointers
배열, list나 string같은 데이터구조를 두개의 포인터 혹은 iterator를 통해 순회하여 탐색하는 기술이다. 해당 패턴은 데이터 내 요소(elements) 비교 혹은 요소쌍(pairs of elements)을 처리해야 하는 문제를 해결하는 사용된다. 두개의 포인터는 동일한 방향 혹은 반대 방향으로 이동할 수 있고, 해당 이동은 특정 제약 조건에 따라 결정될 수 있다.

![image](https://github.com/low-hill/Knowledge/assets/6086626/680607ea-0353-4be7-a800-af832a2e67f1)

### 적용 사례
* Binary search
  * 정렬된 배열에서 두 개의 포인터(left, right)를 사용하여 검색 요소를 점진적으로 좁혀 대상 값을 검색
* bioinformatics applications에서 DNA sequence 비교
  * 해당 기법을 사용하여 두개의 DNA sequence를 비교하여 배치
* merge-sort 알고리즘 -> [Merge sort 알고리즘 설명](https://www.enjoyalgorithms.com/blog/merge-sort-algorithm)
  * left ~ mid파트와 mid+1 ~ right로 두개 부분으로 나누고 정렬 후 다시 병합
* string이 palindromes 여부를 확인하는 search 알고리즘
  * 두개의 포인터를 사용하여 문자열의 양 끝 문자를 비교하면서 이동

***

## Breadth-First Search (BFS)

루트 노드(혹은 다른 임의의 노드)에서 시작해서 인접한 노드를 먼저 탐색하는 그래프 탐색 알고리즘으로, 다음 레벨로 이동하기 전에 같은 레벨에 있는 모든 정점을 방문한다. BFS는 queue를 사용하여 방문할 정점을 추적하여 큐에 추가된 순서대로 처리한다.

### 적용 사례

* 소셜 네트워크: 소셜 네트워크에서 두 사용자 간 최단 경로를 찾는 데 사용할 수 있고, 이는 사용자 간의 분리 정도나 상호 연결 수를 나타낼 수 있다.
* 웹 크롤러: Google과 같은 검색 엔진은 BFS 기반 알고리즘을 사용하여 초기 URL에서 시작하여 하이퍼링크를 너비 우선 순서로 따라가면서 웹 페이지를 웹 페이지를 크롤링하고 색인을 생성한다.
* GPS 내비게이션: 도로 유형, 교통 상황 및 거리 등 다양한 제약 조건을 고려하여 지도에서 두 위치 사이의 최단 경로를 찾는 데 BFS를 사용할 수 있습니다.
* 네트워크 방송: 컴퓨터 네트워크에서 BFS는 네트워크의 모든 노드에 메시지를 전송하여 각 노드가 메시지를 정확히 한 번만 수신하도록 하는 브로드캐스팅을 구현하는 데 사용할 수 있습니다.

***

## Merge Intervals

구간의 집합에서 겹치는 구간을 하나의 구간으로 병합하는 알고리즘이다. 이 문제는 시작 지점을 기준으로 정렬한 다음 정렬된 구간을 순회하며 겹치는 구간을 병합하여 해결할 수 있다.

### 적용 사례
* 캘린더 일정 관리: 겹치는 약속이나 이벤트를 병합하여 일정관리에서 여유 시간대를 찾는 데 사용될 수 있다.
* 자원 할당: 수요가 높은 기간이나 중복 사용 기간을 결정하는 데 사용할 수 있다.
* 네트워크 트래픽 분석: 네트워크 트래픽 데이터를 분석하고 과도한 트래픽이나 혼잡 기간을 식별하는 데 사용될 수 있다.
* Genome 데이터 처리: 겹치는 유전자 서열을 식별하거나 유전자 데이터를 분석하는 데 도움이 될 수 있다.

***

## Flood Fill
Flood Fill은 다차원 배열에서 특정 노드의 연결된 영역을 결정하는 사용되는 알고리즘으로 일반적으로 이미지 처리 및 컴퓨터 그래픽에 사용됩니다. 처음 노드에서 시작하여 target 색상이나 값을 새로운 색상/값으로 대체하고 인접 노드를 재귀적으로 처리한다. target 색상/값(특정 조건)으로 연결된 모든 노드가 visited되어 update될때까지 계속된다.

![image](https://github.com/low-hill/Knowledge/assets/6086626/48bbb472-b4ec-4b09-a7c8-ced6c6c9f3fe)

### 적용 사례
* 이미지 편집 도구
  * 이미지 편집 도구 내 "bucket fill" 혹은 "paint fill"기능(사용자가 특정 색상으로 영역을 채울 수 있는)에 사용


***

Reference

* [I Wish I Knew These 12 Algorithms and Their Applications Before the System Design Interview](https://levelup.gitconnected.com/i-wish-i-knew-these-12-algorithms-and-their-applications-before-the-system-design-interview-5fb7fa8b1177)