@echo off
echo ========================================
echo OpenAI Assistant Integration Setup
echo ========================================
echo.

cd backend

echo [1/3] Upgrading OpenAI package...
pip install --upgrade openai

echo.
echo [2/3] Installing other dependencies...
pip install -r requirements.txt

echo.
echo [3/3] Running database migration...
python -c "from database.schema import update_database_schema; update_database_schema(); print('Database migration completed!')"

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Verify .env file has OPENAI_API_KEY and OPENAI_ASSISTANT_ID
echo 2. Restart the backend server
echo 3. Test with: python test_openai_integration.py
echo.
pause
