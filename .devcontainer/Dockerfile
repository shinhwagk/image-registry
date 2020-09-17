FROM y8kuj5cc.mirror.aliyuncs.com/library/node:14

RUN npm config set registry https://registry.npm.taobao.org

RUN npm i -g pm2 ts-node
RUN pm2 install typescript

# RUN alias ll="ls -l"

# pm2 start src/main.ts --watch 
# pm2 logs 0