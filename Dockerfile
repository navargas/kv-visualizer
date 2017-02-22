FROM node:7.5.0

RUN npm install forever -g
ADD application /application
WORKDIR /application
RUN npm install
EXPOSE 3030
CMD forever index.js
