/**
 * ML PREDICTION MODULE
 * =====================
 * The project guide's pipeline trains a MobileNetV2-based CNN in
 * TensorFlow/Keras (Phase 3) and exports it to TensorFlow Lite (.tflite)
 * for inference. That trained model does not exist yet until Phases 1-3
 * (data collection -> labelling -> training) are completed.
 *
 * To keep this backend fully working right now, this file implements a
 * TRANSPARENT HEURISTIC placeholder based on the same colour-science cues
 * the guide describes (gill redness, eye clarity/contrast) using the
 * `sharp` image library. It is NOT the trained CNN — treat its output as
 * a stand-in so the rest of the app (auth, history, admin, mobile UI) can
 * be built and tested end-to-end before the model is ready.
 *
 * HOW TO SWAP IN THE REAL MODEL LATER (pick one):
 *
 * 1) Python microservice (recommended, matches the guide's stack):
 *    Run a small FastAPI service that loads freshness_model.tflite and
 *    exposes POST /infer. Replace the body of predictFreshness() below
 *    with an HTTP call (axios/fetch) to that service, forwarding the image.
 *
 * 2) Node-native inference:
 *    Convert the Keras model to ONNX or TF SavedModel and run it with
 *    `onnxruntime-node` or `@tensorflow/tfjs-node` directly in this file,
 *    instead of the heuristic below.
 *
 * Either way, keep the same function signature so routes/predict.js does
 * not need to change.
 */

const sharp = require("sharp");

async function predictFreshness(imagePath) {
  const image = sharp(imagePath);
  const { data, info } = await image
    .resize(224, 224, { fit: "cover" }) // match the guide's CNN input size
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { channels } = info;
  let rSum = 0, gSum = 0, bSum = 0;
  const pixelCount = data.length / channels;

  for (let i = 0; i < data.length; i += channels) {
    rSum += data[i];
    gSum += data[i + 1];
    bSum += data[i + 2];
  }

  const rMean = rSum / pixelCount;
  const gMean = gSum / pixelCount;
  const bMean = bSum / pixelCount;
  const totalMean = rMean + gMean + bMean || 1;

  // Redness ratio: bright red/pink gills score higher; brown/grey gills lower.
  const rednessRatio = rMean / totalMean; // roughly 0.33 = neutral, higher = redder

  // Contrast/clarity proxy: a clear convex cornea has more local contrast
  // than a cloudy, flat one. Use standard deviation of luminance.
  const stats = await sharp(imagePath).resize(224, 224, { fit: "cover" }).stats();
  const luminanceStdDev = stats.channels[0].stdev; // 0-~80 typical range

  // Combine both cues into a single 0-100 "freshness score".
  // Weights are illustrative, not scientifically calibrated -
  // replace this whole function with real model inference for production use.
  const rednessScore = Math.min(100, Math.max(0, (rednessRatio - 0.28) * 600));
  const clarityScore = Math.min(100, Math.max(0, luminanceStdDev * 1.4));
  const freshnessScore = rednessScore * 0.5 + clarityScore * 0.5;

  let result;
  let explanation;
  if (freshnessScore >= 60) {
    result = "FRESH";
    explanation = "Bright colour and high contrast detected, consistent with a clear cornea and bright red gills (0-8h post-catch).";
  } else if (freshnessScore >= 35) {
    result = "MEDIUM";
    explanation = "Moderate colour and contrast detected, consistent with slightly cloudy eyes and pinkish-red gills (8-24h post-catch).";
  } else {
    result = "SPOILED";
    explanation = "Low colour saturation and contrast detected, consistent with cloudy/sunken eyes and brown-grey gills (24h+ post-catch).";
  }

  // Confidence is just distance from the nearest threshold here -
  // a real model should report softmax probability instead.
  const confidence = Math.round(50 + Math.min(50, Math.abs(freshnessScore - 47.5)));

  return {
    result,
    confidence,
    explanation,
    modelType: "heuristic-placeholder", // flip to "cnn-mobilenetv2" once the real model is wired in
    debug: { rednessScore: Math.round(rednessScore), clarityScore: Math.round(clarityScore) },
  };
}

module.exports = { predictFreshness };
