import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { transparentize } from 'polished';
import React, { KeyboardEvent, useEffect, useRef, useState } from 'react';
import Dropdown, { DropdownToggle } from 'src/components/Dropdown';
import UnsavedChangesIndicator from 'src/components/UnsavedChangesIndicator';
import useOutsideClick from 'src/hooks/useOutsideClick';
import { RgbColor } from 'src/models/notebook';
import styled, { css } from 'styled-components';

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

  display: flex;
  align-items: center;
  position: relative;
`;

const ElementButtonLabel = styled.div`
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

const ElementUnsavedChangesIndicator = styled(UnsavedChangesIndicator)``;

const ElementButton = styled.button`
  display: flex;
  width: 100%;
  text-align: left;
  background: none;
  border: 0;
  padding: 1rem;

  ${ElementUnsavedChangesIndicator} {
    margin-right: 0.25rem;
  }
`;

const ElementInputContainer = styled.div`
  padding: 1rem;
`;

const ElementInput = styled.input`
  width: 100%;
  border: 0;
  padding: 0;
`;

/**
 * Gets the width of an element without the padding.
 *
 * From https://stackoverflow.com/a/29881817
 *
 * @param {HTMLElement} element
 * @returns {number}
 */
function getElementInnerWidth(element: HTMLElement): number {
  const computedStyle = getComputedStyle(element);
  let elementWidth = element.clientWidth;
  elementWidth -=
    parseFloat(computedStyle.paddingLeft) +
    parseFloat(computedStyle.paddingRight);
  return elementWidth;
}

export interface Props {
  onClick: () => void;
  onDeleteClick: () => void;
  deleteConfirmText: string;
  onTitleChange: (newTitle: string) => void;
  className: string;
  showUnsavedChangesIndicator: boolean;
  label: string;
  indexTabColor?: RgbColor;
  unsavedChangesIndicatorTooltip: string;
  isEditing: boolean;
  onEditingChange: (isEditing: boolean) => void;
  saveButtonDisabled?: boolean;
  onSaveClick?: () => void;
}

/**
 * An element in a column, either notebook, section or page.
 *
 * @param props
 */
export default function Element(props: Props) {
  const { showUnsavedChangesIndicator, isEditing, onEditingChange } = props;
  const [showDropdown, setShowDropdown] = useState(false);
  const [editValue, setEditValue] = useState(props.label);
  const [innerWidthBeforeEdit, setInnerWidthBeforeEdit] = useState<
    number | null
  >(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const ref = useRef<HTMLLIElement>(null);

  // Focus the input if isEditing changed to true.
  useEffect(() => {
    if (isEditing && inputRef.current) {
      const input = inputRef.current;
      input.focus();
      input.setSelectionRange(0, input.value.length);
    }
  }, [isEditing]);

  useOutsideClick(ref, isEditing, () => {
    onEditingChange(false);
  });

  const handleNameEditClick = () => {
    if (buttonRef.current) {
      const innerWidth = getElementInnerWidth(buttonRef.current);
      setInnerWidthBeforeEdit(innerWidth);
    } else {
      setInnerWidthBeforeEdit(null);
    }

    setShowDropdown(false);
    const willBeEditing = !isEditing;
    if (willBeEditing) {
      setEditValue(props.label);
    }

    props.onEditingChange(willBeEditing);
  };

  const handleInputKeyDown = (ev: KeyboardEvent) => {
    if (ev.key === 'Enter') {
      props.onEditingChange(false);
      setInnerWidthBeforeEdit(null);
      props.onTitleChange?.(editValue);
    } else if (ev.key === 'Escape') {
      props.onEditingChange(false);
      setInnerWidthBeforeEdit(null);
    }
  };

  const handleDeleteClick = () => {
    const decision = window.confirm(props.deleteConfirmText);
    if (decision) {
      props.onDeleteClick();
    }
  };

  return (
    <ElementContainer
      ref={ref}
      className={props.className}
      indexTabColor={props.indexTabColor}
      showDropdown={showDropdown}
      editMode={isEditing}
    >
      {!isEditing && (
        <ElementButton type='button' onClick={props.onClick} ref={buttonRef}>
          {showUnsavedChangesIndicator && (
            <ElementUnsavedChangesIndicator
              title={props.unsavedChangesIndicatorTooltip}
            />
          )}
          <ElementButtonLabel>{props.label}</ElementButtonLabel>
        </ElementButton>
      )}

      {isEditing && (
        <ElementInputContainer>
          <ElementInput
            ref={inputRef}
            type='text'
            value={editValue}
            style={{
              minWidth: innerWidthBeforeEdit
                ? innerWidthBeforeEdit + 'px'
                : undefined,
            }}
            onChange={e => setEditValue(e.target.value)}
            onKeyDown={handleInputKeyDown}
          />
        </ElementInputContainer>
      )}

      <StyledDropdown
        show={showDropdown}
        toggleLabel={<FontAwesomeIcon icon={faEllipsisV} />}
        items={[
          {
            label: 'Speichern',
            disabled: props.saveButtonDisabled,
            onClick: props.onSaveClick,
          },
          { label: 'Name ändern', onClick: handleNameEditClick },
          { label: 'Löschen', onClick: handleDeleteClick },
        ]}
        onToggleClick={() => setShowDropdown(!showDropdown)}
      />
    </ElementContainer>
  );
}
