# Bussi - how to share a VW California with two families...
![das Bild von der Idee](./public/bussi.png
"Bussi Teilung")

many changes in January 2026...  

## Setup

Make sure to install the dependencies:

```bash
# yarn
yarn install

# npm
npm install

# pnpm
pnpm install
```

## Development Server

Start the development server on http://localhost:3000

```bash
npm run dev
```

## Production

Live läuft die App unter https://konfi.kommitment.works:65443/ — das ist der Go-Server
aus dem Nachbar-Repo `../bussi_server`, der den statischen Nuxt-Build per `go:embed`
ausliefert. Es gibt also keinen eigenständigen Frontend-Deploy: ein Frontend-Change geht
nur live, wenn die Go-Binary neu gebaut und deployt wird.

```bash
# im Nachbar-Repo bussi_server
make run_remote   # generate_client + build_linux + deploy
make testremote   # neu starten und prüfen
```

`make run_remote` ruft `yarn generate` in diesem Repo auf und baut den Working Tree ein
— also vorher committen, sonst landen uncommittete Änderungen live.

Der alte GitHub-Pages-Stand unter https://ahojsenn.github.io/bussi ist eingefroren
(Stand 2026-01-10) und wird nicht mehr deployt: seit `4dc8c94` steht `baseURL` wieder
auf `/`, während Pages unter `/bussi/` ausliefert.

Build the application for production:

```bash
yarn generate
```

Locally preview production build:

```bash
npm run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
