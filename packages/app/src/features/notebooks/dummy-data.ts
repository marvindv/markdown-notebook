import Notebook from 'models/notebook';

export const DUMMY_NOTEBOOKS: Notebook[] = [
  {
    title: 'Allgemein',
    sections: [
      {
        title: 'Ein Abschnitt',
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
    sections: [
      {
        title: 'Erster Abschnitt',
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
        title: 'Markdown Notebook',
        pages: [
          {
            title: 'Markdown Formatierung',
            content:
              '# Markdown Formatierung\n\n## Heading 2\n\n**Some bold text.**\n\n*Some italic text*\n\n> Some awesome blockquote\n\n1. first item\n2. second item\n3. third item\n\n`inline code`\n\n---\n\n- item 1\n- item 2\n  * subitem 1\n  * subitem 2\n- item 3\n\n',
          },
        ],
      },
    ],
  },
];
