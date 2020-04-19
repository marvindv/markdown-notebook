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
            content: `# Übersicht\n\nHier könnte ihr Content stehen.\n`,
          },
          {
            title: '01 - Foo',
            content: `# Foo\n`,
          },
          {
            title: '02 - Bar',
            content: `# Bar\n`,
          },
        ],
      },
      {
        title: 'Ein anderer Abschnitt',
        color: [100, 100, 100],
        pages: [
          {
            title: 'Hallo',
            content: '# Hallo\n\nMit Absatz\n',
          },
          {
            title: 'Welt',
            content: '# Welt\n\nToller Text\n',
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
            content: '# Erste Seite\n',
          },
          {
            title: 'Zweite Seite',
            content: '# Zweite Seite\n',
          },
        ],
      },
      {
        title: 'Zweiter Abschnitt',
        color: [0, 0, 255],
        pages: [
          {
            title: 'Erste Seite',
            content: '# Erste Seite\n',
          },
          {
            title: 'Zweite Seite',
            content: '# Zweite Seite\n',
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
