# Astro SSR sitemap generator

This is a simple sitemap generator for Astro SSR projects. It generates a sitemap.xml file in the root of your project.
Should work for content collections and dynamic routes.

## Installation

```bash
npm install astro-ssr-sitemap
```

## Usage

```js
// astro.config.mjs
import { sitemap } from 'astro-ssr-sitemap';

// https://astro.build/config
export default defineConfig({
	site: "https://[YOURDOMAIN].com",
	integrations: [
		...,
		sitemap({
			outputManifest: false, //This is for debugging purposes, leave it false.
			slug: "[...slug]", //This is the name of your dynamic route(s)
			mapping: { //This maps the dynamic route to a content collection
				"/[...slug]": "/content/main", 
				"/news/[...slug]": "/content/news", 
			},
		}),
		...
	],
    ...
});

```

