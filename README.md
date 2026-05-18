# Winds & Echoes Theme

Custom Ghost theme for [Winds & Echoes](https://windsandechoes.com) — an adventure travel blog.

## Design

- **Typography:** Playfair Display (headings) + DM Sans (body)
- **Palette:** Forest greens, sandstone, off-whites
- **Style:** Editorial, photo-forward, full-bleed hero images
- **Dark mode:** Supported via OS preference + manual toggle

## Structure

```
winds-and-echoes-theme/
├── default.hbs          # Root layout
├── index.hbs            # Homepage
├── post.hbs             # Single post
├── page.hbs             # Static pages
├── tag.hbs              # Tag archive
├── error.hbs            # 404 / error
├── theme.config.json    # Ghost theme config
├── package.json
├── partials/
│   ├── header.hbs       # Site header (sticky, mobile nav, dark toggle)
│   ├── footer.hbs       # Site footer
│   ├── post-card.hbs    # Reusable post card for grids
│   └── post-meta.hbs    # Author, date, reading time
├── assets/
│   ├── css/
│   │   └── screen.css   # All theme styles
│   ├── js/
│   │   └── main.js      # Dark mode, mobile menu, scroll effects
│   └── images/          # favicon.png, apple-touch-icon.png
└── scripts/
    └── deploy-hook.sh   # Server git push hook
```

## Local development

Requires Ghost running locally.

```bash
npm install
npm run dev    # starts ghost dev with live reload
npm run lint   # validate theme with gscan
```

## Deployment

Push to the production remote to auto-deploy via git hook:

```bash
# First time setup — add production remote
git remote add production skghost@159.65.100.97:/var/repo/winds-and-echoes-theme.git

# Deploy
git push production main
```

See `scripts/deploy-hook.sh` for server setup instructions.

## Ghost custom settings

Available in Ghost admin → Design → Customize:

| Setting | Options | Default |
|---------|---------|---------|
| Site header style | Logo and name / Logo only / Name only | Logo and name |
| Show reading time | On / Off | On |
| Show post tags | On / Off | On |
