@echo off
call .venv\Scripts\activate.bat
set PYTHONPATH=%CD%
echo Starting Macro Intelligence Platform...
streamlit run src\ui\app.py
