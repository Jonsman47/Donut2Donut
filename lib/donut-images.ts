import fs from "fs";
import path from "path";

const donutCandidates = [
  "donut1.jpg",
  "donut1.png",
  "donut2.jpg",
  "donut2.png",
  "donut3.jpg",
  "donut3.png",
];

let cached: string[] | null = null;

export function getAvailableDonutImages() {
  if (cached) {
    return cached;
  }

  const publicDir = path.join(process.cwd(), "public");
  cached = donutCandidates
    .filter((file) => fs.existsSync(path.join(publicDir, file)))
    .map((file) => `/${file}`);
  return cached;
}

export function pickDonutImage(index = 0) {
  const available = getAvailableDonutImages();
  if (available.length === 0) {
    return "/donut1.jpg";
  }
  return available[index % available.length];
}
