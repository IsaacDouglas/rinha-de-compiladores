all:
	rinha files/source.rinha > files/source.rinha.json

start: files/source.rinha.json
	node index.js files/source.rinha.json

dev: files/source.rinha.json
	LOGS="ON" node --watch index.js files/source.rinha.json

docker:
	docker build -t rinha .
	docker run rinha