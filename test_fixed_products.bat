@echo off
echo Testing fixed products API endpoint with explicit php.ini...
echo.

REM Set the path to PHP executable and php.ini
set PHP_EXE=C:\xampp\php\php.exe
set PHP_INI=C:\xampp\php\php.ini

echo Using PHP: %PHP_EXE%
echo Using INI: %PHP_INI%
echo.

echo Testing fixed products API endpoint...
"%PHP_EXE%" -c "%PHP_INI%" -f api/test_products_fixed.php

echo.
echo Done!
pause
