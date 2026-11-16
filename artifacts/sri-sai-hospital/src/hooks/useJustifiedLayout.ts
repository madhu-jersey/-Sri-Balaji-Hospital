import { useLayoutEffect, useState, type RefObject } from 'react';

export type JustifiedBox = { width: number; height: number };

/*
  Justified rows: photos are packed into rows of equal height that exactly fill the container width,
  each photo sized to its own shape (ratio = width / height), so nothing is cropped.
  A short last row is merged into the row above, so every row ends flush with the right edge.
*/
export function justify(ratios: number[], containerWidth: number, targetHeight: number, gap: number, maxPerRow = Infinity): JustifiedBox[] {
  if (!containerWidth || !ratios.length) return ratios.map(() => ({ width: 0, height: 0 }));
  const rows: number[][] = [];
  let current: number[] = [];
  let sum = 0;
  ratios.forEach((ratio, index) => {
    current.push(index);
    sum += ratio;
    const naturalWidth = sum * targetHeight + gap * (current.length - 1);
    if (naturalWidth >= containerWidth || current.length >= maxPerRow) {
      rows.push(current);
      current = [];
      sum = 0;
    }
  });
  if (current.length) {
    const lastSum = current.reduce((total, index) => total + ratios[index], 0);
    const lastWidth = lastSum * targetHeight + gap * (current.length - 1);
    // A last row under ~60% full joins the previous row; otherwise it stretches to the full width.
    if (rows.length && lastWidth < containerWidth * 0.6) rows[rows.length - 1].push(...current);
    else rows.push(current);
  }

  const boxes: JustifiedBox[] = new Array(ratios.length);
  rows.forEach((row) => {
    const rowSum = row.reduce((total, index) => total + ratios[index], 0);
    const available = containerWidth - gap * (row.length - 1);
    // Cap the height so a row with a single wide photo does not become enormous.
    const height = Math.min(available / rowSum, targetHeight * 1.8);
    let used = 0;
    row.forEach((index, position) => {
      const isLast = position === row.length - 1;
      const exact = ratios[index] * height;
      // The last photo absorbs rounding so the row ends exactly at the edge (when the row fills the width).
      const width = isLast && height < targetHeight * 1.8 ? available - used : Math.floor(exact);
      used += width;
      boxes[index] = { width, height: Math.round(height) };
    });
  });
  return boxes;
}

export function useJustifiedLayout(
  containerRef: RefObject<HTMLElement | null>,
  ratios: number[],
  options: (width: number) => { rowHeight: number; gap: number; maxPerRow?: number },
) {
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const update = () => setWidth(element.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [containerRef]);

  const { rowHeight, gap, maxPerRow } = options(width);
  return { boxes: justify(ratios, width, rowHeight, gap, maxPerRow), gap };
}

// Row height and gap per screen width, shared by the home preview and the gallery page.
export function galleryRowOptions(width: number) {
  if (width < 520) return { rowHeight: 150, gap: 8, maxPerRow: 2 };
  if (width < 900) return { rowHeight: 210, gap: 12 };
  return { rowHeight: 280, gap: 16 };
}
