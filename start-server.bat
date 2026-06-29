@echo off
echo Iniciando o Uiusas System (Servidor Local)...
echo Por favor, mantenha a janela do Node.js aberta enquanto usa o configurador!

:: Inicia o servidor Node.js em uma nova janela
start cmd /k "npm start"

:: Aguarda 2 segundos para dar tempo do servidor subir
timeout /t 2 /nobreak >nul

:: Abre o navegador padrao no localhost
start http://localhost:3000
