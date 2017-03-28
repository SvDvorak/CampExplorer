echo "index setup"
echo "what what!"

# Create index if it doesn't exist
./wait-for-it.sh localhost:9200 --timeout=60 --strict -- ./initial-index.sh &
elasticsearch