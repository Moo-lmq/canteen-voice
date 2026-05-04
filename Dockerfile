# Stage 1: 构建前端
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
# 使用 npm ci 确保构建环境的稳定性
RUN npm install
COPY . .
RUN npm run build

# Stage 2: 运行后端服务
FROM node:22-alpine
WORKDIR /app

# 生产环境只需要运行时依赖
COPY package*.json ./
RUN npm install --production

# 从构建阶段拷贝前端产物
COPY --from=build /app/dist ./dist
# 拷贝后端代码
COPY server ./server

# 环境与变量配置
ENV NODE_ENV=production
ENV PORT=3001
ENV SQLITE_FILE=/app/data/canteen.db

# 准备数据持久化目录
RUN mkdir -p /app/data

EXPOSE 3001
CMD ["node", "server/index.js"]
