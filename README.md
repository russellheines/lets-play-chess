# lets-play-chess

Welcome to my game of chess! You can try playing at https://lets-play-chess-6tl7g2wh6a-uc.a.run.app.

## Run locally

```
% cd backend
% npm install
% npm start
```

```
% cd frontend
% npm install
% npm start
```

NOTE: Requires environment variables GOOGLE_CLOUD_PROJECT, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET.

## Build for deployment

```
% cd frontend
% npm run build
% cp -R build ../backend
```

## Run locally in Docker

```
% docker build . -t test/chess
% docker run -v ~/.config:/root/.config -p 8080:8080 -e PORT=8080 -e GOOGLE_CLOUD_PROJECT=? -e GOOGLE_CLIENT_ID=? -e GOOGLE_CLIENT_SECRET=? -d test/chess
```

## Deploy to Google Cloud Run

```
% gcloud run deploy
```

## Links

UI:

* https://react.dev/
* https://create-react-app.dev/
* https://getbootstrap.com/
* https://blog.hubspot.com/website/react-bootstrap-css
* https://fontawesome.com/icons/chess?f=classic&s=solid
* https://favicon.io/favicon-converter/

Server:

* https://cloud.google.com/run/docs/tutorials/websockets
* https://cloud.google.com/run/docs/triggering/websockets
* https://socket.io/
* https://nodejs.org/en/docs/guides/nodejs-docker-webapp
