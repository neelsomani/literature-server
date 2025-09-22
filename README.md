# literature-server
![Travis CI](https://travis-ci.org/neelsomani/literature-server.svg?branch=master)

A server to play the card game Literature: https://en.wikipedia.org/wiki/Literature_(card_game)

Literature card game engine: https://github.com/neelsomani/literature

## Dependencies

python3, npm (Node 16.x recommended)

## Setup

1. `pip install -r requirements.txt`
2. `npm install --omit=optional`

## Running Locally

1. `npm run build`
2. `gunicorn -k gevent --bind 0.0.0.0:8000 app:app`

The application will be running at http://localhost:8000. Adjust the `--bind`
value to change the host or port.

> **Note:** The React toolchain is pinned to Webpack 4, which requires Node 16
> for a trouble-free build. If you are using `nvm`, run `nvm install 16` and
> `nvm use 16` before `npm run build`. Alternatively set
> `NODE_OPTIONS=--openssl-legacy-provider` when building with newer Node
> versions.

## Deploying on Render

This repository includes a `render.yaml` blueprint that provisions a Python web
service. To deploy:

1. Commit your changes and push them to GitHub (or another Git provider).
2. In the Render dashboard, create a new Blueprint and point it at the repo.
3. Render will run the `buildCommand` (installs Python and Node dependencies and
   builds the frontend) and start the app with Gunicorn.

The `PYTHON_VERSION` environment variable in `render.yaml` pins the service to
Python 3.12.3 and `NODE_VERSION` ensures a Node 16 runtime for Webpack 4. The
start command runs Gunicorn with the gevent worker to support WebSocket
traffic. Adjust the plan name or environment variables in the blueprint as
needed for your account.

## Architecture
![Literature server architecture](https://i.imgur.com/QwAif2T.jpg)

## User Interface

<img width="1243" alt="Literature game user interface" src="https://user-images.githubusercontent.com/7029855/149852615-24b15614-dd61-4ec3-9b83-7039fc111fad.png">
