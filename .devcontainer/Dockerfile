FROM node:14

RUN npm config set registry https://registry.npm.taobao.org
RUN npm i -g webpack webpack-cli typescript ts-node monproc mocha

RUN sed -i 's/deb\.debian\.org/mirrors\.aliyun\.com/' /etc/apt/sources.list && \
    sed -i 's/security\.debian\.org/mirrors\.aliyun\.com/' /etc/apt/sources.list
RUN apt update
RUN apt install -y jq
#     apt update && \
#     curl -fsSL https://download.docker.com/linux/debian/gpg | apt-key add - && \
#     apt-get install -y apt-transport-https ca-certificates curl gnupg-agent software-properties-common && \
#     add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/debian $(lsb_release -cs) stable" && \
#     apt-get update && \
#     apt-get install docker-ce-cli

# RUN npm i -g pm2 ts-node
# RUN pm2 install typescript

# RUN alias ll="ls -l"

# pm2 start src/main.ts --watch 
# pm2 logs 0