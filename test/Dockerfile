FROM node:14.15.4-buster

ARG TINI_VERSION=v0.19.0
RUN apt update \
	&& apt install vim git bash -y \
    #&& apt install mongodb-clients -y \
    && apt install tini curl -y

# MONGO INSTALL
# https://docs.mongodb.com/manual/tutorial/install-mongodb-on-debian/
RUN wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | apt-key add -
RUN echo "deb http://repo.mongodb.org/apt/debian buster/mongodb-org/4.4 main" | tee /etc/apt/sources.list.d/mongodb-org-4.4.list
RUN apt-get update \
    && apt-get install -y mongodb-org

RUN npm install -g typescript artillery artillery-plugin-expect

EXPOSE 3000

WORKDIR /home/node/ecos-backend

COPY ./bin/clear-db.sh /bin/clear-db
RUN chmod a+x /bin/clear-db

ENTRYPOINT ["/usr/bin/tini", "--"]
