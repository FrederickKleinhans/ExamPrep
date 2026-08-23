import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateCertification } from './validate-content.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = join(root, 'content', 'certifications');
const outputRoot = join(root, 'public', 'data');

const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'));
const writeJson = async (file, value) => {
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};

// ---------------------------------------------------------------------------
// Catalog + tracks compilation
// ---------------------------------------------------------------------------

async function compileCatalog() {
  const catalogPath = join(root, 'content', 'catalog.json');
  let catalog;
  try {
    catalog = await readJson(catalogPath);
  } catch {
    console.warn('No content/catalog.json found — skipping catalog compilation.');
    return { certLookup: new Map() };
  }

  // Flatten all certs from all domains into a single lookup map
  const certLookup = new Map();
  for (const certs of Object.values(catalog)) {
    for (const cert of certs) {
      certLookup.set(cert.id, cert);
    }
  }

  // Emit public/data/catalog.json — full flattened list for the UI
  const allCerts = [...certLookup.values()];
  await writeJson(join(outputRoot, 'catalog.json'), allCerts);
  console.log(`  Catalog: ${allCerts.length} certifications emitted.`);

  return { certLookup };
}

async function compileTracks(certLookup) {
  const tracksPath = join(root, 'content', 'tracks.json');
  let tracks;
  try {
    tracks = await readJson(tracksPath);
  } catch {
    console.warn('No content/tracks.json found — skipping tracks compilation.');
    return;
  }

  // Validate that every certId referenced in tracks exists in the catalog
  const errors = [];
  for (const track of tracks) {
    for (const level of track.levels ?? []) {
      for (const entry of level.certs ?? []) {
        if (!certLookup.has(entry.certId)) {
          errors.push(`Track "${track.id}" level "${level.stage}" references unknown certId "${entry.certId}"`);
        }
      }
    }
    for (const certId of track.crossTrackCerts ?? []) {
      if (!certLookup.has(certId)) {
        errors.push(`Track "${track.id}" crossTrackCerts references unknown certId "${certId}"`);
      }
    }
  }

  if (errors.length) {
    throw new Error(`Tracks validation errors:\n- ${errors.join('\n- ')}`);
  }

  await writeJson(join(outputRoot, 'tracks.json'), tracks);
  console.log(`  Tracks: ${tracks.length} career tracks emitted.`);
}

// ---------------------------------------------------------------------------
// Certification content compilation (existing pipeline)
// ---------------------------------------------------------------------------

async function findCertificationDirectories(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const directories = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const path = join(directory, entry.name);
    try {
      await readFile(join(path, 'certification.json'));
      directories.push(path);
    } catch {
      directories.push(...await findCertificationDirectories(path));
    }
  }
  return directories;
}


async function compileCertifications(certLookup) {
  const certificationDirectories = await findCertificationDirectories(sourceRoot);
  const certifications = [];

  for (const certificationDirectory of certificationDirectories) {
    const certificationPath = join(certificationDirectory, 'certification.json');
    const certification = await readJson(certificationPath);
    const questionBank = await readJson(join(certificationDirectory, 'questions.json'));
    validateCertification(certification, questionBank, certificationPath);

    // Merge catalog metadata if available (vendor info, accessTier, etc.)
    const catalogEntry = certLookup.get(certification.id);
    const certWithMeta = catalogEntry
      ? {
        ...certification,
        vendor: catalogEntry.vendor,
        vendorColor: catalogEntry.vendorColor,
        level: catalogEntry.level,
        accessTier: catalogEntry.accessTier,
        description: catalogEntry.description,
        examDetails: catalogEntry.examDetails,
      }
      : certification;

    const normalizedQuestions = questionBank.questions.map((question) => ({
      ...question,
      metadata: { ...question.metadata, reviewStatus: question.metadata.reviewStatus ?? 'draft' },
    }));
    const chunks = Object.groupBy(normalizedQuestions, (question) => question.topicId);
    const topicChunks = [];
    for (const topic of certification.topics) {
      const questions = chunks[topic.id] ?? [];
      const chunkPath = `certifications/${certification.id}/topics/${topic.id}.json`;
      await writeJson(join(outputRoot, chunkPath), { certificationId: certification.id, topicId: topic.id, version: certification.version, questions });
      topicChunks.push({ topicId: topic.id, path: `/data/${chunkPath}`, questionCount: questions.length });
    }
    await writeJson(join(outputRoot, 'certifications', certification.id, 'manifest.json'), { ...certWithMeta, topicChunks });
    await writeJson(join(outputRoot, `${certification.id}.json`), { ...questionBank, questions: normalizedQuestions });
    certifications.push(certWithMeta);
  }

  return certifications;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

console.log('Compiling content...');

const { certLookup } = await compileCatalog();
await compileTracks(certLookup);
const certifications = await compileCertifications(certLookup);

// Root manifest lists only certifications that have compiled question content.
// The full catalog (including coming-soon certs) lives in catalog.json.
await writeJson(join(outputRoot, 'manifest.json'), { certifications });

console.log(`Done. ${certifications.length} certification(s) with question content compiled.`);
