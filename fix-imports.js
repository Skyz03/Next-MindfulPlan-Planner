const fs = require('fs');
const path = require('path');

// ==========================================
// THE MAPPING CONFIGURATION
// ==========================================
// We map unique identifying parts of the OLD path to the NEW absolute path.
const MAPPINGS = [
    // --- 1. MOVED SERVER ACTIONS ---
    { pattern: /actions\/auth/, replacement: '@/features/auth/actions' },
    { pattern: /actions\/task/, replacement: '@/features/tasks/actions' },
    { pattern: /actions\/goal/, replacement: '@/features/goals/actions' },
    { pattern: /actions\/strategy/, replacement: '@/features/strategy/actions' },
    { pattern: /actions\/reflections/, replacement: '@/features/reflection/actions' },
    { pattern: /actions\/ai/, replacement: '@/features/ai/actions' },
    { pattern: /actions\/user/, replacement: '@/features/user/actions' },
    { pattern: /actions\/blueprint/, replacement: '@/features/planning/actions' },

    // --- 2. MOVED UI COMPONENTS (Specific Moves) ---
    { pattern: /components\/ui\/PriorityBadge/, replacement: '@/features/tasks/components/PriorityBadge' },
    { pattern: /components\/ui\/PrioritySelect/, replacement: '@/features/tasks/components/PrioritySelect' },
    { pattern: /components\/ui\/AuthSubmitButton/, replacement: '@/features/auth/components/AuthSubmitButton' },
    { pattern: /components\/universal\/TaskCard/, replacement: '@/features/tasks/components/TaskCard' },
    { pattern: /components\/features\/planning\/SidebarGoal/, replacement: '@/features/goals/components/SidebarGoal' },
    { pattern: /components\/features\/planning\/AIGenerateButton/, replacement: '@/features/ai/AIGenerateButton' },

    // --- 3. MOVED FEATURE FOLDERS ---
    { pattern: /components\/features\/strategy/, replacement: '@/features/strategy/components' },
    { pattern: /components\/features\/reflection/, replacement: '@/features/reflection/components' },
    { pattern: /components\/features\/focus/, replacement: '@/features/focus/components' },
    { pattern: /components\/features\/inbox/, replacement: '@/features/inbox/components' },
    { pattern: /components\/features\/onboarding/, replacement: '@/features/onboarding/components' },
    { pattern: /components\/features\/planning/, replacement: '@/features/planning/components' },

    // --- 4. CORE & SHARED MOVES ---
    // Matches generic ShadCN UI components (e.g., button, input) that moved to core
    { pattern: /components\/ui/, replacement: '@/core/ui' },
    { pattern: /components\/layout/, replacement: '@/core/layout' },
    { pattern: /components\/providers/, replacement: '@/core/providers' },

    // --- 5. UTILS & LIB ---
    // Catches imports like '@/utils/supabase' or '../utils/cn'
    { pattern: /\/?utils/, replacement: '@/core/lib' },
];

// ==========================================
// THE SCRIPT LOGIC
// ==========================================

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

function run() {
    const srcDir = path.join(__dirname, 'src');

    if (!fs.existsSync(srcDir)) {
        console.error("❌ Error: 'src' folder not found. Are you running this from the project root?");
        process.exit(1);
    }

    let filesChanged = 0;

    walkDir(srcDir, (filePath) => {
        // Only process .ts, .tsx, .js, .jsx
        if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) return;

        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;

        // The Import Regex: Captures "import ... from 'CAPTURE_GROUP'"
        // This handles single quotes, double quotes, and newlines in imports
        const importRegex = /(from\s+['"])([^'"]+)(['"])/g;

        content = content.replace(importRegex, (fullMatch, prefix, oldPath, suffix) => {
            let newPath = oldPath;

            for (const map of MAPPINGS) {
                // If the old path contains the pattern (e.g., "actions/task")
                if (map.pattern.test(oldPath)) {
                    // Check if it's pointing to a specific file inside (e.g. components/ui/button)
                    // If the pattern matches "components/ui", we want to preserve "/button"

                    // Logic: Split the old path by the pattern match
                    const parts = oldPath.split(map.pattern);

                    // We take the replacement (e.g., "@/core/ui") and append whatever came after
                    // Example: "../components/ui/button" -> matches "components/ui" -> becomes "@/core/ui" + "/button"
                    const tail = parts.length > 1 ? parts[1] : '';

                    newPath = map.replacement + tail;
                    break; // Stop after first match to avoid double replacement
                }
            }

            return prefix + newPath + suffix;
        });

        // Write file if changes detected
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Fixed: ${filePath.replace(__dirname, '')}`);
            filesChanged++;
        }
    });

    console.log(`\n🎉 Import Fix Complete! Modified ${filesChanged} files.`);
    console.log(`👉 Next Step: Run 'npm run dev' to check for any remaining edge cases.`);
}

run();