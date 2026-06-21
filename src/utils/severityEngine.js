export function calculateSeverity(data) {
  let score = 0;

  if (data.heart_rate > 120) score += 30;
  if (data.heart_rate < 45) score += 30;

  if (data.spo2 < 92) score += 40;

  if (data.fall) score += 50;

  if (data.motion === "Unstable") score += 20;

  return Math.min(score, 100);
}

export function getSeverityLevel(score) {
  if (score <= 30) return "Stable 🟢";
  if (score <= 60) return "Warning 🟡";
  return "Critical 🔴";
}