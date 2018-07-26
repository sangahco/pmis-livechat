FROM keymetrics/pm2:8-alpine
LABEL author="Emanuele Disco <emanuele.disco@gmail.com>"

ENV SERVER_HOST="0.0.0.0" \
    SERVER_PORT=3000 \
    SERVER_NAME="PMIS"

COPY . /usr/share/livechat/
WORKDIR /usr/share/livechat/

RUN set -ex && \
    apk add --no-cache --virtual \
      nodejs git && \
    npm install -g pm2 && \
    npm install -g bower-installer && \
    npm install && \
    rm -rf bower_components

EXPOSE 3000 9615

CMD ["pm2-runtime", "app.js", "--web", "9615"]