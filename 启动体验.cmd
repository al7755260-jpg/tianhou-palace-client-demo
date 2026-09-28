@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
title 天后宫 - 客户体验
if not exist "runtime\node.exe" (
  echo 请先完整解压体验包，再启动。
  pause
  exit /b 1
)
"runtime\node.exe" "preview.mjs"
if errorlevel 1 pause
