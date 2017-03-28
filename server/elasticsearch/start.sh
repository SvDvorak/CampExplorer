printf "Starting elasticsearch\n"
./wait-for-it.sh localhost:9200 --timeout=60 --strict -- ./initial-index.sh &
elasticsearch