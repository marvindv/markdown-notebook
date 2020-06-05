import styled from 'styled-components';

export const Input = styled.input`
  border-radius: ${props => props.theme.base.borderRadius};
  border: ${props => props.theme.borders.width}
    ${props => props.theme.borders.color} solid;
  padding: ${props => props.theme.forms.inputPaddingY}
    ${props => props.theme.forms.inputPaddingX};
  outline-color: ${props => props.theme.baseColors.secondary};
`;

export default Input;
