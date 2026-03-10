FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=studyquest-pnpm-store,target=/pnpm/store pnpm install --frozen-lockfile
RUN cd apps/api && npx prisma generate
RUN pnpm run build --filter api

FROM base
COPY --from=build /usr/src/app /usr/src/app
WORKDIR /usr/src/app/apps/api
EXPOSE 3001
CMD [ "pnpm", "start:prod" ]
