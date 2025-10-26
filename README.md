# ­ƒÜÇ Getting started with Strapi

Strapi comes with a full featured [Command Line Interface](https://docs.strapi.io/dev-docs/cli) (CLI) which lets you scaffold and manage your project in seconds.

### `develop`

Start your Strapi application with autoReload enabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-develop)

```
npm run develop
# or
yarn developda
```

### `start`

Start your Strapi application with autoReload disabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-start)

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

## ÔÜÖ´©Å Deployment

Strapi gives you many possible deployment options for your project including [Strapi Cloud](https://cloud.strapi.io). Browse the [deployment section of the documentation](https://docs.strapi.io/dev-docs/deployment) to find the best solution for your use case.

```
yarn strapi deploy
```

## ­ƒôÜ Learn more

- [Resource center](https://strapi.io/resource-center) - Strapi resource center.
- [Strapi documentation](https://docs.strapi.io) - Official Strapi documentation.
- [Strapi tutorials](https://strapi.io/tutorials) - List of tutorials made by the core team and the community.
- [Strapi blog](https://strapi.io/blog) - Official Strapi blog containing articles made by the Strapi team and the community.
- [Changelog](https://strapi.io/changelog) - Find out about the Strapi product updates, new features and general improvements.

Feel free to check out the [Strapi GitHub repository](https://github.com/strapi/strapi). Your feedback and contributions are welcome!

## SEO & Open Graph

- Set `PUBLIC_SITE_URL`, `SEO_PAGE_BASE_PATH`, `SEO_ARTICLE_BASE_PATH` and `SEO_EVENT_BASE_PATH` in your `.env` so canonical URLs and OG links can be generated automatically. Defaults fall back to development URLs only.
- The shared `SEO Suite` component (pages, news/articles and events) exposes meta basics, sitemap hints, OG/Twitter overrides, per-network social payloads and optional AI assist data for future-proof optimization.
- Detail endpoints (`/api/pages/by-slug`, `/api/articles/by-slug`, `/api/events/by-slug`) attach a computed `seoMeta` block with normalized meta/open graph/twitter data plus JSON-LD so the frontend can render tags without extra transforms.
- Provide optional JSON-LD overrides or additional meta tags through the `structuredData` and `extraMeta` fields whenever you need to go beyond the auto-generated payload.

### AI SEO Automation

1. Add the following variables to `.env` (see `.env.example`): `OPENAI_API_KEY`, `OPENAI_SEO_ENABLED`, `OPENAI_SEO_MODEL`, `OPENAI_SEO_TONE`, `OPENAI_SEO_AUDIENCE`, `OPENAI_SEO_TEMPERATURE`, optionally `OPENAI_SEO_PROVIDER` and `OPENAI_SEO_ENDPOINT`.
2. Configure `PUBLIC_SITE_URL` + the `SEO_*_BASE_PATH` values so canonical/OG URLs can be derived from each slug.
3. Publish (or re-publish) any Page, Article or Event. Strapi now hooks into the lifecycle, sends the entry content to OpenAI and writes every SEO field (except image uploads) back into the `SEO Suite` component together with an `aiAssistant` audit trail.
4. Existing `shareImage` or `metaSocial` images stay untouched; only text fields, enums, sitemap hints and structured data are refreshed.
5. Disable the automation anytime by setting `OPENAI_SEO_ENABLED=false` (or simply omitting `OPENAI_API_KEY`).

The automation uses the Chat Completions endpoint with `response_format: json_object`, enforces German output, and stores the original prompt + generated keywords so you can inspect or regenerate meta data later on.

## Ô£¿ Community

- [Discord](https://discord.strapi.io) - Come chat with the Strapi community including the core team.
- [Forum](https://forum.strapi.io/) - Place to discuss, ask questions and find answers, show your Strapi project and get feedback or just talk with other Community members.
- [Awesome Strapi](https://github.com/strapi/awesome-strapi) - A curated list of awesome things related to Strapi.

---

<sub>­ƒñ½ Psst! [Strapi is hiring](https://strapi.io/careers).</sub>
