import { faFile, faFolder } from '@fortawesome/free-regular-svg-icons';
import {
  faAdjust,
  faBackspace,
  faBars,
  faCog,
  faDownload,
  faEllipsisV,
  faSave,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Button, Dropdown } from 'src/components';
import { TextDropdownItem } from 'src/components/Dropdown';
import {
  addNode,
  changeNodeName,
  deleteNode,
  moveNode,
  saveManyPagesContent,
} from 'src/features/nodes/nodesSlice';
import { Node, Path } from 'src/models/node';
import { getTreeNode } from 'src/models/tree';
import { RootState } from 'src/reducers';
import { setTheme } from 'src/reducers/settingsSlice';
import { getHasUnsavedChanges } from 'src/selectors';
import { AppDispatch } from 'src/store';
import styled from 'styled-components';
import exportAsZip from '../nodes/exporter';
import { changeCurrentPath } from './currentPathSlice';
import { setIsNodeExpanded } from './expandedNodesSlice';
import FileTree from './FileTree';
import { getCollisionFreeName } from './helper';
import { resetNodeFocus } from './nodeFocusSlice';
import { setNodeEditing } from './nodeNameEditingSlice';

const StyledFileTree = styled(FileTree)``;

const NoNodesHint = styled.div`
  color: ${props => props.theme.typo.mutedColor};
  padding: 1rem;
`;

const Container = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: column;

  ${StyledFileTree}, ${NoNodesHint} {
    overflow-y: auto;
    height: 100%;
  }
`;

const Heading = styled.div`
  color: ${props => props.theme.typo.mutedColor};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  user-select: none;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: ${props => props.theme.borders.width} solid
    ${props => props.theme.borders.color};
