FROM keymetrics/pm2:8-alpine
LABEL author="Emanuele Disco <emanuele.disco@gmail.com>"

ENV SERVER_HOST="0.0.0.0" \
    SERVER_PORT=3000 \
    SERVER_NAME="PMIS"

COPY . /usr/share/livechat/
WORKDIR /usr/share/livechat/

RUN set -ex && \
    apk add --no-cache --virtual \
      nodejs && \
    npm install && \
    npm install -g pm2 && \
    npm installer -g bower-installer

EXPOSE 3000 9615

CMD ["pm2-runtime", "livechat.js", "--web", "9615"]