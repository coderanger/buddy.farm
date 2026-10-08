develop: clean
	npm start

clean:
	npm run clean

build: clean
	#env GATSBY_EXPERIMENTAL_QUERY_CONCURRENCY=10 npm run build
	env NODE_FETCH_RETRY_SOCKET_TIMEOUT=60000 NODE_FETCH_RETRY_FORCE_TIMEOUT=true GATSBY_CPU_COUNT=1 npm run build

deploy: build
	npm run deploy -- -y

wrangler: build
	npm run wrangler-deploy -- --project-name=buddy-farm --branch=main

watchci:
	gh run watch "$$(gh run list --json databaseId --jq ".[0].databaseId")"
