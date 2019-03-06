docker-compose -f docker-compose.prod.yml down
git pull
bash server_configuration.sh
docker-compose -f docker-compose.prod.yml up -d --build