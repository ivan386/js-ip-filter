cscript /nologo make-ip-filter.cscript.js < ip-list.csv > proxy.pac
copy /b proxy.pac+ip-filter.js+proxy_pac.tmp proxy.pac
pause