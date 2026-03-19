@echo off
echo Testing IPRoyal proxy with curl...
curl -x "http://rd60wbshpxgDWD3F:1gYsyrIt8Vwk27RQ_country-nl_city-amsterdam_session-Q4og2CbM_lifetime-30m@geo.iproyal.com:12321" -s https://api.ipify.org?format=json
echo.
