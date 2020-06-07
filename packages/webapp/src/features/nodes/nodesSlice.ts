import {
  Action,
  createAsyncThunk,
  createSlice,
  PayloadAction,
  ThunkDispatch,
} from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import {
  DuplicateError,
  getApi,
  InvalidPathError,
  NotFoundError,
} from 'src/features/api';
import Node, {
  DirectoryNode,
  NodeName,
  Path,
  resolvePath,
  resolvePathWithParent,
} from 'src/models/node';
import {
  changeTreeNodeName,
  getNodeFromTree,
  NodeTree,
  NodeTreeNode,
  removePathFromTree,
  replaceTreePath,
  setLeafValue,
} from './NodeTree';

export interface State {
  isFetching: boolean;
  fetchError: null | string;
  savePending: boolean;
  unsavedNodes: NodesWithUnsavedChangesTree;
  root: DirectoryNode;
}

export type NodesWithUnsavedChangesTree = NodeTree<true>;

export type UnsavedChangesNode = NodeTreeNode<true>;

export const fetchNodes = createAsyncThunk('nodes/fetch', async () => {
  const api = getApi();
  if (!api) {
    throw new Error('No api installed.');
  }

  const result = await api.fetchNodes();
  return result;
});

export const addNode = createAsyncThunk(
  'nodes/addNode',
  async (payload: { parent: Path; node: Node }) => {
    const api = getApi();
    if (!api) {
      throw new Error('No api installed.');
    }

    const result = await api.addNode(payload.parent, payload.node);
    return result;
  }
);

export const changeNodeName = createAsyncThunk(
  'nodes/changeNodeName',
  async (payload: { path: Path; newName: NodeName }) => {
    const api = getApi();
    if (!api) {
      throw new Error('No api installed.');
    }

    const { path, newName } = payload;
    const result = await api.changeNodeName(path, newName);
    return result;
  }
);

export const deleteNode = createAsyncThunk(
  'nodes/deleteNode',
  async (payload: { path: Path }) => {
    const api = getApi();
    if (!api) {
      throw new Error('No api installed.');
    }

    const result = await api.deleteNode(payload.path);
    return result;
  }
);

export const savePageContent = createAsyncThunk(
  'nodes/savePageContent',
  async (payload: { path: Path }, thunkApi) => {
    const api = getApi();
    if (!api) {
      throw new Error('No api installed.');
    }

    const { path } = payload;
    const state = thunkApi.getState() as { nodes: State };
    const node = getNodeByPath(state.nodes.root, path);
    if (!node) {
      throw new InvalidPathError('Node does not exist.');
    }

    if (node.isDirectory) {
      throw new InvalidPathError('Node is a directory.');
    }

    await api.setPageContent(path, node.content);
  }
);

function getNodeByPath(root: DirectoryNode, path: Path): Node | undefined {
  let node: Node | undefined = root;
  for (const part of path) {
    node = node?.children?.[part];
  }

  return node;
}

/**
 * Recursivly traverse through the {@link UnsavedChangesNode} tree and calls
 * {@link savePageContent} for every unsaved file. Resolves when every content
 * save operation completed, either successfully or not.
 *
 * @param {ThunkDispatch<unknown, unknown, Action<any>>} dispatch
 * @param {Path} path
 * @param {(UnsavedChangesNode | undefined)} startUnsavedNode
 * @returns {Promise<void>}
 */
async function deepSaveMany(
  dispatch: ThunkDispatch<unknown, unknown, Action<any>>,
  path: Path,
  startUnsavedNode: UnsavedChangesNode | undefined
): Promise<void> {
  if (startUnsavedNode === true) {
    await dispatch(savePageContent({ path }));
    return;
  }

  if (startUnsavedNode === undefined) {
    throw new Error('Invalid node in unsavedNodes' + JSON.stringify(path));
  }

  await Promise.allSettled(
    Object.keys(startUnsavedNode).map(child =>
      deepSaveMany(dispatch, [...path, child], startUnsavedNode[child])
    )
  );
  return;
}

