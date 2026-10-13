import type { MobileNet } from '@tensorflow-models/mobilenet';
import { Severity } from './types';

// Waste-related ImageNet class keywords
const HIGH_SEVERITY_KEYWORDS = [
  'garbage', 'trash', 'waste', 'dump', 'landfill', 'junkyard',
  'dumpster', 'debris', 'pollution', 'sewer', 'swill',
];

const MEDIUM_SEVERITY_KEYWORDS = [
  'plastic bag', 'bottle', 'can', 'carton', 'container',
  'bucket', 'crate', 'basket', 'bag', 'packet',
  'cardboard', 'paper', 'box', 'wrapper',
];

const LOW_SEVERITY_KEYWORDS = [
  'cup', 'mug', 'plate', 'napkin', 'tissue',
  'straw', 'lid', 'cork', 'cap',
];

let modelPromise: Promise<MobileNet | null> | null = null;

async function loadModel() {
  if (!modelPromise) {
    modelPromise = (async () => {
      try {
        const tf = await import('@tensorflow/tfjs');
        const mobilenet = await import('@tensorflow-models/mobilenet');
        await tf.ready();
        return await mobilenet.load({ version: 2, alpha: 0.5 });
      } catch (e) {
        console.warn('AI Model failed to load, skipping severity suggestion:', e);
        return null;
      }
    })();
  }
  return modelPromise;
}

export async function suggestSeverity(imageElement: HTMLImageElement): Promise<Severity | null> {
  try {
    const model = await loadModel();
    if (!model) return null;

    const predictions = await model.classify(imageElement, 10);

    let score = 0;
    for (const pred of predictions) {
      const className = pred.className.toLowerCase();
      const confidence = pred.probability;

      for (const kw of HIGH_SEVERITY_KEYWORDS) {
        if (className.includes(kw)) score += confidence * 3;
      }
      for (const kw of MEDIUM_SEVERITY_KEYWORDS) {
        if (className.includes(kw)) score += confidence * 2;
      }
      for (const kw of LOW_SEVERITY_KEYWORDS) {
        if (className.includes(kw)) score += confidence * 1;
      }
    }

    if (score > 1.5) return 'high';
    if (score > 0.5) return 'medium';
    if (score > 0) return 'low';

    // Fallback heuristic: if many objects detected with high confidence, assume medium
    const totalConfidence = predictions.reduce((sum, p) => sum + p.probability, 0);
    if (totalConfidence > 3) return 'medium';
    if (totalConfidence > 1.5) return 'low';

    return null;
  } catch {
    return null;
  }
}

// Pre-warm the model on idle
export function preloadModel() {
  if (typeof window !== 'undefined') {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => loadModel());
    } else {
      setTimeout(() => loadModel(), 3000);
    }
  }
}
