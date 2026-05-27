#!/usr/bin/env node

/**
 * Smart Feature Generator
 *
 * Uso:
 * node scripts/generate-feature.cjs auth
 * node scripts/generate-feature.cjs services
 * node scripts/generate-feature.cjs users
 */

const fs = require("fs");
const path = require("path");

const featureName = process.argv[2];

if (!featureName) {
  console.error("\n❌ Informe o nome da feature.\n");
  process.exit(1);
}

const root = process.cwd();

const capitalize = (text) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const createDirectory = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
    console.log(`📁 ${directory}`);
  }
};

const createFile = (filePath, content = "") => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    console.log(`📄 ${filePath}`);
  }
};

const createFeatureStructure = (feature, structure) => {
  const featureRoot = path.join(root, "src", "features", feature);

  structure.folders.forEach((folder) => {
    createDirectory(path.join(featureRoot, folder));
  });

  Object.entries(structure.files).forEach(([file, content]) => {
    createFile(path.join(featureRoot, file), content);
  });

  console.log(`\n✅ Feature "${feature}" criada com sucesso!\n`);
};

/**
 * AUTH FEATURE
 */

const authStructure = {
  folders: [
    "components",
    "forms",
    "hooks",
    "services",
    "store",
    "types",
    "utils",
    "validators",
    "data",
  ],

  files: {
    "components/AuthGuard.tsx": `
import { component$, Slot } from "@builder.io/qwik";

export const AuthGuard = component$(() => {
  return <Slot />;
});
`,

    "components/AuthModal.tsx": `
import { component$ } from "@builder.io/qwik";

export const AuthModal = component$(() => {
  return <div>Auth Modal</div>;
});
`,

    "components/AuthTabs.tsx": `
import { component$ } from "@builder.io/qwik";

export const AuthTabs = component$(() => {
  return <div>Auth Tabs</div>;
});
`,

    "forms/LoginForm.tsx": `
import { component$ } from "@builder.io/qwik";

export const LoginForm = component$(() => {
  return (
    <form>
      <h2>Login Form</h2>
    </form>
  );
});
`,

    "forms/RegisterForm.tsx": `
import { component$ } from "@builder.io/qwik";

export const RegisterForm = component$(() => {
  return (
    <form>
      <h2>Register Form</h2>
    </form>
  );
});
`,

    "forms/ForgotPasswordForm.tsx": `
import { component$ } from "@builder.io/qwik";

export const ForgotPasswordForm = component$(() => {
  return (
    <form>
      <h2>Forgot Password</h2>
    </form>
  );
});
`,

    "forms/ResetPasswordForm.tsx": `
import { component$ } from "@builder.io/qwik";

export const ResetPasswordForm = component$(() => {
  return (
    <form>
      <h2>Reset Password</h2>
    </form>
  );
});
`,

    "hooks/use-auth.ts": `
export const useAuth = () => {
  return {};
};
`,

    "hooks/use-login.ts": `
export const useLogin = () => {
  return {};
};
`,

    "hooks/use-register.ts": `
export const useRegister = () => {
  return {};
};
`,

    "services/auth.service.ts": `
export const authService = {
  async login() {},
  async register() {},
  async logout() {},
};
`,

    "services/token.service.ts": `
export const tokenService = {
  getToken() {},
  setToken() {},
  removeToken() {},
};
`,

    "store/auth.store.ts": `
export const authStore = {
  user: null,
  token: null,
};
`,

    "types/auth.types.ts": `
export interface User {
  id: string;
  name: string;
  email: string;
}
`,

    "types/session.types.ts": `
export interface Session {
  token: string;
}
`,

    "validators/auth.validator.ts": `
export const validateLogin = () => {
  return true;
};
`,

    "utils/auth.helpers.ts": `
export const isAuthenticated = () => {
  return false;
};
`,

    "data/auth.data.ts": `
export const authData = [];
`,
  },
};

/**
 * SERVICES FEATURE
 */

const servicesStructure = {
  folders: [
    "components",
    "forms",
    "hooks",
    "services",
    "store",
    "types",
    "utils",
    "validators",
    "data",
    "visual",
  ],

  files: {
    "components/ServiceCard.tsx": `
import { component$ } from "@builder.io/qwik";

export const ServiceCard = component$(() => {
  return <div>Service Card</div>;
});
`,

    "components/ServicesSection.tsx": `
import { component$ } from "@builder.io/qwik";

export const ServicesSection = component$(() => {
  return <section>Services Section</section>;
});
`,

    "forms/ServiceForm.tsx": `
import { component$ } from "@builder.io/qwik";

export const ServiceForm = component$(() => {
  return <form>Service Form</form>;
});
`,

    "forms/QuoteRequestForm.tsx": `
import { component$ } from "@builder.io/qwik";

export const QuoteRequestForm = component$(() => {
  return <form>Quote Request</form>;
});
`,

    "hooks/use-services.ts": `
export const useServices = () => {
  return {};
};
`,

    "services/services.service.ts": `
export const servicesService = {
  async getAll() {},
};
`,

    "store/services.store.ts": `
export const servicesStore = {};
`,

    "types/service.types.ts": `
export interface Service {
  id: string;
  title: string;
}
`,

    "validators/service.validator.ts": `
export const validateService = () => {
  return true;
};
`,

    "utils/service.helpers.ts": `
export const formatService = () => {
  return null;
};
`,

    "data/services.data.ts": `
export const servicesData = [];
`,
  },
};

/**
 * USERS FEATURE
 */

