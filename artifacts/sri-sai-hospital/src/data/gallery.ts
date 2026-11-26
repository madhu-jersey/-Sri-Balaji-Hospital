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
  - A leading number sets the order inside a folder and is not shown ("1-reception-counter.jpg" -> "Reception counter").
  - Captions that need capitals or punctuation ("OP", "Dr.") are set in captionOverrides below.
  Supported: .jpg .jpeg .png .webp .avif
*/

export type GalleryItem = {
  id: string;
  src: string;
  alt: string;
  caption: string;
  category: string;
  categoryLabel: string;
  sample?: boolean;
  // Which part of the photo stays in view when it is trimmed to an even tile (CSS object-position).
  focus?: string;
};

// Folders listed here appear first, in this order; any other folder follows alphabetically.
const categoryOrder = ['building', 'operation-theatre', 'icu', 'consultation', 'reception', 'waiting-area', 'rooms', 'ward', 'laboratory', 'facilities'];

// Captions that plain capitalisation would get wrong, keyed by file name (without its order number).
const captionOverrides: Record<string, string> = {
  'doctors-consultation-room': 'Dr. D. Billy Graham in the consultation room',
  'reception-and-op-waiting-hall': 'Reception and OP waiting hall',
  'op-waiting-hall': 'OP waiting hall',
  'patients-in-op-waiting-hall': 'Patients in the OP waiting hall',
};

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
    const fileName = parts[parts.length - 1].replace(/\.[^.]+$/, '').replace(/^\d+[-_ ]+/, '').toLowerCase();
    const folder = parts.length > 4 ? parts[parts.length - 2].toLowerCase() : 'other';
    const caption = captionOverrides[fileName] ?? toLabel(fileName);
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

/*
  Sample illustrations (src/assets/gallery-samples/) fill the gallery until real photos are added.
  They are drawn scenes, not photographs of this hospital, and are labelled "Sample" on the page.
  They disappear automatically once 4 or more real photos are in src/assets/gallery/.
*/
const sampleFiles = import.meta.glob<string>('../assets/gallery-samples/*.svg', { eager: true, query: '?url', import: 'default' });
const sampleOrder: { file: string; caption: string; category: string }[] = [
  { file: 'reception', caption: 'Reception', category: 'reception' },
  { file: 'ward', caption: 'Patient ward', category: 'ward' },
  { file: 'icu', caption: 'ICU', category: 'icu' },
  { file: 'waiting-area', caption: 'Waiting area', category: 'waiting-area' },
  { file: 'consultation-room', caption: 'Consultation room', category: 'consultation' },
];
const samples: GalleryItem[] = sampleOrder.flatMap(({ file, caption, category }) => {
  const src = sampleFiles[`../assets/gallery-samples/${file}.svg`];
  return src ? [{
    id: `sample-${file}`,
    src,
    alt: `Sample illustration of a hospital ${caption.toLowerCase()}`,
    caption,
    category,
    categoryLabel: toLabel(category),
    sample: true,
  }] : [];
});

// The building photo already used in the hero always leads the gallery.
export const galleryItems: GalleryItem[] = [
  {
    id: 'building',
    src: '/assets/hero-sri-balaji-building.webp',
    alt: 'Sri Balaji Hospital building with its Telugu name board',
    caption: 'Hospital building',
    category: 'building',
    categoryLabel: 'Building',
    focus: '50% 12%',
  },
  ...uploaded,
  ...(uploaded.length < 4 ? samples : []),
];

export const galleryCategories: { value: string; label: string }[] = Array.from(
  new Map(galleryItems.map((item) => [item.category, item.categoryLabel])),
  ([value, label]) => ({ value, label }),
);
