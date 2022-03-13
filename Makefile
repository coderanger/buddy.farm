develop: clean
	npm start

clean:
	npm run clean

build:
	npm run build

deploy: build
	npm run deploy -- -y
