/*
  Gallery photos load automatically from src/assets/gallery/.

  To add a photo, drop it into a folder named after the area it shows, for example:
    src/assets/gallery/reception/front-desk.jpg
    src/assets/gallery/icu/icu-beds-2.webp
    src/assets/gallery/ward/general-ward.png
  - Any size or shape works (portrait, landscape, square); nothing is cropped.
  - The folder becomes the filter on the gallery page ("icu" -> "ICU", "waiting-area" -> "Waiting area").
  - The file name becomes the caption ("front-desk.jpg" -> "Front desk"; trailing numbers are dropped).
  - Photos are shown in folder order below, then alphabetically by file name.
  Supported: .jpg .jpeg .png .webp .avif
*/

export type GalleryItem = {
  id: string;
  src: string;
  alt: string;
  caption: string;
  category: string;
  categoryLabel: string;
};

// Folders listed here appear first, in this order; any other folder follows alphabetically.
const categoryOrder = ['building', 'reception', 'consultation', 'waiting-area', 'ward', 'icu', 'operation-theatre'];

// Labels that plain capitalisation would get wrong.
const labelOverrides: Record<string, string> = {
  icu: 'ICU',
  'operation-theatre': 'Operation theatre',
  consultation: 'Consultation room',
};

const files = import.meta.glob<string>('../assets/gallery/**/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP}', {
  eager: true,
  query: '?url',
  import: 'default',
});

function toLabel(slug: string) {
  if (labelOverrides[slug]) return labelOverrides[slug];
  const words = slug.replace(/[_-]+/g, ' ').replace(/\s+\d+$/, '').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function categoryRank(category: string) {
  const index = categoryOrder.indexOf(category);
  return index === -1 ? categoryOrder.length : index;
}

const uploaded: GalleryItem[] = Object.entries(files)
  .map(([path, src]) => {
    const parts = path.split('/');
    const fileName = parts[parts.length - 1].replace(/\.[^.]+$/, '');
    const folder = parts.length > 4 ? parts[parts.length - 2].toLowerCase() : 'other';
    const caption = toLabel(fileName.toLowerCase());
    return {
      id: path,
      src,
      alt: `${caption}, Sri Balaji Hospital`,
      caption,
      category: folder,
      categoryLabel: folder === 'other' ? 'Other' : toLabel(folder),
    };
  })
  .sort((a, b) => categoryRank(a.category) - categoryRank(b.category)
    || a.category.localeCompare(b.category)
    || a.id.localeCompare(b.id, undefined, { numeric: true }));

// The building photo already used in the hero always leads the gallery.
export const galleryItems: GalleryItem[] = [
  {
    id: 'building',
    src: '/assets/hero-sri-balaji-building.webp',
    alt: 'Sri Balaji Hospital building with its Telugu name board',
    caption: 'Hospital building',
    category: 'building',
    categoryLabel: 'Building',
  },
  ...uploaded,
];

export const galleryCategories: { value: string; label: string }[] = Array.from(
  new Map(galleryItems.map((item) => [item.category, item.categoryLabel])),
  ([value, label]) => ({ value, label }),
);