`;

export interface Props {
  className?: string;

  /**
   * This event is called whenever the user clicks on a file after
   * {@link changeCurrentPath} is emitted.
   *
   * @memberof Props
   */
  onFileClick: (path: Path) => void;
}

/**
 * The navigation component that renders all nodes in a tree view. Handles the
 * selection of notes as well as creating, renaming and deleting nodes. The user
 * also accesses the settings through this component.
 *
 * @export
 * @param {Props} props
 * @returns
 */
export function Navigation(props: Props) {
  const history = useHistory();
  const dispatch: AppDispatch = useDispatch();
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const currentTheme = useSelector((state: RootState) => state.settings.theme);
  const currentPath = useSelector((state: RootState) => state.currentPath);
  const rootNode = useSelector((state: RootState) => state.nodes.root);
  const hasUnsavedChanges = useSelector(getHasUnsavedChanges);
  const unsavedNodes = useSelector(
    (state: RootState) => state.nodes.unsavedNodes
  );
  const nodeNameEditingTree = useSelector(
    (state: RootState) => state.nodeNameEditing
  );
  const expandedNodes = useSelector((state: RootState) => state.expandedNodes);
  const pendingFocusedNodes = useSelector(
    (state: RootState) => state.nodeFocus.isFocusNodePendingTree
  );
  const highlightedNodes = useSelector(
    (state: RootState) => state.nodeFocus.highlightedNodeTree
  );

  // The user may choose a child of the root as the "custom root" to display
  // only children of that child in the navigation.
  // Use null for no custom root, i.e. using the actual root, for easy checks.
  const [customRootPath, setCustomRootPath] = useState<Path | null>(null);

  // If a custom root path is specified, find the node to that path and return
  // it as customRootNode along with pathPrefix.
  // pathPrefix is either empty, i.e. pointing to the actual root, if no custom
  // root is selected or is the custom root path. This means
  // pathPrefix is always a valid path and therefore can always be used in the
  // Navigation event handlers to prefix paths of selected/deleted/moved etc.
  // nodes to get their full path since these event handlers only get the path
  // starting from the custom root, if there is one.
  const [customRootNode, pathPrefix] = useMemo(() => {
    if (!customRootPath) {
      return [rootNode, []];
    }

    let node: Node | undefined = rootNode;
    for (const part of customRootPath) {
      node = node?.children?.[part];
    }

    if (node && node.isDirectory) {
      return [node, customRootPath];
    }

    return [rootNode, []];
  }, [rootNode, customRootPath]);

  // Traverse through the unsaved changes and name editing trees to the node
  // represented by pathPrefix to match the structure of customRootNode.
  const unsavedNodesWithCustomRoot = useMemo(
    () => getTreeNode(unsavedNodes, pathPrefix),
    [unsavedNodes, pathPrefix]
  );
  const nodeNameEditingWithCustomRoot = useMemo(
    () => getTreeNode(nodeNameEditingTree, pathPrefix),
    [nodeNameEditingTree, pathPrefix]
  );
  const expandedNodesWithCustomRoot = useMemo(
    () => getTreeNode(expandedNodes, pathPrefix),
    [expandedNodes, pathPrefix]
  );
  const pendingFocusedNodesWithCustomRoot = useMemo(
    () => getTreeNode(pendingFocusedNodes, pathPrefix),
    [pendingFocusedNodes, pathPrefix]
  );
  const highlightedNodesWithCustomRoot = useMemo(
    () => getTreeNode(highlightedNodes, pathPrefix),
    [highlightedNodes, pathPrefix]
  );
  // The current path adjusted so it can be passed to the Navigation component
  // if a custom root is selected.
  // If there is no custom root, this is currentPath.
  // If there is a custom root and currentPath is not in the custom root,
  // this will be empty.
  // If there is a custom root and currentPath is in the custom root,
  // this will be currentPath but the path to the custom root removed from the
  // beginning.
  const currentPathWithCustomRoot = useMemo(() => {
    if (pathPrefix.length === 0) {
      return currentPath;
    }

    if (pathPrefix.every((part, i) => currentPath[i] === part)) {
      return currentPath.slice(pathPrefix.length);
    }

    return [];
  }, [currentPath, pathPrefix]);

  const handleFileClick = (path: Path) => {
    dispatch(changeCurrentPath([...pathPrefix, ...path]));
    props.onFileClick(path);
  };

  const handleSaveClick = (path: Path = []) => {
    dispatch(saveManyPagesContent({ path: [...pathPrefix, ...path] }));
  };

  const handleDeleteClick = (path: Path) => {
    dispatch(deleteNode({ path: [...pathPrefix, ...path] }));
  };

  const handleNodeNameChange = (path: Path, newName: string) => {
    // Only emit if the name actually changed.
    if (path[path.length - 1] !== newName) {
      dispatch(changeNodeName({ path: [...pathPrefix, ...path], newName }));
    }
  };

  const handleNodeNameEditingChange = (path: Path, isTextEditing: boolean) => {
    dispatch(
      setNodeEditing({
        path: [...pathPrefix, ...path],
        isEditing: isTextEditing,
      })
    );
  };

  const handleNewNode = async (parent: Path, node: Node) => {
    const parentPath = [...pathPrefix, ...parent];
    const result = await dispatch(addNode({ parent: parentPath, node }));
    if (addNode.fulfilled.match(result)) {
      const path = [...result.payload.parent, result.payload.node.name];
      dispatch(changeCurrentPath(path));
      dispatch(setNodeEditing({ path, isEditing: true }));
    }
  };

  const handleNewRootFile = () => {
    const name = getCollisionFreeName(
      'New note',
      Object.keys(rootNode.children)
    );
    handleNewNode([], { isDirectory: false, content: '', name });
  };

  const handleNewRootDirectory = () => {
    const name = getCollisionFreeName(
      'New directory',
      Object.keys(rootNode.children)
    );
    handleNewNode([], { isDirectory: true, children: {}, name });
  };

  const handleExportClick = () => {
    exportAsZip(rootNode);
  };

  const handleNodeMove = (_nodePath: Path, _newParentPath: Path) => {
    const nodePath = [...pathPrefix, ..._nodePath];
    const newParentPath = [...pathPrefix, ..._newParentPath];

    const name = nodePath[nodePath.length - 1];
    const newPathString = '/' + newParentPath.join('/');
    const decision = window.confirm(
      `Are you sure you want to move "${name}" to "${newPathString}"?`
    );
    if (decision) {
      dispatch(moveNode({ nodePath, newParentPath }));
    }
  };

  const handleIsNodeExpandedChange = (node: Path, isExpanded: boolean) => {
    const nodePath = [...pathPrefix, ...node];
    dispatch(setIsNodeExpanded({ path: nodePath, isExpanded }));
  };

  const handleNodeFocused = (node: Path) => {
    const nodePath = [...pathPrefix, ...node];
    dispatch(resetNodeFocus({ path: nodePath }));
  };

  const toggleDarkTheme = () => {
    dispatch(setTheme(currentTheme === 'dark' ? 'light' : 'dark'));
  };

  // Adjust the dropdown and heading depending on whether there is a custom root
  // node selected.
  let dropdown;
  let heading;
  const toggleThemeItem = {
    icon: faAdjust,
    label:
      currentTheme === 'dark'
        ? 'Change to Light Theme'
        : 'Change to Dark Theme',
    onClick: () => toggleDarkTheme(),
  };
  const versionItem: TextDropdownItem = {
    label: 'Version ' + process.env.REACT_APP_VERSION,
    textOnly: true,
  };

  if (customRootPath) {
    dropdown = (
      <Dropdown
        toggleButton={React.forwardRef((props, ref) => (
          <Button {...props} ref={ref} themeColor='secondary' clear={true}>
            {props.children}
          </Button>
        ))}
        toggleLabel={<FontAwesomeIcon fixedWidth={true} icon={faEllipsisV} />}
        show={showSettingsDropdown}
        onToggleClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
        items={[
          {
            icon: faBackspace,
            label: 'Leave directory',
            onClick: () => setCustomRootPath(null),
          },
          {
            isSpacer: true,
          },
          {
            icon: faFile,
            label: 'New note',
            onClick: () => {
              setShowSettingsDropdown(false);
              const name = getCollisionFreeName(
                'New note',
                Object.keys(customRootNode.children)
              );
              // Don't pass pathPrefix here since handleNewNodes prepends the
              // prefix.
              handleNewNode([], {
                isDirectory: false,
                content: '',
                name,
              });
            },
          },
          {
            icon: faFolder,
            label: 'New directory',
            onClick: () => {
              setShowSettingsDropdown(false);
              const name = getCollisionFreeName(
                'New directory',
                Object.keys(customRootNode.children)
              );
              // Don't pass pathPrefix here since handleNewNodes prepends the
              // prefix.
              handleNewNode([], {
                isDirectory: true,
                children: {},
                name,
              });
            },
          },
          {
            isSpacer: true,
          },
          toggleThemeItem,
          { isSpacer: true },
          versionItem,
        ]}
      />
    );

    heading = <Heading>{customRootNode.name}</Heading>;
  } else {
    dropdown = (
      <Dropdown
        menuAlignment='bottom-end'
        toggleButton={React.forwardRef((props, ref) => (
          <Button {...props} ref={ref} themeColor='secondary' clear={true}>
            {props.children}
          </Button>
        ))}
        toggleLabel={<FontAwesomeIcon fixedWidth={true} icon={faBars} />}
        show={showSettingsDropdown}
        onToggleClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
        items={[
          {
            icon: faFile,
            label: 'New note',
            onClick: () => handleNewRootFile(),
          },
          {
            icon: faFolder,
            label: 'New directory',
            onClick: () => handleNewRootDirectory(),
          },
          {
            isSpacer: true,
          },
          toggleThemeItem,
          { isSpacer: true },
          {
            icon: faDownload,
            label: 'Export all',
            onClick: () => handleExportClick(),
          },
          {
            icon: faCog,
            label: 'Change storage',
            onClick: () => history.push('/login'),
          },
          { isSpacer: true },
          versionItem,
        ]}
      />
    );
  }

  return (
    <Container className={props.className}>
      <Header>
        {dropdown}
        {heading}

        <Button
          themeColor='secondary'
          title='Save all'
          clear={true}
          disabled={!hasUnsavedChanges}
          onClick={() => handleSaveClick()}
        >
          <FontAwesomeIcon fixedWidth={true} icon={faSave} spin={false} />
        </Button>
      </Header>

      {Object.keys(rootNode.children).length > 0 ? (
        <StyledFileTree
          renderRootHead={false}
          rootNode={customRootNode}
          unsavedNodes={unsavedNodesWithCustomRoot}
          currentPath={currentPathWithCustomRoot}
          nodeNameEditingTree={nodeNameEditingWithCustomRoot}
          expandedNodes={expandedNodesWithCustomRoot}
          pendingFocusedNodes={pendingFocusedNodesWithCustomRoot}
          highlightedNodes={highlightedNodesWithCustomRoot}
          onFileClick={handleFileClick}
          onSaveClick={handleSaveClick}
          onDeleteClick={handleDeleteClick}
          onNodeNameChange={handleNodeNameChange}
          onNodeNameEditingChange={handleNodeNameEditingChange}
          onNewNode={handleNewNode}
          onNodeMove={handleNodeMove}
          onSelectCustomRoot={path =>
            setCustomRootPath([...pathPrefix, ...path])
          }
          onIsNodeExpandedChange={handleIsNodeExpandedChange}
          onNodeFocused={handleNodeFocused}
        />
      ) : (
        <NoNodesHint>
          <div>
            <strong>You don't have any notes yet.</strong>
            <div>
              Use the <FontAwesomeIcon icon={faBars} size={'sm'} /> menu to
              create notes and folders.
            </div>
          </div>
        </NoNodesHint>
      )}
    </Container>
  );
}

export default Navigation;
