all: compile start

compile:
	rinha var/rinha/source.rinha > var/rinha/source.rinha.json

start: compile var/rinha/source.rinha.json
	node index.mjs var/rinha/source.rinha.json

dev: compile var/rinha/source.rinha.json
	node --watch index.mjs var/rinha/source.rinha.json

docker: compile var/rinha/source.rinha.json
	docker build -t rinha .
	docker run rinha
