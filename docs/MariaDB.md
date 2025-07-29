### 튜닝
* /lib/systemd/system/mariadb.service
  * LimitNOFILE
* /etc/mysql/mariadb.conf.d/ 디렉토리에 있는 50-server.cnf 파일을 수정
* innodb option
```
innodb_buffer_pool_size : 전체 메모리의 50% ~ 80%까지 설정하며 낮은 값부터 조금씩 크기를 올려가며 적절한 값을 찾는 것이 것이 좋다.

innodb_log_buffer_size

innodb_file_per_table

innodb_log_file_size

innodb_max_dirty_pages_pct
```


파라미터 | 값
-- | --
innodb_buffer_pool_size | 전체 메모리의 50% ~ 80%까지 설정하며 낮은 값부터 조금씩 크기를 올려가며 적절한 값을 찾는 것이 것이 좋다.
innodb_flush_log_at_trx_commit | 0 / 1 / 2 (more performance, less reliability)
innodb_log_file_size | 128M – 2G (does not need to be larger than buffer pool)
innodb_flush_method | O_DIRECT (avoid double buffering)



* DB 재기동
```
sudo systemctl damon-reload
sudo systemctl restart mariadb
```