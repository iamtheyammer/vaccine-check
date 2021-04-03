FROM node:14 as build
COPY . /app
WORKDIR /app
RUN yarn install
RUN yarn compile

FROM node:14
COPY --from=build /app/dist/index.js /index.js
CMD [ "node", "/index.js" ]