/**
 * Saves all pages that are descendants of the specified directory.
 */
export const saveManyPagesContent = createAsyncThunk(
  'nodes/saveManyPagesContent',
  async (payload: { path: Path }, thunkApi) => {
    const { path } = payload;
    const state = (thunkApi.getState() as {
      nodes: State;
    }).nodes;
    const { unsavedNodes } = state;

    // Find the node matching the given path in the unsavedNodes state.
    const unsavedNode = getNodeFromTree(unsavedNodes, path);

    if (unsavedNode === true) {
      // path points to a file.
      return thunkApi.dispatch(savePageContent({ path }));
    } else if (typeof unsavedNode === 'object') {
      // path points to a directory.
      return deepSaveMany(thunkApi.dispatch, path, unsavedNode);
    } else {
      // path points to something none existing.
      throw new InvalidPathError();
    }
  }
);

export const moveNode = createAsyncThunk(
  'nodes/moveNode',
  async (payload: { nodePath: Path; newParentPath: Path }) => {
    const api = getApi();
    if (!api) {
      throw new Error('No api installed.');
    }

    const { nodePath, newParentPath } = payload;

    const result = await api.moveNode(nodePath, newParentPath);
    return result;
  }
);

/**
 * Encapsulates the state that contains all notebook nodes as well as fetching,
 * error and unsaved nodes state.
 */
