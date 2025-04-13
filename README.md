## Dev environment setup

### Install the following

Node.js: https://nodejs.org/en/download
VSCode: https://code.visualstudio.com/

### Install pnpm

`npm i -g pnpm`

### Install workspace dependencies

Open the workspace folder in vscode, install the recommended extensions, and run this command:
`pnpm install`

### Run the dev server

Run the dev server with this command: `pnpm dev`
If you have not set up the local database, configure the dev server to proxy to the deployed service like this: `DEV_PROXY=true pnpm dev`
Keep in mind that if you proxy to the deployed service, you will not be able to log in.
