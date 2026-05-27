#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT_DIR = process.cwd();
const ROUTES_DIR = path.join(ROOT_DIR, "src", "routes");

const routes = [
  {
    name: "home",
    route: "/",
    file: "index.tsx",
  },
  {
    name: "login",
    route: "/login",
    file: "index.tsx",
  },
  {
    name: "register",
    route: "/register",
    file: "index.tsx",
  },
  {
    name: "dashboard",
    route: "/dashboard",
    file: "index.tsx",
  },
  {
    name: "profile",
    route: "/profile",
    file: "index.tsx",
  },
  {
    name: "search",
    route: "/search",
    file: "index.tsx",
    message: "Feature ainda não implementada.",
  },
  {
    name: "promotions",
    route: "/promotions",
    file: "index.tsx",
    message: "Feature ainda não implementada.",
  },
  {
    name: "accessibility",
    route: "/accessibility",
    file: "index.tsx",
    message: "Feature ainda não implementada.",
  },
];

function main() {
  ensureDirectory(ROUTES_DIR);

  routes.forEach(generateRoute);

  console.log("\n✅ Rotas geradas com sucesso.\n");
}

function generateRoute(routeConfig) {
  const routeDir = resolveRouteDirectory(routeConfig.route);

  ensureDirectory(routeDir);

  const pageContent = createRouteComponent(routeConfig);

  writeFile(path.join(routeDir, routeConfig.file), pageContent);

  console.log(`✅ Rota criada: ${routeConfig.route}`);
}

function resolveRouteDirectory(routePath) {
  if (routePath === "/") {
    return ROUTES_DIR;
  }

  const cleanPath = routePath.replace(/^\//, "");

  return path.join(ROUTES_DIR, cleanPath);
}

function createRouteComponent(routeConfig) {
  const title = capitalize(routeConfig.name);

  const description = routeConfig.message
    ? routeConfig.message
    : `${title} page.`;

  return `import { component$ } from "@builder.io/qwik";
import { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <section>
      <h1>${title}</h1>
      <p>${description}</p>
    </section>
  );
});

export const head: DocumentHead = {
  title: "${title}",
  meta: [
    {
      name: "description",
      content: "${description}",
    },
  ],
};
`;
}

function ensureDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, "utf-8");
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

main();
