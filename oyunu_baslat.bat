@echo off
chcp 65001 >nul
title Civciv Runner - Oyun Baslatici
echo ========================================================
echo          CIVCIV RUNNER - GDG ON CAMPUS AIBU
echo ========================================================
echo.
echo Oyun baslatiliyor, lutfen bekleyin...
echo.

:: 1. Python kontrolu
where python >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] Python bulundu, yerel sunucu aciliyor...
    start "" http://localhost:8000
    python -m http.server 8000
    goto :end
)

:: 2. Node.js kontrolu
where node >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] Node.js bulundu, yerel sunucu aciliyor...
    start "" http://localhost:8000
    node -e "const http=require('http'),fs=require('fs'),path=require('path');const m={'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.json':'application/json','.wav':'audio/wav'};http.createServer((q,s)=>{let f=path.join('.',q.url==='/'?'index.html':q.url.split('?')[0]);fs.readFile(f,(e,d)=>{if(e){s.writeHead(404);s.end('Not Found');}else{s.writeHead(200,{'Content-Type':m[path.extname(f)]||'text/plain'});s.end(d);}});}).listen(8000,()=>console.log('Sunucu acik: http://localhost:8000'));"
    goto :end
)

:: 3. Windows PowerShell Dahili Sunucu (Hicbir ek yukleme gerektirmez)
where powershell >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] Windows yerel servisi baslatiliyor...
    start "" http://localhost:8000
    powershell -NoProfile -ExecutionPolicy Bypass -Command "$s=New-Object Net.HttpListener;$s.Prefixes.Add('http://localhost:8000/');$s.Start();Write-Host 'Sunucu acik: http://localhost:8000 (Durdurmak icin pencereyi kapatin)';while($s.IsListening){$c=$s.GetContext();$p=$c.Request.Url.LocalPath.TrimStart('/');if(!$p){$p='index.html'};$p=[IO.Path]::Combine((Get-Location).Path,$p.Replace('/',[IO.Path]::DirectorySeparatorChar));if([IO.File]::Exists($p)){$e=[IO.Path]::GetExtension($p).ToLower();$t=@{'.html'='text/html; charset=utf-8';'.js'='application/javascript; charset=utf-8';'.css'='text/css';'.png'='image/png';'.wav'='audio/wav';'.json'='application/json'};$c.Response.ContentType=if($t.ContainsKey($e)){$t[$e]}else{'application/octet-stream'};$b=[IO.File]::ReadAllBytes($p);$c.Response.OutputStream.Write($b,0,$b.Length)}else{$c.Response.StatusCode=404};$c.Response.Close()}"
    goto :end
)

echo [BILGI] Oyunu tarayicida oynamak icin klasoru VS Code 'Live Server' ile acabilir
echo veya Python / Node.js yukleyebilirsiniz.
echo.
pause

:end
