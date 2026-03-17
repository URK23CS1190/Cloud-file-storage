import fs from 'fs/promises';
import path from 'path';

const dataDir = path.resolve(process.cwd(), 'data');
const metadataPath = path.join(dataDir, 'metadata.json');
const sharesPath = path.join(dataDir, 'shares.json');

async function ensureFile(filePath) {
  try {
    await fs.access(filePath);
  } catch {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, '[]');
  }
}

async function readJson(filePath) {
  await ensureFile(filePath);
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content || '[]');
}

async function writeJson(filePath, value) {
  await ensureFile(filePath);
  await fs.writeFile(filePath, JSON.stringify(value, null, 2));
}

export const metadataStore = {
  async list() {
    return readJson(metadataPath);
  },
  async saveAll(items) {
    return writeJson(metadataPath, items);
  },
};

export const shareStore = {
  async list() {
    return readJson(sharesPath);
  },
  async saveAll(items) {
    return writeJson(sharesPath, items);
  },
};
