echo "[DEV] starting development enviornment..."

echo "[backend] starting..."
cd ./packages/backend/
npm run dev &

echo "[frontend] starting expo..."
cd ../frontend/
DEV=true expo start ${@:1} &

wait