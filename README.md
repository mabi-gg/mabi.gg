## Dev environment setup

### Install the following

Node.js: https://nodejs.org/en/download

VSCode: https://code.visualstudio.com/

### Install pnpm

With Node.js installed, open a terminal and install [pnpm](https://pnpm.io/)

`npm i -g pnpm`

### Install workspace dependencies

Open the workspace folder in vscode, install the recommended extensions, and run this command in the integrated terminal ```(Control+`)```
`pnpm install`

### Run the dev server

Switch to the webapp directory `cd apps/web` and run the dev server with this command:

`pnpm dev`

**Alternatively**m If you have not set up the local database, there will be no data in the server. You can run a variant of the dev server that proxies api calls to the deployed service by running this command instead: `pnpm dev-proxy`

Keep in mind that if you proxy to the deployed service, you will not be able to log in.
