import Notebook from './notebook';

export const DUMMY_NOTEBOOKS: Notebook[] = [
  {
    title: 'Allgemein',
    color: [255, 0, 0],
    sections: [
      {
        title: 'Ein Abschnitt',
        color: [10, 10, 10],
        pages: [
          {
            title: 'Übersicht',
            content: `# Übersicht\nHier könnte ihr Content stehen.`,
          },
          {
            title: '01 - Foo',
            content: `# Foo`,
          },
          {
            title: '02 - Bar',
            content: `# Bar`,
          },
        ],
      },
      {
        title: 'Ein anderer Abschnitt',
        color: [100, 100, 100],
        pages: [
          {
            title: 'Hallo',
            content: '# Hallo\nMit Absatz',
          },
          {
            title: 'Welt',
            content: '# Welt\nToller Text',
          },
        ],
      },
    ],
  },
  {
    title: 'Tinkering',
    color: [0, 255, 0],
    sections: [
      {
        title: 'Erster Abschnitt',
        color: [10, 10, 10],
        pages: [
          {
            title: 'Erste Seite',
            content: '# Erste Seite',
          },
          {
            title: 'Zweite Seite',
            content: '# Zweite Seite',
          },
        ],
      },
      {
        title: 'Zweiter Abschnitt',
        color: [0, 0, 255],
        pages: [
          {
            title: 'Erste Seite',
            content: '# Erste Seite',
          },
          {
            title: 'Zweite Seite',
            content: '# Zweite Seite',
          },
        ],
      },
    ],
  },
];

export const DUMMY_PATH = {
  notebookTitle: 'Allgemein',
  sectionTitle: 'Ein Abschnitt',
  pageTitle: '01 - Foo',
};
