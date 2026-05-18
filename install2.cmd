@echo off
SET PATH=C:\Program Files\nodejs;%PATH%
cd /d "c:\Users\kakac\OneDrive\Documentos\repos\mini-projeto-equipe5\frontend"
echo Installing phaser...
npm install phaser@^3.60.0
echo Installing fast-check...
npm install --save-dev fast-check@^3.0.0
echo ALL DONE
