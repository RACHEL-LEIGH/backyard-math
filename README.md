# BackyardMath
Plan outdoor projects without guessing. Use simple calculators to estimate mulch, gravel, soil, pavers, concrete, retaining walls, and fire pit materials before you buy.

## Development

The site is built with [Eleventy](https://www.11ty.dev/). Page source lives in `src/`; `npm run build` generates the static site into `_site/` (not committed).

```
npm install
npm run serve   # local dev server with live reload at http://localhost:8080
npm run build   # one-off production build into _site/
```

- `src/_data/calculators.js` is the single source of truth for every calculator's title, description, and category — used to render the homepage grid and each calculator's "related calculators" cards.
- `src/_includes/base.njk` is the shared page shell (head, header, footer). `src/_includes/calculator.njk` is the shared calculator-page layout (hero, form, FAQ, rating box, related tools).
- Each calculator's unique form fields, FAQ content, and related-tools links live in its own front matter in `src/calculators/*.njk`.
- `src/js/calculators.js` holds all calculator logic, wired through one `bindCalculator()` helper per tool.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the site and publishes it via GitHub Pages Actions deployment. In this repo's **Settings → Pages**, the source must be set to **GitHub Actions** (not "Deploy from a branch") for this to take effect.
