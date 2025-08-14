---
layout: default
---
### dstat
IO, CPU, Network의 정보를 통합해서 모니터링 할 수 있고, plugin을 통해서 기능 확장도 가능하다. 사용하려면 설치해야 한다.
* `sudo api-get install dstat`
* `sudo dstat`
  * CPU, disk, network, paging, system 정보를 갱신하면서 표시
* plugin 사용하기
  * 전체 플러그인 목록 확인
    * sudo dstat --list
  * 위 명령에서 표시되는 plugin을 사용하려면 dash를 2개 사용해서 plugin이름을 지정하면 된다.
    * sudo dstat -c --top-cpu


### pidstat
pid 에 대한 CPU, 메모리, 디스크 사용량 출력
* pidstat [옵션] -p [프로세스 아이디]

옵션 | 내용
-- | --
-l | CPU 사용량 확인
-r | 메모리 사용량 확인
-d | 디스크 사용량 확인

***

## Processes

### top
* top -d 10
  * update 주기가 default로 3s이고, -d 옵션으로 update 주기를 변경 가능하다.
* top -p [프로세스 아이디]
  * 해당 프로세스의 performace 정보 확인

### ulimit
* process의 자원 한도를 설정

ulimit [option] 값
* -a: 모든 제한 사항들을 표시 (all)
* -c: 최대 코어 파일 사이즈
* -d: process 데이터 세그먼트 최대 크기
* -f: shell에 의해 만들어질 수 있는 파일의 최대 크기
* -n: 오픈 파일 최대수

> ulimit -a -> Soft 설정

> ulimit -aH -> Hard 설정

ulimit 명령어를 통한 변경
> ulimit -n 1000 [open files 갯수 수정; 한 프로세스에서 열 수 있는 open file descriptor 최대 숫자]

> ulimit -u 1000 [max user process갯수 수정; 단일 유저가 사용 가능한 최대 프로세스 갯수]



***

## file 관련 명령어

### ls
* 리눅스 폴더 및 파일 날짜순 정렬

```
ls -ltr: 리눅스 폴더 및 파일을 날짜순으로 정렬
* l : 자세히 보기
* t : 파일과 directory 시간 순으로 정렬
* r : 정렬된 순서를 내림차순으로 정렬
```

### ls -al
* folder 내  file 및 directory 정보 표시

### ll
* diretory/file  사용자 권한  그룹 권한  기타 사용자 권한

