import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NotebookPath, PagePath, SectionPath } from 'src/models/path';

/**
 * An object mapping a notebook title to a set of section titles that are
 * currently in editing mode.
 */
export type EditingSections = {
  [notebookTitle: string]: { [sectionTitle: string]: true };
};

/**
 * An object mapping a notebook title to an object mapping a section title to
 * a set of page titles.
 */
export type EditingPages = {
  [notebookTitle: string]: {
    [sectionTitle: string]: { [pageTitle: string]: true };
  };
};

export interface TitleEditingState {
  /**
   * A set that contains all notebook titles that are currently edited.
   *
   * @type {{ [notebookTitle: string]: true }}
   * @memberof TitleEditingState
   */
  notebooks: { [notebookTitle: string]: true };

  /**
   * An object mapping a notebook title to a set of section titles that are
   * currently in editing mode.
   *
   * @type {EditingSections}
   * @memberof TitleEditingState
   */
  sections: EditingSections;

  /**
   * An object mapping a notebook title to an object mapping a section title to
   * a set of page titles.
   *
   * @type {EditingPages}
   * @memberof TitleEditingState
   */
  pages: EditingPages;
}

/**
 * Manages the state of title editing around the Navigation component. This
 * enables to enable title editing for a notebook, section or page from outside
 * of the specific element, for situations like creating a new page which title
 * should be edited upon creation.
 */
const titleEditingSlice = createSlice({
  name: 'titleEditing',
  initialState: {
    notebooks: {},
    sections: {},
    pages: {},
  } as TitleEditingState,
  reducers: {
    setNotebookEditing(
      state,
      action: PayloadAction<{ path: NotebookPath; isEditing: boolean }>
    ) {
      const { path, isEditing } = action.payload;
      if (isEditing) {
        state.notebooks[path.notebookTitle] = true;
      } else {
        delete state.notebooks[path.notebookTitle];
      }
    },
    setSectionEditing(
      state,
      action: PayloadAction<{ path: SectionPath; isEditing: boolean }>
    ) {
      const { path, isEditing } = action.payload;
      if (isEditing) {
        if (!state.sections[path.notebookTitle]) {
          state.sections[path.notebookTitle] = {};
        }

        state.sections[path.notebookTitle][path.sectionTitle] = true;
      } else {
        delete state.sections[path.notebookTitle]?.[path.sectionTitle];
      }
    },
    setPageEditing(
      state,
      action: PayloadAction<{ path: PagePath; isEditing: boolean }>
    ) {
      const { path, isEditing } = action.payload;
      if (isEditing) {
        if (!state.pages[path.notebookTitle]) {
          state.pages[path.notebookTitle] = {
            [path.sectionTitle]: {},
          };
        }

        if (!state.pages[path.notebookTitle][path.sectionTitle]) {
          state.pages[path.notebookTitle][path.sectionTitle] = {};
        }

        state.pages[path.notebookTitle][path.sectionTitle][
          path.pageTitle
        ] = true;
      } else {
        delete state.pages[path.notebookTitle]?.[path.sectionTitle]?.[
          path.pageTitle
        ];
      }
    },
  },
});

export const {
  setNotebookEditing,
  setSectionEditing,
  setPageEditing,
} = titleEditingSlice.actions;

export default titleEditingSlice.reducer;
