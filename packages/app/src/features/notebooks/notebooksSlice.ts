import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import getApi from 'api';
import Notebook from 'models/notebook';
import Path, {
  EmptyPath,
  NotebookPath,
  PagePath,
  SectionPath,
} from 'models/path';
import {
  findAllUnsavedPages,
  findNotebook,
  findNotebookIndex,
  findPage,
  findPageIndex,
  findSection,
  findSectionIndex,
  findUnsavedPagesOfNotebook,
  findUnsavedPagesOfSection,
} from './selection';

export interface State {
  isFetching: boolean;
  savePending: boolean;
  unsavedPages: PagesWithUnsavedChangesTree;
  notebooks: Notebook[];
}

/**
 * Describes an object allowing for O(1) lookup of the state of unsaved changes
 * of a page inside its section and notebook.
 */
export type PagesWithUnsavedChangesTree = {
  [notebookTitle: string]:
    | {
        [sectionTitle: string]:
          | {
              [pageTitle: string]: true | undefined;
            }
          | undefined;
      }
    | undefined;
};

export const fetchNotebooks = createAsyncThunk('notebooks/fetch', async () => {
  const result = await getApi().fetchNotebooks();
  return result;
});

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
    const result = await getApi().addEntity(payload.path);
    return result;
  }
);

/**
 * Changes the title of a notebooks entity specified by its path. That can be
 * either a notebook, a section or a single page.
 */
export const changeEntityTitle = createAsyncThunk(
  'notebooks/changeEntityTitle',
  async (payload: { path: Path; newTitle: string }, thunkApi) => {
    const { path, newTitle } = payload;
    const result = await getApi().changeEntityTitle(path, newTitle);
    return result;
  }
);

/**
 * Deletes the entity specified by the given path.
 */
export const deleteEntity = createAsyncThunk(
  'notebooks/deleteEntity',
  async (payload: Path, thunkApi) => {
    const result = await getApi().deleteEntity(payload);
    return result;
  }
);

/**
 * Submits the current content of the page specified by the given path to the
 * backend.
 */
export const savePageContent = createAsyncThunk(
  'notebooks/savePageContent',
  async (payload: { path: PagePath }, thunkApi) => {
    const { path } = payload;
    const { notebooks } = (thunkApi.getState() as {
      notebooks: State;
    }).notebooks;

    const { page } = findPage(path, notebooks) || {};
    if (page) {
      const content = page.content;
      await getApi().setPageContent(path, content);
    } else {
      throw new Error('Page not found.');
    }
  }
);

export const saveManyPostsContent = createAsyncThunk(
  'notebooks/saveManyPostsContent',
  async (
    payload: { path: SectionPath | NotebookPath | EmptyPath },
    thunkApi
  ) => {
    const { path } = payload;
    const { unsavedPages } = (thunkApi.getState() as {
      notebooks: State;
    }).notebooks;

    const pagePaths: PagePath[] = [];
    if (path.sectionTitle) {
      // Get all unsaved pages from that section.
      pagePaths.push(
        ...findUnsavedPagesOfSection(unsavedPages, path as SectionPath)
      );
    } else if (path.notebookTitle) {
      // Get all unsaved pages from that notebook.
      pagePaths.push(
        ...findUnsavedPagesOfNotebook(unsavedPages, path as NotebookPath)
      );
    } else {
      // EmptyPath, which means save all unsaved pages of all notebooks.
      pagePaths.push(...findAllUnsavedPages(unsavedPages));
    }

    const result = await Promise.allSettled(
      pagePaths.map(path => thunkApi.dispatch(savePageContent({ path })))
    );

    // TODO: Reject or resolve when any promise was rejected?
  }
);

/**
 * Sets the unsaved flag for the page specified by the given path.
 *
 * @param {PagePath} path
 * @param {PagesWithUnsavedChangesTree} unsavedPages
 */
function setUnsavedChangesForPage(
  path: PagePath,
  unsavedPages: PagesWithUnsavedChangesTree
) {
  if (!unsavedPages[path.notebookTitle]) {
    unsavedPages[path.notebookTitle] = {};
  }

  if (!unsavedPages[path.notebookTitle]?.[path.sectionTitle]) {
    unsavedPages[path.notebookTitle]![path.sectionTitle] = {};
  }

  unsavedPages[path.notebookTitle]![path.sectionTitle]![path.pageTitle] = true;
}

