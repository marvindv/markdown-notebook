import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NotebookPath, PagePath, SectionPath } from 'features/path/model';
import { DUMMY_NOTEBOOKS } from './dummy-data';
import Notebook, { RgbColor } from './model';
import {
  findNotebook,
  findNotebookIndex,
  findPage,
  findPageIndex,
  findSection,
  findSectionIndex,
} from './selection';

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

    changeNotebookTitle(
      state,
      action: PayloadAction<{ path: NotebookPath; newTitle: string }>
    ) {
      const { path, newTitle } = action.payload;
      const notebook = findNotebook(path, state);
      if (notebook) {
        notebook.title = newTitle;
      }
    },

    deleteNotebook(state, action: PayloadAction<NotebookPath>) {
      const path = action.payload;
      const notebookIndex = findNotebookIndex(path, state);
      if (notebookIndex !== undefined) {
        state.splice(notebookIndex, 1);
      }
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
      const notebook = findNotebook(path, state);
      if (notebook) {
        // TODO: Handle duplication?
        notebook.sections.push({ title, color, pages: [] });
      }
    },

    changeSectionTitle(
      state,
      action: PayloadAction<{ path: SectionPath; newTitle: string }>
    ) {
      const { path, newTitle } = action.payload;
      const { section } = findSection(path, state) || {};
      if (section) {
        section.title = newTitle;
      }
    },

    deleteSection(state, action: PayloadAction<SectionPath>) {
      const path = action.payload;
      const { notebook, sectionIndex } = findSectionIndex(path, state) || {};
      if (notebook && sectionIndex !== undefined) {
        notebook.sections.splice(sectionIndex, 1);
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
      const { section } = findSection(path, state) || {};
      if (section) {
        // TODO: Handle duplication?
        section.pages.push({ title, content });
      }
    },

    changePageTitle(
      state,
      action: PayloadAction<{ path: PagePath; newTitle: string }>
    ) {
      const { path, newTitle } = action.payload;
      const { page } = findPage(path, state) || {};
      if (page) {
        // TODO: Handle collision with existing pages?
        page.title = newTitle;
      }
    },

    changePageContent(
      state,
      action: PayloadAction<{ path: PagePath; content: string }>
    ) {
      const { path, content } = action.payload;
      const { page } = findPage(path, state) || {};
      if (page) {
        page.content = content;
      }
    },

    deletePage(state, action: PayloadAction<PagePath>) {
      const path = action.payload;
      const { section, pageIndex } = findPageIndex(path, state) || {};
      if (pageIndex !== undefined) {
        section?.pages.splice(pageIndex, 1);
      }
    },
  },
});

export const {
  addNotebook,
  changeNotebookTitle,
  deleteNotebook,
  addSection,
  changeSectionTitle,
  deleteSection,
  addPage,
  changePageTitle,
  changePageContent,
  deletePage,
} = notebooksSlice.actions;

export default notebooksSlice.reducer;
