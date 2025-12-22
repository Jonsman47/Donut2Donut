const donutImages = ["/donut1.jpg", "/donut2.png", "/donut3.png"].filter(
  Boolean
);

export function getDonutImage(index = 0) {
  if (donutImages.length === 0) {
    return "/donut1.jpg";
  }

  const safeIndex = Math.abs(index) % donutImages.length;
  return donutImages[safeIndex];
}

export function getDonutGallery() {
  return donutImages.length ? donutImages : ["/donut1.jpg"];
}
