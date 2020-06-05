import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { ButtonHTMLAttributes } from 'react';
import Button, { Props as ButtonProps } from './Button';

export interface Props
  extends ButtonProps,
    ButtonHTMLAttributes<HTMLButtonElement> {
  showLoadingIndicator: boolean;
}

export function LoadingIndicatorButton(props: Props) {
  return (
    <Button {...props} disabled={props.showLoadingIndicator || props.disabled}>
      {props.showLoadingIndicator ? (
        <FontAwesomeIcon icon={faCircleNotch} spin />
      ) : (
        props.children
      )}
    </Button>
  );
}

export default LoadingIndicatorButton;
