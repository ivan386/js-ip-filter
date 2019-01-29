md temp
cscript /nologo make-ip-filter.cscript.js < temp\ip-list.csv > temp\proxy.pac
copy /b temp\proxy.pac+ip-filter.js+proxy_pac.tmp temp\proxy.pac
pause