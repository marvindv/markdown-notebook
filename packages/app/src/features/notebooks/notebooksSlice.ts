import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import Notebook from 'models/notebook';
import Path, { PagePath } from 'models/path';
import { DUMMY_NOTEBOOKS } from './dummy-data';
import {
  findNotebook,
  findNotebookIndex,
  findPage,
  findPageIndex,
  findSection,
  findSectionIndex,
} from './selection';

/**
 * Adds a new notebooks entity specified by its own path.
 *
 * That means to to add a new page to an existing section, provide a
 * {@link PagePath}, to add a section, provide a {@link SectionPath} and so on
 * where the most inner component of the path, e.g. the page name, must be new.
 */
export const addEntity = createAsyncThunk(
  'notebooks/addEntity',
  async (payload: { path: Path }, thunkApi) => {
    return Promise.resolve(payload);
  }
);

/**
 * Changes the title of a notebooks entity specified by its path. That can be
 * either a notebook, a section or a single page.
 */
export const changeEntityTitle = createAsyncThunk(
  'notebooks/changeEntityTitle',
  async (payload: { path: Path; newTitle: string }, thunkApi) => {
    return Promise.resolve(payload);
  }
);

/**
 * Deletes the entity specified by the given path.
 */
export const deleteEntity = createAsyncThunk(
  'notebooks/deleteEntity',
  async (payload: Path, thunkApi) => {
    return Promise.resolve(payload);
  }
);

const notebooksSlice = createSlice({
  name: 'notebooks',
  initialState: {
    isFetching: false,
    notebooks: DUMMY_NOTEBOOKS as Notebook[],
  },
  extraReducers: builder => {
    builder.addCase(addEntity.fulfilled, (state, { payload }) => {
      // Add the entity to our store as soon as its saved on the backend.
      const { path } = payload;
      const { notebooks } = state;

      if (path.pageTitle) {
        notebooks
          .find(n => n.title === path.notebookTitle)
          ?.sections.find(s => s.title === path.sectionTitle)
          ?.pages.push({
            title: path.pageTitle,
            content: '',
          });
      } else if (path.sectionTitle) {
        notebooks
          .find(n => n.title === path.notebookTitle)
          ?.sections.push({ title: path.sectionTitle, pages: [] });
      } else if (path.notebookTitle) {
        notebooks.push({ title: path.notebookTitle, sections: [] });
      }
    });

    builder.addCase(changeEntityTitle.fulfilled, (state, { payload }) => {
      // After the title change is completed by the backend, apply it to our
      // store.
      const { path, newTitle } = payload;
      if (path.pageTitle) {
        const { page } = findPage(path, state.notebooks) || {};
        if (page) {
          page.title = newTitle;
        }
      } else if (path.sectionTitle) {
        const { section } = findSection(path, state.notebooks) || {};
        if (section) {
          section.title = newTitle;
        }
      } else if (path.notebookTitle) {
        const notebook = findNotebook(path, state.notebooks);
        if (notebook) {
          notebook.title = newTitle;
        }
      }
    });

    builder.addCase(deleteEntity.fulfilled, (state, { payload }) => {
      // Remove the entity after it was removed from the backend.
      const { notebooks } = state;
      const path = payload;

      if (path.pageTitle) {
        const { section, pageIndex } = findPageIndex(path, notebooks) || {};
        if (pageIndex !== undefined) {
          section?.pages.splice(pageIndex, 1);
        }
      } else if (path.sectionTitle) {
        const { notebook, sectionIndex } =
          findSectionIndex(path, notebooks) || {};
        if (sectionIndex !== undefined) {
          notebook?.sections.splice(sectionIndex, 1);
        }
      } else if (path.notebookTitle) {
        const notebookIndex = findNotebookIndex(path, notebooks);
        if (notebookIndex !== undefined) {
          notebooks.splice(notebookIndex, 1);
        }
      }
    });
  },
  reducers: {
    changePageContent(
      state,
      action: PayloadAction<{ path: PagePath; content: string }>
    ) {
      const { path, content } = action.payload;
      const { page } = findPage(path, state.notebooks) || {};
      if (page) {
        page.content = content;
      }
    },
  },
});

export const { changePageContent } = notebooksSlice.actions;

export default notebooksSlice.reducer;
