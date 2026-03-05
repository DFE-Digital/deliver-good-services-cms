# 🚀 Getting started with Strapi

Strapi comes with a full featured [Command Line Interface](https://docs.strapi.io/dev-docs/cli) (CLI) which lets you scaffold and manage your project in seconds.

### Environment switching

The app uses separate env files so you can switch environments from the terminal:

| Command | Env file | Use case |
|---------|----------|----------|
| `npm run local` | `.env` | Local Strapi + local PG (e.g. port 1300) |
| `npm run dev` | `.env.development` | Dev Strapi + remote PG (e.g. port 1337) |
| `npm run dev:test` | `.env.test` | Develop mode with test config (e.g. DB: `digital_manual_test`, port 1338) |
| `npm run develop:prod` | `.env.production` | Develop mode with production config |
| `npm run start` | `.env` | Start server (default env) |
| `npm run start:dev` | `.env.development` | Start server with dev config |
| `npm run start:test` | `.env.test` | Start server with test config |
| `npm run start:prod` | `.env.production` | Start server with production config |

**Env files:** Copy `.env.example` to `.env`, `.env.development`, `.env.test`, and `.env.production` as needed. Fill in secrets and DB settings; use `.env.production` for production deployments.

### Promoting data (Test → Production)

Test and Production use the same content types; you can promote data from Test into Production in two ways.

#### Option 1: Transfer (both instances must match schemas)

Streams data from Test to a **running** Production instance. Production must be running and have a [Transfer Token](https://docs.strapi.io/cms/features/data-management#admin-panel-settings) (Settings → Transfer Tokens in the Production admin).

1. Start Production: `npm run start:prod` (or your production server).
2. Create a Transfer Token in the Production admin and copy it.
3. From the project root (Test DB must be reachable):

   ```bash
   PRODUCTION_ADMIN_URL=https://your-production-url/admin PRODUCTION_TRANSFER_TOKEN=your-token npm run promote:transfer
   ```

4. Confirm the prompt (this **replaces** all data and assets on Production with Test data).

Use `--force` to skip the prompt (e.g. in CI): add `--force` to the script or run the `strapi transfer` command manually with `--force`.

#### Option 2: Export from Test, then import into Production

Use when you can’t run both at once or want a file backup.

1. **Export** from Test (uses `.env.test`; Test DB must be reachable):

   ```bash
   npm run export:test
   ```

   Creates `export-test.tar.gz.enc` in the project root (encrypted). You can pass a key with `-k` or set one in the script.

2. **Import** into Production (uses `.env.production`; **replaces** all Production data):

   ```bash
   npm run import:prod -- -f ./export-test.tar.gz.enc
   ```

   If the file is encrypted, pass the key: `npm run import:prod -- -f ./export-test.tar.gz.enc -k your-encryption-key`.

**Notes:** Admin users and API tokens are not transferred/exported. Target and source schemas must match. Import and transfer **delete** existing content and assets on the destination before applying the new data.

#### Local → Dev

Push data from **Local** (port 1300, local PostgreSQL) into **Dev** (port 1337, remote PostgreSQL):

- **Local**: `npm run local` → http://localhost:1300/admin, uses `.env` (local PG).
- **Dev**: `npm run dev` → http://localhost:1337/admin, uses `.env.development` (remote PG).

1. Start **Dev** so it’s running: `npm run dev` (or `npm run start:dev`).
2. In the **Dev** admin (http://localhost:1337/admin), create a Transfer Token: Settings → Transfer Tokens → Create, then copy the token.
3. From the project root (Local DB must be reachable), run:

   ```bash
   DEV_TRANSFER_TOKEN=your-dev-token npm run promote:local-to-dev
   ```

4. Confirm the prompt (this **replaces** all data and assets on Dev with Local data).

To use a different Dev URL: `dotenv -e .env -- strapi transfer --to http://your-dev-host:1337/admin --to-token $DEV_TRANSFER_TOKEN`

### `develop`

Start your Strapi application with autoReload enabled (development env). [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-develop)

```
npm run develop
# or
yarn develop
```

### `start`

Start your Strapi application with autoReload disabled (production env from `.env`). [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-start)

```
npm run start
# or
yarn start
```

### `build`

Build your admin panel. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-build)

```
npm run build
# or
yarn build
```

## ⚙️ Deployment

Strapi gives you many possible deployment options for your project including [Strapi Cloud](https://cloud.strapi.io). Browse the [deployment section of the documentation](https://docs.strapi.io/dev-docs/deployment) to find the best solution for your use case.

```
yarn strapi deploy
```

## 📚 Learn more

- [Resource center](https://strapi.io/resource-center) - Strapi resource center.
- [Strapi documentation](https://docs.strapi.io) - Official Strapi documentation.
- [Strapi tutorials](https://strapi.io/tutorials) - List of tutorials made by the core team and the community.
- [Strapi blog](https://strapi.io/blog) - Official Strapi blog containing articles made by the Strapi team and the community.
- [Changelog](https://strapi.io/changelog) - Find out about the Strapi product updates, new features and general improvements.

Feel free to check out the [Strapi GitHub repository](https://github.com/strapi/strapi). Your feedback and contributions are welcome!

## ✨ Community

- [Discord](https://discord.strapi.io) - Come chat with the Strapi community including the core team.
- [Forum](https://forum.strapi.io/) - Place to discuss, ask questions and find answers, show your Strapi project and get feedback or just talk with other Community members.
- [Awesome Strapi](https://github.com/strapi/awesome-strapi) - A curated list of awesome things related to Strapi.

---

<sub>🤫 Psst! [Strapi is hiring](https://strapi.io/careers).</sub>
