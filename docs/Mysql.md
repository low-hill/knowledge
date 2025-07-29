### Backup
    mysqldump -u user -p비밀번호 [database_name/table_name] > dump.sql
    mysqldump -u user -p비밀번호 --databases db_name1 db_name2 > dump.sql
    mysqldump -u user -p비밀번호 --all-databases >dump.sql
### Restore
    mysql -u user -p password < dump.sql