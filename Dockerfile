# build ui
FROM node:latest as ui-builder
COPY ./ui /ui
WORKDIR /ui
RUN yarn && \
    yarn build && \
    find . -name "*.map" -type f -delete

# build backend
FROM node:latest as server-builder
COPY ./server /server
WORKDIR /server
RUN yarn

# build unified container
FROM node:latest
COPY --from=server-builder /server /opt/server
COPY --from=ui-builder /ui/build /opt/server/static

ENV CONFIG_DIRECTORY=/config

WORKDIR /opt/server
ENTRYPOINT [ "node", "main.js" ]
EXPOSE 4200
VOLUME [ "/config" ]
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD [ "curl", "--fail", "http://localhost:4200/api/v1/healthcheck" ]
