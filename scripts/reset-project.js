#!/usr/bin/env node

/**
 * Needly Mobile - Project Structure Migration
 *
 * This script migrates the default Expo Router project structure
 * into the architecture we use for the application:
 *
 * src/
 * ├── app/          -> Expo Router routes only
 * ├── features/     -> Feature / business logic
 * ├── components/   -> Shared UI
 * ├── providers/    -> Global providers
 * ├── services/     -> API / Storage / Analytics
 * ├── hooks/        -> Generic hooks
 * ├── utils/        -> Generic utilities
 * ├── constants/    -> Global constants
 * ├── theme/        -> Design system / theme
 * └── types/        -> Global types
 *
 * Existing root directories are moved into src/ instead of deleted.
 *
 * You can safely remove this script after the migration is complete.
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const root = process.cwd();
const srcDir = path.join(root, "src");

/**
 * Directories that should be migrated from the old Expo structure
 * into the new src/ structure.
 *
 * IMPORTANT:
 * scripts/ intentionally stays in the project root.
 */
const migrations = [
  {
    from: "app",
    to: path.join("src", "app"),
  },
  {
    from: "components",
    to: path.join("src", "components"),
  },
  {
    from: "hooks",
    to: path.join("src", "hooks"),
  },
  {
    from: "constants",
    to: path.join("src", "constants"),
  },
];

/**
 * Directories that form the new application architecture.
 */
const architectureDirs = [
  "features",
  "providers",
  "services",
  "utils",
  "theme",
  "types",
];

/**
 * Minimal files created when src/app does not already exist.
 */
const indexContent = `import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Welcome to Needly</Text>
    </View>
  );
}
`;

const layoutContent = `import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
`;

/**
 * Create readline interface.
 */
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * Check whether a path exists.
 */
function exists(targetPath) {
  return fs.existsSync(targetPath);
}

/**
 * Ensure a directory exists.
 */
async function ensureDir(dirPath) {
  await fs.promises.mkdir(dirPath, {
    recursive: true,
  });
}

/**
 * Merge two directories recursively.
 *
 * This prevents the migration from failing when the destination
 * directory already exists.
 */
async function mergeDirectories(source, destination) {
  await ensureDir(destination);

  const entries = await fs.promises.readdir(source, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      if (exists(destinationPath)) {
        await mergeDirectories(sourcePath, destinationPath);

        /**
         * Remove the source directory after successfully merging it.
         */
        await fs.promises.rm(sourcePath, {
          recursive: true,
          force: true,
        });
      } else {
        await fs.promises.rename(sourcePath, destinationPath);
      }
    } else {
      /**
       * If the destination file already exists, do not overwrite it.
       * This protects existing work.
       */
      if (exists(destinationPath)) {
        console.log(
          `⚠️  Skipped existing file: ${path.relative(root, destinationPath)}`
        );
      } else {
        await fs.promises.rename(sourcePath, destinationPath);
      }
    }
  }

  /**
   * Remove the now-empty source directory.
   */
  if (exists(source)) {
    const remaining = await fs.promises.readdir(source);

    if (remaining.length === 0) {
      await fs.promises.rm(source, {
        recursive: true,
        force: true,
      });
    }
  }
}

/**
 * Move or merge a directory into its new location.
 */
async function migrateDirectory(fromRelative, toRelative) {
  const source = path.join(root, fromRelative);
  const destination = path.join(root, toRelative);

  if (!exists(source)) {
    console.log(`➡️  /${fromRelative} does not exist, skipping.`);
    return;
  }

  console.log(
    `\n📦 Migrating /${fromRelative} → /${toRelative}`
  );

  if (!exists(destination)) {
    await ensureDir(path.dirname(destination));

    await fs.promises.rename(source, destination);

    console.log(
      `✅ Moved /${fromRelative} → /${toRelative}`
    );

    return;
  }

  console.log(
    `📂 Destination already exists. Merging files...`
  );

  await mergeDirectories(source, destination);

  console.log(
    `✅ Merged /${fromRelative} → /${toRelative}`
  );
}

/**
 * Create the new architecture directories.
 */
async function createArchitecture() {
  console.log("\n🏗️  Creating application architecture...\n");

  await ensureDir(srcDir);

  for (const dir of architectureDirs) {
    const dirPath = path.join(srcDir, dir);

    await ensureDir(dirPath);

    console.log(`📁 src/${dir}/`);
  }

  /**
   * Shared UI structure.
   */
  await ensureDir(
    path.join(srcDir, "components", "ui")
  );

  await ensureDir(
    path.join(srcDir, "components", "feedback")
  );

  /**
   * Feature directories.
   *
   * We create the main features we already planned for Needly.
   * You can add/remove these later.
   */
  const features = [
    "auth",
    "products",
    "profile",
    "settings",
  ];

  for (const feature of features) {
    await ensureDir(
      path.join(srcDir, "features", feature)
    );

    console.log(
      `📁 src/features/${feature}/`
    );
  }

  console.log("\n✅ Architecture directories created.");
}

