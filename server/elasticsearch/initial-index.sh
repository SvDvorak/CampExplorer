indexStatus=$(curl -s -o /dev/null -w "%{http_code}" localhost:9200/tagsearch)

if [ "$indexStatus" != "200" ]; then
    
    printf "Creating initial index\n"
    curl -XPUT localhost:9200/tagsearch/ -s -d '{
        "mappings" : {
            "albums" : {
                "properties" : {
                    "tags" : { "type": "keyword", "index" : "not_analyzed" }
                }
            },
            "tags" : {
                "properties" : {
                    "lastUpdated" : { "type":"date", "format": "basic_date_time_no_millis" }
                }
            }
        }
    }
    '
fi

printf "Ran index setup\n"