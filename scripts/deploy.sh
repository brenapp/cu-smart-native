echo "Building image..."
docker build -t cu-smart:1.0 .

echo "Deploying to FMO14..."
docker -H "ssh://fmo14" run --rm --net host cu-smart:1.0 fmo14 -f