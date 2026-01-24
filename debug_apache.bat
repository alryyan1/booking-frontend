@echo off
echo Checking Apache Configuration...
c:\xampp\apache\bin\httpd.exe -t > apache_checks.txt 2>&1
echo Done.
