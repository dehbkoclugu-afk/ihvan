export interface ArtSize { width: number; height: number }
export interface ArtFocalPoint { x: number; y: number }
export interface ArtCropFrame extends ArtSize { left: number; top: number }

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const isPositiveFinite = (value: number) => Number.isFinite(value) && value > 0;
const normalizeFocalCoordinate = (value: number) => Number.isFinite(value) ? clamp(value, 0, 1) : 0.5;

export function coverCropFrame(container: ArtSize, source: ArtSize, focalPoint: ArtFocalPoint = { x: 0.5, y: 0.5 }): ArtCropFrame | null {
  if (![container.width, container.height, source.width, source.height].every(isPositiveFinite)) return null;
  const scale = Math.max(container.width / source.width, container.height / source.height);
  const width = source.width * scale;
  const height = source.height * scale;
  const x = normalizeFocalCoordinate(focalPoint.x);
  const y = normalizeFocalCoordinate(focalPoint.y);
  return {
    width,
    height,
    left: clamp(container.width / 2 - width * x, container.width - width, 0),
    top: clamp(container.height / 2 - height * y, container.height - height, 0),
  };
}
