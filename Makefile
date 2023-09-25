all: compile start

compile:
	rinha files/source.rinha > files/source.rinha.json

start: files/source.rinha.json
	node index.mjs files/source.rinha.json

dev: compile files/source.rinha.json
	LOGS="ON" node --watch index.mjs files/source.rinha.json

docker:
	docker build -t rinha .
	docker run rinha
