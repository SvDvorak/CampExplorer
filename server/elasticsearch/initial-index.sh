indexStatus=$(curl -s -o /dev/null -w "%{http_code}" localhost:9200/tagsearch)

if [ "$indexStatus" != "200" ]; then
    
    printf "Creating initial index\n"
    curl -XPUT localhost:9200/tagsearch/ -s -o /dev/null -d '{
        "mappings" : {
            "albums" : {
                "properties" : {
                    "tags" : { "type": "string", "index" : "not_analyzed" }
                }
            }
        }
    }
    '

fi

printf "Ran index setup\n"