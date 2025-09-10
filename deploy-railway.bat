@echo off
echo Preparing for Railway deployment...

echo Installing dependencies...
cd tasket-backend
npm install
cd ../tasket
npm install

echo Building frontend...
npm run build

cd ..

echo Deployment preparation complete!
echo.
echo To deploy to Railway:
echo 1. Install the Railway CLI: npm install -g @railway/cli
echo 2. Login to Railway: railway login
echo 3. Initialize a new project: railway init
echo 4. Add a PostgreSQL database: railway add
echo 5. Set environment variables:
echo    railway env set NODE_ENV=production
echo    railway env set JWT_SECRET=your-super-secret-jwt-key-here
echo 6. Deploy: railway up
echo.
echo After deployment, update the FRONTEND_URL environment variable with your Railway app URL.