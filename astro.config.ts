import markdoc from "@astrojs/markdoc";
import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import keystatic from "@keystatic/astro";
import { createReader } from "@keystatic/core/reader";
import { defineConfig } from "astro/config";
import keystaticConfig from "./keystatic.config";
import vercel from "@astrojs/vercel/serverless";
const reader = createReader(process.cwd(), keystaticConfig);

// Get collections to pass to the starlight plugin
const sideBarConfig = await Promise.all(Object.keys(reader.collections).map(async collection => {
  const config = Object.entries(reader.config.collections).find(entry => entry[0] === collection);
  const col = Object.entries(reader.collections).find(entry => entry[0] === collection);
  if (!config || !col) throw new Error(`Collection ${collection} not found in keystatic.config.ts`);
  const allContent = await col[1].all();
  const subcategories = config[1].schema.subcategory.options.map(category => {
    const contentOfThisCategory = allContent.filter(item => item.entry.subcategory === category.value);
    return {
      label: category.label,
      items: contentOfThisCategory.map(item => ({
        label: item.entry.title,
        slug: `${config[0]}/${item.slug}`
      }))
    };
  }).filter(category => category.items.length > 0 && category.label !== "None");
  
  const allContentWithoutSubcategory = allContent.filter(item => item.entry.subcategory === "none");
  return {
    label: config[1].label,
    items: [...subcategories, ...allContentWithoutSubcategory.map(item => ({
      label: item.entry.title,
      slug: `${config[0]}/${item.slug}`
    }))]
  };
}));

const collections = reader.collections;


// https://astro.build/config
export default defineConfig({
  integrations: [starlight({
    social: {
      github: "https://github.com/limegorilla/starlight-starter-with-keystatic"
    },
    title: "Starlight Starter with Keystatic",
    sidebar: sideBarConfig,
    editLink: {
      baseUrl: "https://github.com/limegorilla/starlight-starter-with-keystatic/edit/main/"
    }
  }), react(), markdoc(), keystatic()],
  output: "hybrid",
  adapter: vercel()
});
