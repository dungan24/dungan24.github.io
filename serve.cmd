@echo off
title Market Pulse - Hugo Dev Server
echo.
echo  Market Pulse - Local Dev Server
echo  http://localhost:1314
echo  Ctrl+C to stop
echo.
hugo server --port 1314 --bind 0.0.0.0 --navigateToChanged
