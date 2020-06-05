import styled from 'styled-components';
import Button from './Button';

export const ButtonGroup = styled.div`
  display: flex;

  ${Button} {
    flex: 1;
  }

  ${Button}:not(:last-child) {
    border-bottom-right-radius: 0;
    border-top-right-radius: 0;
  }

  ${Button}:not(:first-child) {
    border-bottom-left-radius: 0;
    border-top-left-radius: 0;
  }
`;

export default ButtonGroup;
