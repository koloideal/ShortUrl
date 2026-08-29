# justfile
set shell := ["powershell.exe", "-c"]

# Таска для запуска сервера
run:
    uvicorn main:app --interface wsgi
