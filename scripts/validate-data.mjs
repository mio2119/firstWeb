import fs from 'fs/promises';
import path from 'path';

const dataRoot = path.join(process.cwd(), 'public', 'data');

const toPosix = (filePath) => path.relative(process.cwd(), filePath).replace(/\\/g, '/');

const walk = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return walk(fullPath);
      }
      return fullPath;
    })
  );
  return files.flat();
};

const isPlainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const findDuplicateIds = (data) => {
  if (!Array.isArray(data)) return [];
  const counts = new Map();
  data.forEach((item) => {
    if (isPlainObject(item) && 'id' in item) {
      const id = String(item.id);
      counts.set(id, (counts.get(id) || 0) + 1);
    }
  });
  return [...counts.entries()].filter(([, count]) => count > 1).map(([id]) => id);
};

const main = async () => {
  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalFiles: 0,
      parsedFiles: 0,
      errorFiles: 0,
      duplicateIdFiles: 0,
      missingReferenceCount: 0,
      counts: {
        quizQuestions: 0,
        universities: 0,
        careers: 0,
        qaTemplateGroups: 0,
        qaTemplateVariants: 0,
        qaIntents: 0
      }
    },
    parseErrors: [],
    duplicateIds: [],
    references: {
      missingCareerDetails: [],
      detailIdMismatch: [],
      missingTemplateGroups: [],
      missingSlotPromptGroups: [],
      brokenReferences: []
    }
  };

  const allFiles = (await walk(dataRoot)).filter((file) => file.endsWith('.json'));
  report.summary.totalFiles = allFiles.length;
  const fileSet = new Set(allFiles);

  const parsed = new Map();

  await Promise.all(
    allFiles.map(async (file) => {
      try {
        const raw = await fs.readFile(file, 'utf8');
        const sanitized = raw.replace(/^\uFEFF/, '');
        const data = JSON.parse(sanitized);
        parsed.set(file, data);
      } catch (error) {
        report.parseErrors.push({
          file: toPosix(file),
          error: error instanceof Error ? error.message : '未知错误'
        });
      }
    })
  );

  report.summary.parsedFiles = parsed.size;
  report.summary.errorFiles = report.parseErrors.length;

  parsed.forEach((data, file) => {
    const duplicates = findDuplicateIds(data);
    if (duplicates.length > 0) {
      report.duplicateIds.push({ file: toPosix(file), ids: duplicates });
    }
  });

  report.summary.duplicateIdFiles = report.duplicateIds.length;

  const getParsed = (...parts) => parsed.get(path.join(dataRoot, ...parts));

  const questions = getParsed('quiz', 'mbti_questions.json');
  if (Array.isArray(questions)) report.summary.counts.quizQuestions = questions.length;

  const universities = getParsed('admissions', 'index_universities.json');
  if (Array.isArray(universities)) report.summary.counts.universities = universities.length;

  const careers = getParsed('explore', 'careers_index.json');
  if (Array.isArray(careers)) report.summary.counts.careers = careers.length;

  const intents = getParsed('qa', 'intents.json');
  if (Array.isArray(intents)) report.summary.counts.qaIntents = intents.length;

  const templates = getParsed('qa', 'templates.json');
  if (templates && typeof templates === 'object') {
    const groupNames = Object.keys(templates);
    report.summary.counts.qaTemplateGroups = groupNames.length;
    report.summary.counts.qaTemplateVariants = groupNames.reduce((sum, group) => {
      const variants = templates[group]?.variants;
      return sum + (Array.isArray(variants) ? variants.length : 0);
    }, 0);
  }

  if (Array.isArray(careers)) {
    careers.forEach((item) => {
      if (!item || typeof item !== 'object' || !item.id) return;
      const id = String(item.id);
      const detailPath = path.join(dataRoot, 'explore', 'careers_detail', `${id}.json`);
      if (!fileSet.has(detailPath)) {
        report.references.missingCareerDetails.push({
          id,
          file: toPosix(detailPath)
        });
        return;
      }
      const detail = parsed.get(detailPath);
      if (detail && detail.id && String(detail.id) !== id) {
        report.references.detailIdMismatch.push({
          id,
          file: toPosix(detailPath),
          detailId: String(detail.id)
        });
      }
    });
  }

  if (Array.isArray(intents) && templates && typeof templates === 'object') {
    const groupNames = new Set(Object.keys(templates));
    intents.forEach((intent) => {
      if (!intent || typeof intent !== 'object') return;
      if (intent.templateGroup && !groupNames.has(intent.templateGroup)) {
        report.references.missingTemplateGroups.push({
          intentId: intent.id,
          templateGroup: intent.templateGroup
        });
      }
      if (intent.slotPrompts && typeof intent.slotPrompts === 'object') {
        Object.entries(intent.slotPrompts).forEach(([slot, group]) => {
          if (group && !groupNames.has(group)) {
            report.references.missingSlotPromptGroups.push({
              intentId: intent.id,
              slot,
              templateGroup: group
            });
          }
        });
      }
    });
  }

  const universityIds = new Set(Array.isArray(universities) ? universities.map((item) => String(item.id)) : []);
  const careerIds = new Set(Array.isArray(careers) ? careers.map((item) => String(item.id)) : []);

  const idKeyTargets = {
    universityId: universityIds,
    universityIds: universityIds,
    uniId: universityIds,
    uniIds: universityIds,
    careerId: careerIds,
    careerIds: careerIds
  };

  const typedTargets = {
    university: universityIds,
    uni: universityIds,
    career: careerIds
  };

  const recordMissing = (file, key, value, target) => {
    report.references.brokenReferences.push({
      file: toPosix(file),
      key,
      value,
      target
    });
  };

  const checkReferenceValue = (file, key, value, targetSet, targetName) => {
    if (!targetSet || targetSet.size === 0) return;
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item != null && !targetSet.has(String(item))) {
          recordMissing(file, key, String(item), targetName);
        }
      });
      return;
    }
    if (value != null && !targetSet.has(String(value))) {
      recordMissing(file, key, String(value), targetName);
    }
  };

  const scan = (file, value) => {
    if (Array.isArray(value)) {
      value.forEach((item) => scan(file, item));
      return;
    }
    if (!isPlainObject(value)) return;

    const typeValue = typeof value.type === 'string' ? value.type : null;
    if (typeValue && 'id' in value && typedTargets[typeValue]) {
      checkReferenceValue(file, 'id', value.id, typedTargets[typeValue], typeValue);
    }

    Object.entries(value).forEach(([key, val]) => {
      const targetSet = idKeyTargets[key];
      if (targetSet) {
        const targetName = key.includes('career') ? 'career' : 'university';
        checkReferenceValue(file, key, val, targetSet, targetName);
      }
      scan(file, val);
    });
  };

  parsed.forEach((data, file) => {
    scan(file, data);
  });

  report.summary.missingReferenceCount =
    report.references.missingCareerDetails.length +
    report.references.detailIdMismatch.length +
    report.references.missingTemplateGroups.length +
    report.references.missingSlotPromptGroups.length +
    report.references.brokenReferences.length;

  await fs.mkdir(path.join(dataRoot, 'meta'), { recursive: true });
  await fs.writeFile(
    path.join(dataRoot, 'meta', 'validation_report.json'),
    JSON.stringify(report, null, 2),
    'utf8'
  );

  console.log(`Validation finished. Report: ${toPosix(path.join(dataRoot, 'meta', 'validation_report.json'))}`);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
