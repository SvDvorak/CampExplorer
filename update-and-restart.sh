docker-compose down
git pull
bash server_configuration.sh
docker-compose build
docker-compose -f docker-compose.prod.yml up -d