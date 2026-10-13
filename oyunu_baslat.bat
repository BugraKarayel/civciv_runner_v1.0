@echo off
chcp 65001 >nul
title Civciv Runner - Oyun Baslatici
echo ========================================================
echo          CİVCİV RUNNER - GDG ON CAMPUS AİBÜ
echo ========================================================
echo.
echo Oyun baslatiliyor, lutfen bekleyin...
echo.

:: Python kontrolu
where python >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] Python bulundu, yerel sunucu aciliyor...
    start "" http://localhost:8000
    python -m http.server 8000
    goto :end
)

:: Node.js kontrolu
where node >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] Node.js bulundu, yerel sunucu aciliyor...
    start "" http://localhost:8000
    node -e "const http=require('http'),fs=require('fs'),path=require('path');const m={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.json':'application/json'};http.createServer((q,s)=>{let f=path.join('.',q.url==='/'?'index.html':q.url);fs.readFile(f,(e,d)=>{if(e){s.writeHead(404);s.end('Not Found');}else{s.writeHead(200,{'Content-Type':m[path.extname(f)]||'text/plain'});s.end(d);}});}).listen(8000,()=>console.log('Sunucu acik: http://localhost:8000'));"
    goto :end
)

echo [HATA] Bilgisayarinizda Python veya Node.js bulunamadi!
echo Oyunu oynamak icin lutfen VS Code 'Live Server' eklentisiyle acin
echo veya Python / Node.js yukleyin.
echo.
pause

:end
