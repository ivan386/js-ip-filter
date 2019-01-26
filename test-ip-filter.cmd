copy /b temp\proxy.pac+test-ip-filter.js temp\test-proxy-pac.js
cscript /nologo temp\test-proxy-pac.js < temp\ip-list.csv > temp\output.txt
pause