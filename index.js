import fs from "fs";
import { SitemapStream, streamToPromise } from "sitemap";
import { Readable } from "stream";

const sitemap = (options) => {
	let config;
	const { outputManifest, mapping, slug } = options;
	let sitemapString = "";
	return {
		name: "astro-sitemap-ssr",
		hooks: {
			"astro:config:done": async ({ config: cfg }) => {
				config = cfg;
			},
			"astro:build:ssr": async ({ manifest }) => {
				if (outputManifest) {
					fs.writeFileSync("manifest.json", JSON.stringify(manifest));
				}
				const list = [];
				for (const route of manifest.routes) {
					if (route.routeData.type === "page") {
						list.push(route.routeData.route);
					}
				}
				//remove routes in list that are in mapping keys
				const routes = list.filter((route) => {
					return !Object.keys(mapping).includes(route);
				});

				//for key/value pairs in mapping
				for (const [key, value] of Object.entries(mapping)) {
					//search manifest.entryModules (an object) for all keys that CONTAIN the value
					const entry = Object.keys(manifest.entryModules).filter(
						(entry) => {
							return entry.includes(value);
						}
					);

					//for each entry found identify the file name by splitting on value
					//then splitting on / and taking the last item
					//then splitting on .md or .mdx and taking the first item
					const slugs = entry.map((entry) => {
						return entry
							.split(value)[1]
							.split("/")[1]
							.split(".")[0];
					});

					//for each slug found replace the slug in the key with the slug
					//then add the new route to the routes array
					slugs.forEach((s) => {
						const route = key.replace(slug, s);
						routes.push(route);
					});
				}

				//remove duplicates
				const uniqueRoutes = [...new Set(routes)];
				//create const links as [{url: uniqueRoute, changefreq: "weekly", priority: 0.7}]
				const links = uniqueRoutes.map((uniqueRoute) => {
					return {
						url: uniqueRoute,
						changefreq: "weekly",
						priority: 0.7,
					};
				});
				//create const sitemap as new SitemapStream
				const sitemap = new SitemapStream({
					hostname: config.site,
				});
				//create const readable as new Readable
				const sitemapXML = await streamToPromise(
					Readable.from(links).pipe(sitemap)
				);
				sitemapString = sitemapXML.toString();
			},
			"astro:build:done": async ({ dir }) => {
				const path = dir.pathname;
				//write sitemapString to sitemap.xml
				fs.writeFileSync(`${path}sitemap-index.xml`, sitemapString);
			},
		},
	};
};

export default sitemap;