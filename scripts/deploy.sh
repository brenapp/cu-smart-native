echo "Building image..."
docker build -t bmmcgui/cu-smart:1.0 .
docker push bmmcgui/cu-smart:1.0

echo "Deploying to FMO14..."
ssh fmo14 "docker pull bmmcgui/cu-smart:1.0 && 
           docker kill $(docker ps --filter="publish=3000" --format "{{.Names}}") && 
           docker run -p 3000:3000 -d -v /data --restart always bmmcgui/cu-smart:1.0"