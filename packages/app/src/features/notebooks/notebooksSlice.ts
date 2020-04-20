import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import Notebook, { RgbColor } from './model';
import { NotebookPath, SectionPath, PagePath } from 'features/path/model';
import { DUMMY_NOTEBOOKS } from './dummy-data';

const notebooksSlice = createSlice({
  name: 'notebooks',
  initialState: DUMMY_NOTEBOOKS as Notebook[],
  reducers: {
    addNotebook(
      state,
      action: PayloadAction<{ title: string; color: RgbColor }>
    ) {
      const { title, color } = action.payload;
      // TODO: Avoid duplicates?
      state.push({ title, color, sections: [] });
    },

    addSection(
      state,
      action: PayloadAction<{
        path: NotebookPath;
        title: string;
        color: RgbColor;
      }>
    ) {
      const { path, title, color } = action.payload;
      // TODO: Handle invalid path?
      const notebook = state.find(
        notebook => notebook.title === path.notebookTitle
      );
      if (notebook) {
        // TODO: Handle duplication?
        notebook.sections.push({ title, color, pages: [] });
      }
    },

    addPage(
      state,
      action: PayloadAction<{
        path: SectionPath;
        title: string;
        content: string;
      }>
    ) {
      const { path, title, content } = action.payload;
      // TODO: Handle invalid path?
      const notebook = state.find(n => n.title === path.notebookTitle);
      const section = notebook?.sections.find(
        s => s.title === path.sectionTitle
      );

      if (section) {
        // TODO: Handle duplication?
        section.pages.push({ title, content });
      }
    },

    changePageContent(
      state,
      action: PayloadAction<{ path: PagePath; content: string }>
    ) {
      const { path, content } = action.payload;
      const notebook = state.find(n => n.title === path.notebookTitle);
      const section = notebook?.sections.find(
        s => s.title === path.sectionTitle
      );
      const page = section?.pages.find(p => p.title === path.pageTitle);

      if (page) {
        page.content = content;
      }
    },
  },
});

export const {
  addNotebook,
  addSection,
  addPage,
  changePageContent,
} = notebooksSlice.actions;

export default notebooksSlice.reducer;
