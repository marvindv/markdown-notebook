import { faBars, faSave } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { ButtonHTMLAttributes, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Button, Dropdown } from 'src/components';
import {
  addNode,
  changeNodeName,
  deleteNode,
  saveManyPagesContent,
} from 'src/features/nodes/nodesSlice';
import { Node, Path } from 'src/models/node';
import { RootState } from 'src/reducers';
import { getHasUnsavedChanges } from 'src/selectors';
import { AppDispatch } from 'src/store';
import styled from 'styled-components';
import exportAsZip from '../nodes/exporter';
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

  const handleSaveClick = (path: Path = []) => {
    dispatch(saveManyPagesContent({ path }));
  };

  const handleFileClick = (path: Path) => {
    dispatch(changeCurrentPath(path));
    props.onFileClick(path);
  };

  const handleDeleteClick = (path: Path) => {
    dispatch(deleteNode({ path }));
  };

  const handleNodeNameChange = (path: Path, newName: string) => {
    // Only emit if the name actually changed.
    if (path[path.length - 1] !== newName) {
      dispatch(changeNodeName({ path, newName }));
    }
  };

  const handleNodeNameEditingChange = (path: Path, isTextEditing: boolean) => {
    dispatch(setNodeEditing({ path, isEditing: isTextEditing }));
  };

  const handleNewNode = async (parent: Path, node: Node) => {
    const result = await dispatch(addNode({ parent, node }));
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

  return (
    <Container className={props.className}>
      <Header>
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
          rootNode={rootNode}
          unsavedNodes={unsavedNodes}
          currentPath={currentPath}
          onFileClick={handleFileClick}
          onSaveClick={handleSaveClick}
          onDeleteClick={handleDeleteClick}
          nodeNameEditingTree={nodeNameEditingTree}
          onNodeNameChange={handleNodeNameChange}
          onNodeNameEditingChange={handleNodeNameEditingChange}
          onNewNode={handleNewNode}
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
