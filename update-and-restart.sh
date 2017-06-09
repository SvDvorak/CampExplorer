docker-compose down
git pull
docker-compose build
docker-compose -f docker-compose.prod.yml up -d