const nodesSlice = createSlice({
  name: 'nodes',
  initialState: {
    isFetching: false,
    fetchError: null,
    savePending: false,
    unsavedNodes: {},
    root: {
      name: '/',
      isDirectory: true,
      children: {},
    },
  } as State,
  reducers: {
    changePageContent(
      state,
      action: PayloadAction<{ path: Path; content: string }>
    ) {
      const { path, content } = action.payload;
      const node = resolvePath(path, state.root);
      if (node && !node.isDirectory) {
        node.content = content;
        addToUnsavedChanges(path, state.unsavedNodes);
      }
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchNodes.pending, state => {
      state.isFetching = true;
      state.fetchError = null;
    });

    builder.addCase(fetchNodes.rejected, (state, { error }) => {
      state.isFetching = false;
      state.fetchError = `${error.name} ${error.message}`;
      toast.error(`Failed to load nodes: ${error.name} ${error.message}`);
    });

    builder.addCase(fetchNodes.fulfilled, (state, { payload }) => {
      state.isFetching = false;
      state.root.children = {};
      for (const rootNode of payload) {
        state.root.children[rootNode.name] = rootNode;
      }

      state.unsavedNodes = {};
    });

    builder.addCase(addNode.rejected, (state, { error }) => {
      toast.error(`Failed to add node: ${error.name} ${error.message}`);
    });

    builder.addCase(addNode.fulfilled, (state, { payload }) => {
      const { parent: parentPath, node: addedNode } = payload;

      const parent = resolvePath(parentPath, state.root);
      if (parent && parent.isDirectory) {
        parent.children[addedNode.name] = addedNode;
      }
    });

    builder.addCase(changeNodeName.rejected, (state, { error }) => {
      toast.error(`Failed to change node name: ${error.name} ${error.message}`);
    });

    builder.addCase(changeNodeName.fulfilled, (state, { payload }) => {
      const { oldPath, newName } = payload;
      const result = resolvePathWithParent(oldPath, state.root);
      if (result) {
        const { parent, node } = result;
        const oldName = node.name;

        node.name = newName;
        if (parent) {
          delete parent.children[oldName];
          parent.children[newName] = node;
        }
      }

      // If the node or one of its childs has unsaved changes, update the tree.
      changeTreeNodeName(state.unsavedNodes, oldPath, newName);
    });

    builder.addCase(deleteNode.rejected, (state, { error }) => {
      console.error(error);
      toast.error(`Failed to delete node: ${error.name} ${error.message}`);
    });

    builder.addCase(deleteNode.fulfilled, (state, { payload }) => {
      const { path } = payload;
      const result = resolvePathWithParent(path, state.root);
      if (result) {
        const { parent, node } = result;
        delete parent?.children[node.name];
      }

      removeFromUnsavedChanges(path, state.unsavedNodes);
    });

    builder.addCase(savePageContent.pending, (state, action) => {
      const { path } = action.meta.arg;
      state.savePending = true;

      // Optimistically remove the page from the unsaved pages so if the user
      // continues to type while save is pending, the page will be marked as
      // unsaved event after fulfillment.
      removeFromUnsavedChanges(path, state.unsavedNodes);
    });

    builder.addCase(savePageContent.rejected, (state, action) => {
      const { path } = action.meta.arg;
      state.savePending = false;

      // Since the saving failed, we have to ensure unsavedChanges contains this
      // page.
      addToUnsavedChanges(path, state.unsavedNodes);
    });

    builder.addCase(savePageContent.fulfilled, state => {
      state.savePending = false;
      // Nothing to do. The page is already removed from unsavedPages in
      // savePageContent.pending case.
    });

    builder.addCase(saveManyPagesContent.rejected, (state, { error }) => {
      toast.error(
        `Failed to save multiple pages: ${error.name} ${error.message}`
      );
    });

    builder.addCase(moveNode.rejected, (state, { error }) => {
      toast.error(`Failed to move node: ${error.name} ${error.message}`);
    });

    builder.addCase(moveNode.fulfilled, (state, action) => {
      const { oldPath, newPath } = action.payload;

      const { root } = state;
      const name = oldPath[oldPath.length - 1];
      const oldParentPath = oldPath.slice(0, -1);
      const newParentPath = newPath.slice(0, -1);

      if (
        oldParentPath.length === newParentPath.length &&
        oldParentPath.every((p, i) => newParentPath[i] === p)
      ) {
        // Old and new parent are the same so nothing to do.
        return;
      }

      let oldParent: Node | undefined = root;
      for (const part of oldParentPath) {
        oldParent = oldParent?.children?.[part];
      }

      // This and the following error checks should obviously never happen.
      if (
        !oldParent ||
        !oldParent.isDirectory ||
        !oldParent.children.hasOwnProperty(name)
      ) {
        throw new NotFoundError();
      }

      let newParent: Node | undefined = root;
      for (const part of newParentPath) {
        newParent = newParent?.children?.[part];
      }

      if (!newParent || !newParent.isDirectory) {
        throw new NotFoundError();
      }

      if (newParent.children.hasOwnProperty(name)) {
        throw new DuplicateError();
      }

      newParent.children[name] = oldParent.children[name];
      delete oldParent.children[name];

      // Update unsavedChanges tree.
      replaceTreePath(state.unsavedNodes, oldPath, newPath);
    });
  },
});

function addToUnsavedChanges(
  path: Path,
  unsavedNodes: NodesWithUnsavedChangesTree
) {
  setLeafValue(unsavedNodes, path, true);
}

/**
 * Removes the unsaved changes marker for the node associated to the given
 * path. Also cleans up the path in the unsaved changes tree down to this note
 * for all nodes, i.e. remove intermediate nodes (representing directories)
 * with no other children.
 *
 * Like if this is the current unsaved changes tree:
 *
 * ```
 * .
 * ├── First dir
 * │   └── Subdir
 * │       └── File 1
 * └── Second dir
 *     └── File 2
 * ```
 *
 * and the given path is `['First dir', 'Subdir', 'File 1']`, the resulting
 * unsaved changes tree is:
 *
 * ```
 * .
 * └── Second dir
 *     └── File 2
 * ```
 *
 * @param {Path} path
 * @param {NodesWithUnsavedChangesTree} unsavedChanges
 * @returns
 */
function removeFromUnsavedChanges(
  path: Path,
  unsavedChanges: NodesWithUnsavedChangesTree
) {
  removePathFromTree(unsavedChanges, path);
}

export const { changePageContent } = nodesSlice.actions;

export default nodesSlice.reducer;