![image](https://github.com/low-hill/linux/assets/6086626/e3ee0dd0-e888-441e-b80e-be6ada309e66)

### mkdir filename – 설정한 이름에 따라 directory 생성
### rm filename – 파일 삭제
### rm -f filename – 파일 강제 삭제
### rm -r directoryname – directory 삭제
### rm -rf directoryname – directory 강제 삭제
### cp oldfile newfile – oldfile를 newfile에 복사
### cp -r olddir newdir – olddir를 newdir에 복사. newdir 폴더가 존재하지 않으면 생성된다.
### mv oldfile newfile – 파일 rename. oldfile를 이름을 newfile로 수정.
### ln -s /etc/log/file logfile – 파일 symbolic link 생성.
### touch newfile – 빈 파일 생성.
### cat > newfile – STDIN으로 입력된 내용이 file로 저장.
### more filename – 파일 전체 내용을 한화면으로 확인 가능하여 space나 enter키로 다음 내용을 확인 한다. 용량 큰 파일이나 명령 실행결과를 순차적으로 확인 가능하다.
### head filename – 파일의 처음 10줄을 출력한다.
### tail filename – 파일의 마지막 10줄을 출력한다.
### gpg -c newfile – 파일을 gpg format으로 비밀번호를 사용하여 암호화하여 동일한 디렉터리에 저장합니다.
### gpg newfile.gpg – gpg file 복호화 한다.

### wc filename – 파일의 바이트의 수, 단어 갯수와 라인 수를 출력
wc [옵션] [파일이름]

옵션 | 내용
-- | --
-c | 바이트(byte)의 수를 출력하는 옵션. 전체 문자 수 출력
-l | 행의 개수를 출력하는 옵션. 전체 라인 수 출력
-L | 가장 긴 행의 문자의 개수를 출력하는 옵션 입니다
-w | 단어의 개수를 출력하는 옵션. 전체 문자 수 출력
* `
netstat -anp|grep 'TIME_WAIT'|wc -l
`


***

## File/Directory 권한

### chmod
* change mode의 축약어로, 파일과 폴더의 사용권한을 변경

`chmod [option][mode][file]`

[option]
* -R: 하위 파일과 폴더에 모든 권한을 변경
* -v: 실행되고 있는 모든 파일 나열
* -c: 권한이 변경된 파일 출력

[모드]
* 문자열 모드

`chmod option [reference][operator][modes] file`

* 7: read(4) write(2) execute(1)

`chmod 777 /root/ssh` – owner, 그룹, 기타 사용자에게 read, write 및 execute권한 부여
`chmod 755 /root/ssh` – 소유자에 대해서는 rwx, 그룹 및 기타 사용자에 대해서는 r_x로 권한 부여.
`chmod 766 /root/ssh` – 소유자에 대해서는 rwx, 그룹 및 기타 사용자에 대해서는 rw 권한 부여.

### chown newuser filename – 파일의 소유자를 newuser로 변경.
### chown newuser:newgroup filename – file의 소유자와 소유그룹을 변경.
### chown newuser:newgroup directoryname – diretory의 소유권을 변경.
### stat -c “%U %G” filename – file의 user와 group 액세스 권한을 표시.

### stat filename
파일 및 파일 시스템에 대한 정보를 제공하는 명령;
* Stat 명령은 파일 크기, 액세스 권한, 사용자 ID 및 그룹 ID, 파일의 생성 시간 액세스 시간과 같은 정보를 제공한다.


***

## Search

### grep
파일 내에서 지정한 문자열을 찾아 해당 패턴을 포함하는 모든 행을 출력한다. 또는 폴더내 지정한 패턴을 포함하는 파일을 출력할 수도 있다.

`grep searchargument fileName` – 파일 에서 searchargument을 검색.

`grep -r searchargument newfolder` – folder 내 파일에서 searchargument를 검색.

`grep [option] [pattern] [fileName]`

[option]
* -i: 소문자, 대문자를 구분하지 않고 검색
* -c: 패턴이 일치하는 행 수를 출력
* -w: 패턴이 전체 단어와 일치하는 행을 출력
* -v: 지정한 패턴과 일치하지 않는 행을 출력
* -l: 매치하는 문자열이 있는 파일 이름을 출력
* -n: 행의 번호를 함께 출력

[fileName]
* 검색대상 파일

![image](https://github.com/low-hill/linux/assets/6086626/bf1beb2e-06f3-42b0-865a-8f1a03704a1f)

* 상위 명령어는 설치된 전체 패키중 목록중 jdk를 검색 함
전체 설치 패키지를 확인하는 rpm -qa와 파이프를 |를 함께 사용하여 특정 이름을 가진 패키지를 찾아낸다. 

### find
* file 혹은 directory 찾기

`find / -type d -name '디렉토리명'` – 이름으로 directory 찾기
`find /etc/ -name "searchargument"` – /etc 디렉토리에서 이름이 searchargument로 시작하는 파일을 찾는다
`find /etc/ -size +50000k` – /etc 디렉토리에서 50000k보다 큰 파일을 찾는다

### locate filename – file의 location을 표시


### network connection 상태 확인
```
netstat -an | wc -l

netstat -an | grep pid |wc -l          //pid의 connection 수 확인

netstat -an | grep TIME_WAIT |wc -l    //time_wait연결수 확인

netstat -an | grep ESTABLISHED|wc -l   //established connection 수 확인
```

Reference
* [Linux Commands Cheat Sheet](https://dev.to/serverspace/linux-commands-cheat-sheet-aif)