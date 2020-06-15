import { faBars, faEllipsisV, faSave } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { ButtonHTMLAttributes, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Button, Dropdown } from 'src/components';
import {
  addNode,
  changeNodeName,
  deleteNode,
  moveNode,
  saveManyPagesContent,
} from 'src/features/nodes/nodesSlice';
import { Node, Path } from 'src/models/node';
import { RootState } from 'src/reducers';
import { getHasUnsavedChanges } from 'src/selectors';
import { AppDispatch } from 'src/store';
import styled from 'styled-components';
import exportAsZip from '../nodes/exporter';
import { getNodeFromTree } from '../nodes/NodeTree';
import { changeCurrentPath } from './currentPathSlice';
import FileTree from './FileTree';
import { getCollisionFreeName } from './helper';
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
  const currentPath = useSelector((state: RootState) => state.currentPath);
  const rootNode = useSelector((state: RootState) => state.nodes.root);
  const hasUnsavedChanges = useSelector(getHasUnsavedChanges);
  const unsavedNodes = useSelector(
    (state: RootState) => state.nodes.unsavedNodes
  );
  const nodeNameEditingTree = useSelector(
    (state: RootState) => state.nodeNameEditing
  );

  // The user may choose a child of the root as the "custom root" to display
  // only children of that child in the navigation.
  // Use null for no custom root, i.e. using the actual root, for easy checks.
  const [customRootPath, setCustomRootPath] = useState<Path | null>(null);

  // If a custom root path is specified, find the node to that path and
  // normalize the customRootPath to the pathPrefix that is always a valid path
  // and can be used in the Navigation event handlers to prefix paths of
  // selected/deleted/moved etc. nodes.
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
    () => getNodeFromTree(unsavedNodes, pathPrefix),
    [unsavedNodes, pathPrefix]
  );
  const nodeNameEditingWithCustomRoot = useMemo(
    () => getNodeFromTree(nodeNameEditingTree, pathPrefix),
    [nodeNameEditingTree, pathPrefix]
  );

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
      'Neue Notiz',
      Object.keys(rootNode.children)
    );
    handleNewNode([], { isDirectory: false, content: '', name });
  };

  const handleNewRootDirectory = () => {
    const name = getCollisionFreeName(
      'Neuer Ordner',
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
      `Möchtest du wirklich "${name}" nach "${newPathString}" verschieben?`
    );
    if (decision) {
      dispatch(moveNode({ nodePath, newParentPath }));
    }
  };

  // Adjust the dropdown and heading depending on whether there is a custom root
  // node selected.
  let dropdown;
  let heading;
  if (customRootPath) {
    dropdown = (
      <Dropdown
        toggleButton={(props: ButtonHTMLAttributes<any>) => (
          <Button {...props} themeColor='secondary' clear={true}>
            {props.children}
          </Button>
        )}
        toggleLabel={<FontAwesomeIcon fixedWidth={true} icon={faEllipsisV} />}
        menuAlignment='left'
        show={showSettingsDropdown}
        onToggleClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
        items={[
          {
            label: 'Neue Notiz',
            onClick: () => {
              setShowSettingsDropdown(false);
              const name = getCollisionFreeName(
                'Neue Notiz',
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
            label: 'Neuer Ordner',
            onClick: () => {
              setShowSettingsDropdown(false);
              const name = getCollisionFreeName(
                'Neuer Ordner',
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
          {
            label: 'Ordner verlassen',
            onClick: () => setCustomRootPath([]),
          },
        ]}
      />
    );

    heading = <Heading>{customRootNode.name}</Heading>;
  } else {
    dropdown = (
      <Dropdown
        toggleButton={(props: ButtonHTMLAttributes<any>) => (
          <Button {...props} themeColor='secondary' clear={true}>
            {props.children}
          </Button>
        )}
        toggleLabel={<FontAwesomeIcon fixedWidth={true} icon={faBars} />}
        menuAlignment='left'
        show={showSettingsDropdown}
        onToggleClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
        items={[
          {
            label: 'Neue Notiz',
            onClick: () => handleNewRootFile(),
          },
          {
            label: 'Neuer Ordner',
            onClick: () => handleNewRootDirectory(),
          },
          { isSpacer: true },
          {
            label: 'Alles exportieren',
            onClick: () => handleExportClick(),
          },
          {
            label: 'Speicherort ändern',
            onClick: () => history.push('/login'),
          },
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
          title='Alle speichern'
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
          currentPath={currentPath}
          nodeNameEditingTree={nodeNameEditingWithCustomRoot}
          onFileClick={handleFileClick}
          onSaveClick={handleSaveClick}
          onDeleteClick={handleDeleteClick}
          onNodeNameChange={handleNodeNameChange}
          onNodeNameEditingChange={handleNodeNameEditingChange}
          onNewNode={handleNewNode}
          onNodeMove={handleNodeMove}
          onSelectCustomRoot={path => setCustomRootPath(path)}
        />
      ) : (
        <NoNodesHint>
          <div>
            <strong>Du hast noch keine Notizen.</strong>
            <div>
              Erstelle über das <FontAwesomeIcon icon={faBars} size={'sm'} />
              -Menü Ordner und Notizen.
            </div>
          </div>
        </NoNodesHint>
      )}
    </Container>
  );
}

export default Navigation;
