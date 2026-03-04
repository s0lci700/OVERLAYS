const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SOURCE_AGENTS_DIR = '.claude/agents';
const SOURCE_SKILLS_DIR = '.claude/skills';
const DEST_SKILLS_DIR = 'gemini-skills'; // Temporary directory for staging
const SKILL_CREATOR_PATH = 'C:\\Users\\Sol\\AppData\\Local\\nvm\\v24.13.1\\node_modules\\@google\\gemini-cli\\node_modules\\@google\\gemini-cli-core\\dist\\src\\skills\\builtin\\skill-creator';

// Ensure destination directory exists
if (!fs.existsSync(DEST_SKILLS_DIR)) {
  fs.mkdirSync(DEST_SKILLS_DIR);
}

// Helper to sanitize skill names
function sanitizeName(name) {
  return name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
}

// Helper to extract frontmatter and body from legacy files
function parseLegacyFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  
  if (match) {
    const frontmatterRaw = match[1];
    const body = match[2];
    const frontmatter = {};
    
    frontmatterRaw.split(/\r?\n/).forEach(line => {
      const parts = line.split(':');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join(':').trim();
        frontmatter[key] = value;
      }
    });
    
    return { frontmatter, body };
  } else {
    // Fallback if no frontmatter
    return { 
      frontmatter: { description: 'Imported skill from legacy system.' }, 
      body: content 
    };
  }
}

// Migrate Agents
if (fs.existsSync(SOURCE_AGENTS_DIR)) {
  const agentFiles = fs.readdirSync(SOURCE_AGENTS_DIR).filter(f => f.endsWith('.md'));
  
  agentFiles.forEach(file => {
    const name = sanitizeName(path.basename(file, '.md'));
    const { frontmatter, body } = parseLegacyFile(path.join(SOURCE_AGENTS_DIR, file));
    const skillDir = path.join(DEST_SKILLS_DIR, name);
    
    console.log(`Migrating Agent: ${name}...`);

    // 1. Init Skill
    try {
        execSync(`node "${path.join(SKILL_CREATOR_PATH, 'scripts', 'init_skill.cjs')}" "${name}" --path "${DEST_SKILLS_DIR}"`, { stdio: 'inherit' });
    } catch (e) {
        console.error(`Failed to init skill ${name}:`, e);
        return;
    }

    // 2. Update SKILL.md
    const skillMdPath = path.join(skillDir, 'SKILL.md');
    let description = frontmatter.description || `Agent ${name} imported from .claude/agents`;
    // Clean up multiline descriptions for YAML compatibility if needed, or just keep simple
    description = description.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();

    const newContent = `---
name: ${name}
description: ${description}
---

${body}
`;
    fs.writeFileSync(skillMdPath, newContent);
  });
}

// Migrate Skills
if (fs.existsSync(SOURCE_SKILLS_DIR)) {
    const skillDirs = fs.readdirSync(SOURCE_SKILLS_DIR, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    skillDirs.forEach(skillName => {
        const legacySkillPath = path.join(SOURCE_SKILLS_DIR, skillName, 'SKILL.md');
        if (!fs.existsSync(legacySkillPath)) return;

        const name = sanitizeName(skillName);
        const { frontmatter, body } = parseLegacyFile(legacySkillPath);
        const skillDir = path.join(DEST_SKILLS_DIR, name);

        console.log(`Migrating Skill: ${name}...`);

        // 1. Init Skill
        try {
            execSync(`node "${path.join(SKILL_CREATOR_PATH, 'scripts', 'init_skill.cjs')}" "${name}" --path "${DEST_SKILLS_DIR}"`, { stdio: 'inherit' });
        } catch (e) {
             console.error(`Failed to init skill ${name}:`, e);
             return;
        }

        // 2. Update SKILL.md
        const skillMdPath = path.join(skillDir, 'SKILL.md');
        let description = frontmatter.description || `Skill ${name} imported from .claude/skills`;
        description = description.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();

        const newContent = `---
name: ${name}
description: ${description}
---

${body}
`;
        fs.writeFileSync(skillMdPath, newContent);
    });
}

console.log('Migration preparation complete. Skills are in "gemini-skills" directory.');