/**
 * Create src/app when it does not exist.
 */
async function createAppFiles() {
  const appDir = path.join(srcDir, "app");

  await ensureDir(appDir);

  const indexPath = path.join(appDir, "index.tsx");
  const layoutPath = path.join(appDir, "_layout.tsx");

  if (!exists(indexPath)) {
    await fs.promises.writeFile(
      indexPath,
      indexContent,
      "utf8"
    );

    console.log("📄 Created src/app/index.tsx");
  } else {
    console.log("➡️  src/app/index.tsx already exists.");
  }

  if (!exists(layoutPath)) {
    await fs.promises.writeFile(
      layoutPath,
      layoutContent,
      "utf8"
    );

    console.log("📄 Created src/app/_layout.tsx");
  } else {
    console.log("➡️  src/app/_layout.tsx already exists.");
  }
}

/**
 * Create useful .gitkeep files so empty architecture
 * directories can remain visible in Git.
 */
async function createGitkeepFiles() {
  const dirs = [
    path.join(srcDir, "features"),
    path.join(srcDir, "providers"),
    path.join(srcDir, "services"),
    path.join(srcDir, "utils"),
    path.join(srcDir, "theme"),
    path.join(srcDir, "types"),
    path.join(srcDir, "components", "ui"),
    path.join(srcDir, "components", "feedback"),
  ];

  for (const dir of dirs) {
    const gitkeep = path.join(dir, ".gitkeep");

    if (!exists(gitkeep)) {
      await fs.promises.writeFile(
        gitkeep,
        "",
        "utf8"
      );
    }
  }
}

/**
 * Print the final project structure.
 */
function printFinalStructure() {
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 Needly architecture migration complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

src/
├── app/                  ← Expo Router
│   ├── _layout.tsx
│   └── index.tsx
│
├── features/             ← Business / Feature logic
│   ├── auth/
│   ├── products/
│   ├── profile/
│   └── settings/
│
├── components/           ← Shared UI
│   ├── ui/
│   └── feedback/
│
├── providers/            ← Global providers
├── services/             ← API / Storage / Analytics
├── hooks/                ← Generic hooks
├── utils/                ← Generic utilities
├── constants/            ← Global constants
├── theme/                ← Theme / Design system
└── types/                ← Global types

assets/                   ← Images / Fonts / Icons
scripts/                  ← Development scripts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Important:

1. src/app/ is ONLY for Expo Router routes.
2. Business logic belongs inside src/features/.
3. Shared UI belongs inside src/components/.
4. scripts/ remains in the project root.
5. Existing files were protected and were not overwritten.

Next step:

Run:

  npx expo start

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
}

/**
 * Main migration process.
 */
async function migrateProject() {
  try {
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Needly Mobile Architecture Migration
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This will migrate the current Expo structure to:

src/
├── app/
├── features/
├── components/
├── providers/
├── services/
├── hooks/
├── utils/
├── constants/
├── theme/
└── types/

Existing files will NOT be overwritten.
`);

    /**
     * First create the architecture.
     */
    await createArchitecture();

    /**
     * Migrate existing Expo directories.
     */
    for (const migration of migrations) {
      await migrateDirectory(
        migration.from,
        migration.to
      );
    }

    /**
     * Make sure the new router directory exists.
     */
    await createAppFiles();

    /**
     * Add gitkeep files for empty folders.
     */
    await createGitkeepFiles();

    /**
     * Print result.
     */
    printFinalStructure();
  } catch (error) {
    console.error(
      `\n❌ Migration failed: ${error.message}`
    );

    console.error(error);

    process.exitCode = 1;
  }
}

/**
 * Ask for confirmation before modifying the project.
 */
rl.question(
  "Do you want to migrate your current Expo project to the new src/ architecture? (Y/n): ",
  (answer) => {
    const userInput =
      answer.trim().toLowerCase() || "y";

    if (userInput === "y") {
      rl.close();

      migrateProject();
    } else if (userInput === "n") {
      console.log(
        "\n❌ Migration cancelled. No files were changed."
      );

      rl.close();
    } else {
      console.log(
        "\n❌ Invalid input. Please enter Y or N."
      );

      rl.close();
    }
  }
);