const notebooksSlice = createSlice({
  name: 'notebooks',
  initialState: {
    isFetching: false,
    savePending: false,
    unsavedPages: {},
    notebooks: [],
  } as State,
  extraReducers: builder => {
    builder.addCase(fetchNotebooks.pending, state => {
      state.isFetching = true;
    });

    builder.addCase(fetchNotebooks.rejected, state => {
      state.isFetching = false;
    });

    builder.addCase(fetchNotebooks.fulfilled, (state, { payload }) => {
      const notebooks = payload;
      state.isFetching = false;
      state.notebooks = notebooks;
    });

    builder.addCase(addEntity.fulfilled, (state, { payload }) => {
      // Add the entity to our store as soon as its saved on the backend.
      const { actualPath: path } = payload;
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
      // store. Especially update unsavedPages.
      const { oldPath: path, newTitle } = payload;
      if (path.pageTitle) {
        const { page } = findPage(path, state.notebooks) || {};
        if (page) {
          page.title = newTitle;
        }

        // If the page has currently unsaved changes, remove the unsaved changes
        // state for the old title and set it for the new.
        const hasUnsavedChanges =
          state.unsavedPages[path.notebookTitle]?.[path.sectionTitle]?.[
            path.pageTitle
          ];
        if (hasUnsavedChanges) {
          const unsavedChangesSection = state.unsavedPages[path.notebookTitle]![
            path.sectionTitle
          ];
          delete unsavedChangesSection?.[path.pageTitle];
          unsavedChangesSection![newTitle] = true;
        }
      } else if (path.sectionTitle) {
        const { section } = findSection(path, state.notebooks) || {};
        if (section) {
          section.title = newTitle;
        }

        // If the section contains unsaved pages, cache the whole section
        // object, set it for the new section title and remove it for the old
        // title.
        const unsavedChangesSection =
          state.unsavedPages[path.notebookTitle]?.[path.sectionTitle];
        if (unsavedChangesSection) {
          state.unsavedPages[path.notebookTitle]![
            newTitle
          ] = unsavedChangesSection;
          delete state.unsavedPages[path.notebookTitle]?.[path.sectionTitle];
        }
      } else if (path.notebookTitle) {
        const notebook = findNotebook(path, state.notebooks);
        if (notebook) {
          notebook.title = newTitle;
        }

        // If the notebook contains unsaved pages, cache the whole notebook
        // object, set it for the new notebook title and remove it for the old
        // title.
        const unsavedChangesNotebook = state.unsavedPages[path.notebookTitle];
        if (unsavedChangesNotebook) {
          state.unsavedPages[newTitle] = unsavedChangesNotebook;
          delete state.unsavedPages[path.notebookTitle];
        }
      }
    });

    builder.addCase(deleteEntity.fulfilled, (state, { payload }) => {
      // Remove the entity after it was removed from the backend.
      const { notebooks } = state;
      const { path } = payload;

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

    builder.addCase(savePageContent.pending, (state, action) => {
      const { path } = action.meta.arg;
      state.savePending = true;

      // Optimistically remove the page from the unsaved pages so if the user
      // continues to type while save is pending, the page will be marked as
      // unsaved event after fulfillment.
      const notebookChanges = state.unsavedPages[path.notebookTitle];
      const sectionChanges = notebookChanges?.[path.sectionTitle];
      delete sectionChanges?.[path.pageTitle];
      if (Object.keys(sectionChanges || {}).length === 0) {
        // This page was the last page in this section with unsaved changes, so
        // delete the whole section from unsavedPages.
        delete notebookChanges?.[path.sectionTitle];
      }

      if (Object.keys(notebookChanges || {}).length === 0) {
        // The page was the last page in this notebook with unsaved changes, so
        // delete the whole notebook from unsavedPages.
        delete state.unsavedPages[path.notebookTitle];
      }
    });

    builder.addCase(savePageContent.rejected, (state, action) => {
      const { path } = action.meta.arg;
      state.savePending = false;
      // Since the saving failed, we have to ensure unsavedPages contains this
      // page.
      setUnsavedChangesForPage(path, state.unsavedPages);
    });

    builder.addCase(savePageContent.fulfilled, state => {
      // Nothing to do. The page is already removed from unsavedPages in
      // savePageContent.pending case.
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
        setUnsavedChangesForPage(path, state.unsavedPages);
      }
    },
  },
});

export const { changePageContent } = notebooksSlice.actions;

export default notebooksSlice.reducer;
