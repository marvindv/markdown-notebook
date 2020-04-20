import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import styled, { css } from 'styled-components';
import { transparentize } from 'polished';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';

import { RgbColor } from 'features/notebooks/model';
import Dropdown, { DropdownToggle } from 'features/dropdowns/Dropdown';

const StyledDropdown = styled(Dropdown)`
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
`;

const ElementContainer = styled.li<{
  indexTabColor: RgbColor | undefined;
  showDropdown: boolean;
  editMode: boolean;
}>`
  ${props =>
    props.indexTabColor &&
    css`
      border-left: 0.5rem solid
        rgb(
          ${props.indexTabColor[0]},
          ${props.indexTabColor[1]},
          ${props.indexTabColor[2]}
        );
    `}

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
      &:not(:hover) ${StyledDropdown} {
        display: none;
      }
    `}

  ${DropdownToggle} {
    height: 100%;
    background: linear-gradient(
      to right,
      ${props => transparentize(1, props.theme.borders.color)},
      ${props => transparentize(0.25, props.theme.borders.color)} 20%,
      ${props => transparentize(0, props.theme.borders.color)}
    );

    &:hover,
    &:active,
    &:focus {
      background: linear-gradient(
        to right,
        ${props => transparentize(1, props.theme.borders.color)},
        ${props => transparentize(0.25, props.theme.borders.color)} 20%,
        ${props => props.theme.buttons.secondaryBackground}
      );
    }

    &:focus {
      outline-color: ${props => props.theme.buttons.secondaryBackground};
    }
  }

  display: flex;
  align-items: center;
  position: relative;
`;

const ElementButton = styled.button`
  width: 100%;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  background: none;
  border: 0;
  padding: 1rem;
`;

const ElementInputContainer = styled.div`
  padding: 1rem;
`;

const ElementInput = styled.input`
  width: 100%;
  border: 0;
`;

/**
 * An element in a column, either notebook, section or page.
 *
 * @param props
 */
export default function Element(props: {
  onClick?: () => void;
  onDeleteClick?: () => void;
  onTitleChange?: (newTitle: string) => void;
  className: string;
  label: string;
  indexTabColor?: RgbColor;
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isEditing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(props.label);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input if isEditing changed to true.
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleNameEditClick = () => {
    setShowDropdown(false);
    setEditing(!isEditing);
  };

  const handleInputKeyDown = (ev: KeyboardEvent) => {
    if (ev.key === 'Enter') {
      setEditing(false);
      props.onTitleChange?.(editValue);
    }
  };

  return (
    <ElementContainer
      className={props.className}
      indexTabColor={props.indexTabColor}
      showDropdown={showDropdown}
      editMode={isEditing}
    >
      {!isEditing && (
        <ElementButton type='button' onClick={props.onClick}>
          {props.label}
        </ElementButton>
      )}

      {isEditing && (
        <ElementInputContainer>
          <ElementInput
            ref={inputRef}
            type='text'
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onKeyDown={handleInputKeyDown}
          />
        </ElementInputContainer>
      )}

      <StyledDropdown
        show={showDropdown}
        toggleLabel={<FontAwesomeIcon icon={faEllipsisV} />}
        items={[
          { label: 'Name ändern', onClick: handleNameEditClick },
          { label: 'Löschen', onClick: props.onDeleteClick },
        ]}
        onToggleClick={() => setShowDropdown(!showDropdown)}
      />
    </ElementContainer>
  );
}
