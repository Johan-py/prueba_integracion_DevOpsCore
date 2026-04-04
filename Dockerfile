FROM oven/bun:latest

WORKDIR /app

COPY backend/ .

RUN bun install

RUN bunx prisma generate

EXPOSE 3000

CMD ["bun", "src/index.ts"]