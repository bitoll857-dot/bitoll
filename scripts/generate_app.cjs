#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT_DIR = process.cwd();
const SRC_DIR = path.join(ROOT_DIR, "src");
const FEATURES_DIR = path.join(SRC_DIR, "features");

const defaultStructure = {
  components: {},
  services: {},
  stores: {},
  hooks: {},
  utils: {},
};

const featureTemplates = {
  auth: {
    components: {
      "login-form.tsx": createComponent("LoginForm"),
      "register-form.tsx": createComponent("RegisterForm"),
    },
    services: {
      "auth.service.ts": createService("auth"),
    },
    stores: {
      "auth.store.ts": createStore("auth"),
    },
    hooks: {
      "use-auth.ts": createHook("auth"),
    },
    utils: {
      "auth.utils.ts": createUtil("auth"),
    },
  },

  users: {
    components: {
      "users-list.tsx": createComponent("UsersList"),
      "user-card.tsx": createComponent("UserCard"),
    },
    services: {
      "users.service.ts": createService("users"),
    },
    stores: {
      "users.store.ts": createStore("users"),
    },
    hooks: {
      "use-users.ts": createHook("users"),
    },
    utils: {
      "users.utils.ts": createUtil("users"),
    },
  },

  services: {
    services: {
      "api.service.ts": createService("api"),
    },
    utils: {
      "request.utils.ts": createUtil("request"),
    },
  },

  accessibility: {
    message: "Feature ainda não implementada.",
  },

  search: {
    message: "Feature ainda não implementada.",
  },

  promotions: {
    message: "Feature ainda não implementada.",
  },
};

function main() {
  ensureDirectory(SRC_DIR);
  ensureDirectory(FEATURES_DIR);

  Object.entries(featureTemplates).forEach(([featureName, structure]) => {
    generateFeature(featureName, structure);
  });

  console.log("\n✅ Aplicação gerada com sucesso.\n");
}

function generateFeature(featureName, structure = defaultStructure) {
  const featureDir = path.join(FEATURES_DIR, featureName);

  ensureDirectory(featureDir);

  if (structure.message) {
    writeFile(
      path.join(featureDir, "README.md"),
      `# ${capitalize(featureName)}\n\n${structure.message}\n`
    );

    console.log(`⚠️  ${featureName}: ${structure.message}`);
    return;
  }

  Object.entries(defaultStructure).forEach(([folder]) => {
    const folderDir = path.join(featureDir, folder);

    ensureDirectory(folderDir);

    const files = structure[folder] || {};

    Object.entries(files).forEach(([fileName, content]) => {
      writeFile(path.join(folderDir, fileName), content);
    });
  });

  writeFile(
    path.join(featureDir, "index.ts"),
    createIndexFile(structure)
  );

  console.log(`✅ Feature criada: ${featureName}`);
}

function createIndexFile(structure) {
  const exports = [];

  Object.entries(structure).forEach(([folder, files]) => {
    if (!files || typeof files !== "object") {
      return;
    }

    Object.keys(files).forEach((fileName) => {
      const exportPath = fileName
        .replace(/\.tsx?$/, "")
        .replace(/\.jsx?$/, "");

      exports.push(`export * from "./${folder}/${exportPath}";`);
    });
  });

  return exports.join("\n") + "\n";
}

function createComponent(name) {
  return `import { component$ } from "@builder.io/qwik";

export const ${name} = component$(() => {
  return (
    <div>
      <h1>${name}</h1>
    </div>
  );
});
`;
}

function createService(name) {
  return `export const ${camelCase(name)}Service = {
  async getAll() {
    return [];
  },
};
`;
}

function createStore(name) {
  return `export const ${camelCase(name)}Store = {
  data: [],
};
`;
}

function createHook(name) {
  return `export function use${pascalCase(name)}() {
  return {};
}
`;
}

function createUtil(name) {
  return `export function ${camelCase(name)}Util() {
  return null;
}
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

function camelCase(value) {
  return value
    .replace(/[-_\s]+(.)?/g, (_, char) =>
      char ? char.toUpperCase() : ""
    )
    .replace(/^(.)/, (char) => char.toLowerCase());
}

function pascalCase(value) {
  const camel = camelCase(value);

  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

main();
