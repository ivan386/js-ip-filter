copy /b temp\antizapret-proxy.pac+hex-list-to-ip-list.js+ranges-to-ip-list.js temp\proxy-pac-to-ip-csv.js
echo WScript.Echo(to_ip_list(d_ipaddr).join(",\n")) >> temp\proxy-pac-to-ip-csv.js
echo WScript.Echo(ranges_to_ip_list(special).join(",\n")) >> temp\proxy-pac-to-ip-csv.js
cscript /nologo temp\proxy-pac-to-ip-csv.js > temp\ip-list.csv
cscript /nologo make-ip-filter.cscript.js < temp\ip-list.csv > temp\proxy.pac
copy /b temp\proxy.pac+ip-filter.js+proxy_pac.tmp temp\proxy.pac
pause