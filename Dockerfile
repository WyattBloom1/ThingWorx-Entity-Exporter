FROM node:24.6.0-alpine as build
WORKDIR /app/client
COPY ./client/package.json ./
COPY ./client/package-lock.json ./
RUN npm ci
COPY ./client ./
RUN npm run build


FROM python:3.12.12-alpine3.22
WORKDIR /app

COPY ./api/requirements.txt /app
RUN pip install -r requirements.txt

COPY ./api ./
COPY --from=build /app/client/dist/ ./static/
CMD python3 main.py