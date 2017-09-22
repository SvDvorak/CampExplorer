FROM node:7.5.0

RUN useradd --user-group --create-home --shell /bin/false app

ENV HOME=/home/app

COPY package.json npm-shrinkwrap.json $HOME/campexplorer/
RUN chown -R app:app $HOME/*

USER app
WORKDIR $HOME/campexplorer
RUN npm install

USER root
COPY . $HOME/campexplorer
RUN chown -R app:app $HOME/*
USER app