const usersStructure = {
  folders: [
    "components",
    "forms",
    "hooks",
    "services",
    "store",
    "types",
    "utils",
    "validators",
    "data",
  ],

  files: {
    "components/UserCard.tsx": `
import { component$ } from "@builder.io/qwik";

export const UserCard = component$(() => {
  return <div>User Card</div>;
});
`,

    "forms/ProfileForm.tsx": `
import { component$ } from "@builder.io/qwik";

export const ProfileForm = component$(() => {
  return <form>Profile Form</form>;
});
`,

    "hooks/use-users.ts": `
export const useUsers = () => {
  return {};
};
`,

    "services/users.service.ts": `
export const usersService = {
  async getAll() {},
};
`,

    "store/users.store.ts": `
export const usersStore = {};
`,

    "types/user.types.ts": `
export interface User {
  id: string;
  name: string;
}
`,

    "validators/user.validator.ts": `
export const validateUser = () => {
  return true;
};
`,

    "utils/user.helpers.ts": `
export const formatUser = () => {
  return null;
};
`,

    "data/users.data.ts": `
export const usersData = [];
`,
  },
};

const accessibilityStructure = {
  folders: [
    "components",
    "hooks",
    "store",
    "types",
    "utils",
    "data",
  ],

  files: {
    "components/AccessibilityButton.tsx": `
import { component$ } from "@builder.io/qwik";

export const AccessibilityButton = component$(() => {
  return <button>Accessibility</button>;
});
`,

    "components/AccessibilityModal.tsx": `
import { component$ } from "@builder.io/qwik";

export const AccessibilityModal = component$(() => {
  return <div>Accessibility Modal</div>;
});
`,

    "components/AccessibilityOptions.tsx": `
import { component$ } from "@builder.io/qwik";

export const AccessibilityOptions = component$(() => {
  return <div>Accessibility Options</div>;
});
`,

    "components/AccessibilitySegment.tsx": `
import { component$ } from "@builder.io/qwik";

export const AccessibilitySegment = component$(() => {
  return <section>Accessibility Segment</section>;
});
`,

    "hooks/use-accessibility.ts": `
export const useAccessibility = () => {
  return {};
};
`,

    "store/accessibility.store.ts": `
export const accessibilityStore = {};
`,

    "types/accessibility.types.ts": `
export interface AccessibilitySettings {
  contrast: boolean;
  fontSize: number;
}
`,

    "utils/accessibility.helpers.ts": `
export const toggleContrast = () => {
  return true;
};
`,

    "data/accessibility.data.ts": `
export const accessibilityData = [];
`,
  },
};

const searchStructure = {
  folders: [
    "components",
    "hooks",
    "types",
    "utils",
    "data",
  ],

  files: {
    "components/SearchModal.tsx": `
import { component$ } from "@builder.io/qwik";

export const SearchModal = component$(() => {
  return <div>Search Modal</div>;
});
`,

    "components/SearchTable.tsx": `
import { component$ } from "@builder.io/qwik";

export const SearchTable = component$(() => {
  return <table></table>;
});
`,

    "components/SearchResults.tsx": `
import { component$ } from "@builder.io/qwik";

export const SearchResults = component$(() => {
  return <div>Search Results</div>;
});
`,

    "hooks/use-search.ts": `
export const useSearch = () => {
  return {};
};
`,

    "types/search.types.ts": `
export interface SearchResult {
  id: string;
  title: string;
}
`,

    "utils/search.helpers.ts": `
export const filterResults = () => {
  return [];
};
`,

    "data/search.data.ts": `
export const searchData = [];
`,
  },
};

const promotionsStructure = {
  folders: [
    "components",
    "forms",
    "hooks",
    "services",
    "store",
    "types",
    "utils",
    "validators",
    "data",
  ],

  files: {
    "components/PromotionCard.tsx": `
import { component$ } from "@builder.io/qwik";

export const PromotionCard = component$(() => {
  return <div>Promotion Card</div>;
});
`,

    "components/PromotionsSection.tsx": `
import { component$ } from "@builder.io/qwik";

export const PromotionsSection = component$(() => {
  return <section>Promotions Section</section>;
});
`,

    "components/PromotionModal.tsx": `
import { component$ } from "@builder.io/qwik";

export const PromotionModal = component$(() => {
  return <div>Promotion Modal</div>;
});
`,

    "forms/PromotionForm.tsx": `
import { component$ } from "@builder.io/qwik";

export const PromotionForm = component$(() => {
  return <form>Promotion Form</form>;
});
`,

    "hooks/use-promotions.ts": `
export const usePromotions = () => {
  return {};
};
`,

    "services/promotions.service.ts": `
export const promotionsService = {
  async getAll() {},
};
`,

    "store/promotions.store.ts": `
export const promotionsStore = {};
`,

    "types/promotion.types.ts": `
export interface Promotion {
  id: string;
  title: string;
}
`,

    "validators/promotion.validator.ts": `
export const validatePromotion = () => {
  return true;
};
`,

    "utils/promotion.helpers.ts": `
export const formatPromotion = () => {
  return null;
};
`,

    "data/promotions.data.ts": `
export const promotionsData = [];
`,
  },
};

/**
 * DEFAULT FEATURE
 */
const defaultStructure = {
  message: `
❌ Feature não configurada.

Adicione manualmente a estrutura desta feature no generate-feature.cjs.
`,
};
/*
  switch
*/

const availableFeatures = {
  auth: authStructure,
  services: servicesStructure,
  users: usersStructure,
  accessibility: accessibilityStructure,
  search: searchStructure,
  promotions: promotionsStructure,
};

if (!availableFeatures[featureName]) {
  console.log(`
❌ Feature não configurada.

Feature recebida:
→ ${featureName}

Features disponíveis:
→ auth
→ services
→ users
→ accessibility
→ search
→ promotions

Adicione a estrutura manualmente no generator.
`);

  process.exit(1);
}

createFeatureStructure(
  featureName,
  availableFeatures[featureName]
);