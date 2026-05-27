#!/usr/bin/env node

/**
 * Qwik Enterprise Architecture Setup
 *
 * Uso:
 * node scripts/setup-project.js
 *
 * O script:
 * - cria toda arquitetura base
 * - cria diretórios
 * - cria arquivos iniciais
 * - prepara projeto escalável
 */

const fs = require('fs');
const path = require('path');

const root = process.cwd();

const directories = [
  'src/app/providers',
  'src/app/config',
  'src/app/middleware',
  'src/app/contexts',

  'src/assets/fonts',
  'src/assets/icons',
  'src/assets/images/backgrounds',
  'src/assets/images/banners',
  'src/assets/images/illustrations',
  'src/assets/images/logos',
  'src/assets/images/patterns',
  'src/assets/lottie',
  'src/assets/videos',

  'src/components/layouts',
  'src/components/shared/footer',
  'src/components/shared/header',
  'src/components/shared/hero',
  'src/components/shared/navigation',
  'src/components/shared/router-head',
  'src/components/shared/sections',

  'src/components/ui/button',
  'src/components/ui/input',
  'src/components/ui/modal',
  'src/components/ui/select',
  'src/components/ui/table',
  'src/components/ui/tabs',
  'src/components/ui/toast',
  'src/components/ui/tooltip',
  'src/components/ui/avatar',
  'src/components/ui/sidebar',
  'src/components/ui/dropdown',
  'src/components/ui/card',
  'src/components/ui/spinner',
  'src/components/ui/skeleton',

  'src/features/auth/components',
  'src/features/auth/forms',
  'src/features/auth/hooks',
  'src/features/auth/services',
  'src/features/auth/store',
  'src/features/auth/types',
  'src/features/auth/utils',
  'src/features/auth/validators',
  'src/features/auth/data',

  'src/features/services/components',
  'src/features/services/forms',
  'src/features/services/hooks',
  'src/features/services/services',
  'src/features/services/store',
  'src/features/services/types',
  'src/features/services/utils',
  'src/features/services/validators',
  'src/features/services/data',
  'src/features/services/visual',

  'src/features/promotions/components',
  'src/features/promotions/forms',
  'src/features/promotions/hooks',
  'src/features/promotions/services',
  'src/features/promotions/store',
  'src/features/promotions/types',
  'src/features/promotions/utils',
  'src/features/promotions/validators',
  'src/features/promotions/data',

  'src/features/users/components',
  'src/features/users/forms',
  'src/features/users/hooks',
  'src/features/users/services',
  'src/features/users/store',
  'src/features/users/types',
  'src/features/users/utils',
  'src/features/users/validators',
  'src/features/users/data',

  'src/features/search/components',
  'src/features/search/data',
  'src/features/search/types',
  'src/features/search/utils',

  'src/features/accessibility/components',
  'src/features/accessibility/data',
  'src/features/accessibility/store',
  'src/features/accessibility/types',
  'src/features/accessibility/utils',

  'src/lib/api',
  'src/lib/constants',
  'src/lib/formatters',
  'src/lib/generators',
  'src/lib/helpers',
  'src/lib/hooks',
  'src/lib/permissions',
  'src/lib/storage',
  'src/lib/stores',
  'src/lib/validators',

  'src/data/constants',
  'src/data/mock',
  'src/data/navigation',
  'src/data/seeds',
  'src/data/static',

  'src/routes/auth/login',
  'src/routes/auth/register',
  'src/routes/auth/forgot-password',
  'src/routes/auth/reset-password',
  'src/routes/dashboard',
  'src/routes/promotions',
  'src/routes/services',
  'src/routes/users',
  'src/routes/profile',
  'src/routes/settings',
  'src/routes/about',
  'src/routes/contact',
  'src/routes/privacy',
  'src/routes/terms',

  'src/styles/animations',
  'src/styles/base',
  'src/styles/components',
  'src/styles/globals',
  'src/styles/themes',
  'src/styles/utilities',
  'src/styles/variables',

  'src/tests/e2e',
  'src/tests/integration',
  'src/tests/mocks',
  'src/tests/setup',
  'src/tests/unit',

  'src/types',

  'scripts'
];

const files = {
  'src/root.tsx': `import { component$ } from '@builder.io/qwik';

export default component$(() => {
  return <div>Qwik App</div>;
});
`,

  'src/entry.dev.tsx': `// Qwik Dev Entry\n`,
  'src/entry.preview.tsx': `// Qwik Preview Entry\n`,
  'src/entry.ssr.tsx': `// Qwik SSR Entry\n`,

  'src/styles/main.css': `/* Global Styles */\n`,

  'src/components/ui/button/Button.tsx': `import { component$, Slot } from '@builder.io/qwik';

export const Button = component$(() => {
  return (
    <button>
      <Slot />
    </button>
  );
});
`,

  'src/components/ui/modal/Modal.tsx': `import { component$, Slot } from '@builder.io/qwik';

export const Modal = component$(() => {
  return (
    <div>
      <Slot />
    </div>
  );
});
`,

  'src/components/ui/input/TextInput.tsx': `import { component$ } from '@builder.io/qwik';

export const TextInput = component$(() => {
  return <input type="text" />;
});
`,

  'src/components/shared/header/Header.tsx': `import { component$ } from '@builder.io/qwik';

export const Header = component$(() => {
  return <header>Header</header>;
});
`,

  'src/components/shared/footer/Footer.tsx': `import { component$ } from '@builder.io/qwik';

export const Footer = component$(() => {
  return <footer>Footer</footer>;
});
`,

  'src/routes/index.tsx': `import { component$ } from '@builder.io/qwik';

export default component$(() => {
  return <div>Home Page</div>;
});
`,

  'src/routes/layout.tsx': `import { component$, Slot } from '@builder.io/qwik';

export default component$(() => {
  return <Slot />;
});
`,

  'src/lib/api/api-client.ts': `export const apiClient = {};
`,

  'src/lib/hooks/use-theme.ts': `export const useTheme = () => {
  return {};
};
`,

  'src/lib/storage/local.storage.ts': `export const localStorageManager = {};
`,

  'src/lib/helpers/strings.helper.ts': `export const capitalize = (text) => {
  return text;
};
`,

  'src/types/global.types.ts': `export interface AppConfig {}
`,

  'scripts/generate-feature.js': `console.log('Feature Generator');
`
};

const createDirectory = (directory) => {
  const fullPath = path.join(root, directory);

  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`📁 ${directory}`);
  }
};

const createFile = (file, content) => {
  const fullPath = path.join(root, file);

  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, content);
    console.log(`📄 ${file}`);
  }
};

console.log('\n🚀 Criando arquitetura Qwik...\n');

// Criar diretórios
for (const directory of directories) {
  createDirectory(directory);
}

// Criar arquivos
for (const [file, content] of Object.entries(files)) {
  createFile(file, content);
}

console.log('\n✅ Estrutura criada com sucesso!\n');
console.log('📦 Arquitetura pronta para desenvolvimento escalável.\n');
