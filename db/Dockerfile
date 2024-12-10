FROM mongo:latest

COPY data-insertion.js /docker-entrypoint-initdb.d/

EXPOSE 27017

CMD ["mongod"]