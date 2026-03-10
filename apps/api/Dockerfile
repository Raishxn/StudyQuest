FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN pnpm install --frozen-lockfile
RUN cd apps/api && npx prisma generate
RUN pnpm run build --filter api
RUN test -f apps/api/dist/src/main.js || (echo "Build failed: dist/src/main.js not found" && exit 1)

FROM base
COPY --from=build /usr/src/app /usr/src/app
WORKDIR /usr/src/app/apps/api
EXPOSE 3001
CMD [ "pnpm", "start:prod" ]
