develop: clean
	npm start

clean:
	npm run clean

build: clean
	env GATSBY_EXPERIMENTAL_QUERY_CONCURRENCY=10 npm run build

deploy: build
	npm run deploy -- -y

wrangler: build
	npm run wrangler-deploy
