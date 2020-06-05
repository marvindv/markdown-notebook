import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { transparentize } from 'polished';
import React, { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { Dropdown, Input } from 'src/components';
import { DropdownItem, DropdownToggle } from 'src/components/Dropdown';
import useOutsideClick from 'src/hooks/useOutsideClick';
import styled, { css } from 'styled-components';

const StyledDropdown = styled(Dropdown)`
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
`;

const HEAD_TEXT_PADDING = 0.25;

const TreeNodeHeadWrapper = styled.div<{
  showDropdown: boolean;
  editMode: boolean;
}>`
  padding: 1rem;
  cursor: pointer;
  // For the absolute positioned dropdown.
  position: relative;

  .inner {
    display: flex;
    align-items: center;

    .name {
      padding: ${HEAD_TEXT_PADDING}rem;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }

  &.active {
    background-color: ${props =>
      transparentize(0.5, props.theme.borders.color)};
  }

  &:hover {
    background-color: ${props =>
      transparentize(0.25, props.theme.borders.color)};
  }

  ${props =>
    (props.showDropdown || props.editMode) &&
    css`
      background-color: ${props =>
        transparentize(0.25, props.theme.borders.color)} !important;
    `}

  ${props =>
    !props.showDropdown &&
    css`
      @media (hover: hover) {
        &:not(:hover) ${StyledDropdown} {
          display: none;
        }
      }
    `}

  ${DropdownToggle} {
    height: 100%;

    @media (hover: hover) {
      background: linear-gradient(
        to right,
        ${props => transparentize(1, props.theme.borders.color)},
        ${props => transparentize(0.25, props.theme.borders.color)} 20%,
        ${props => transparentize(0, props.theme.borders.color)}
      );
    }

    &:hover,
    &:active,
    &:focus {
      background: linear-gradient(
        to right,
        ${props => transparentize(1, props.theme.borders.color)},
        ${props => transparentize(0.25, props.theme.borders.color)} 20%,
        ${props => props.theme.buttons.themes.secondary.background}
      );
    }

    &:focus {
      outline-color: ${props =>
        props.theme.buttons.themes.secondary.background};
    }
  }
`;

const EditNameInput = styled(Input)`
  width: 100%;
  border-width: ${HEAD_TEXT_PADDING / 2}rem;
  padding: ${HEAD_TEXT_PADDING / 2}rem;
`;

export interface Props {
  className?: string;
  icon: IconProp;
  text: string;
  dropdownItems: DropdownItem[];
  isTextEditing: boolean;
  onClick: () => void;
  onTextChange: (newText: string) => void;
  onTextEditingChange: (isTextEditing: boolean) => void;
}

/**
 * The head of a {@link DirectoryTreeNode} or {@link FileTreeNode} element.
 * Contains the node name, icon and controls to save, delete or change the name
 * of a node.
 *
 * @export
 * @param {Props} props
 * @returns
 */
export default function TreeNodeHead(props: Props) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [editValue, setEditValue] = useState(props.text);
  const inputRef = useRef<HTMLInputElement>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Focus the input if editMode changed to true.
  useEffect(() => {
    if (props.isTextEditing && inputRef.current) {
      const input = inputRef.current;
      input.focus();
      input.setSelectionRange(0, input.value.length);
    }
  }, [props.isTextEditing]);

  useOutsideClick(ref, props.isTextEditing, () => {
    props.onTextEditingChange(false);
  });

  const handleInputKeyDown = (ev: KeyboardEvent<HTMLInputElement>) => {
    if (ev.key === 'Enter') {
      props.onTextEditingChange(false);
      props.onTextChange(editValue);
    } else if (ev.key === 'Escape') {
      props.onTextEditingChange(false);
    }
  };

  return (
    <TreeNodeHeadWrapper
      className={props.className}
      ref={ref}
      onClick={props.onClick}
      showDropdown={showDropdown}
      editMode={!!props.isTextEditing}
    >
      <div className='inner'>
        <FontAwesomeIcon fixedWidth icon={props.icon} />

        {!props.isTextEditing && <div className='name'>{props.text}</div>}

        {props.isTextEditing && (
          <EditNameInput
            ref={inputRef}
            type='text'
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onKeyDown={handleInputKeyDown}
          />
        )}
      </div>

      <StyledDropdown
        show={showDropdown}
        toggleLabel={<FontAwesomeIcon icon={faEllipsisV} />}
        items={props.dropdownItems}
        onToggleClick={() => setShowDropdown(!showDropdown)}
      />
    </TreeNodeHeadWrapper>
  );
}
