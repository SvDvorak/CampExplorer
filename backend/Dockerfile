FROM node:10.22.0

RUN useradd --user-group --create-home --shell /bin/false app

ENV HOME=/home/app

COPY package.json package-lock.json $HOME/campexplorer/
RUN chown -R app:app $HOME/*

USER app
WORKDIR $HOME/campexplorer
RUN npm install

USER root
COPY . $HOME/campexplorer
RUN find . \( -path ./node_modules \) -prune -o -user root -print0 | xargs -0 chown app:app
USER app