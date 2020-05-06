import styled from 'styled-components';

const Input = styled.input`
  border-radius: ${props => props.theme.base.borderRadius};
  border: ${props => props.theme.borders.width}
    ${props => props.theme.borders.color} solid;
  padding: ${props => props.theme.forms.inputPaddingY}
    ${props => props.theme.forms.inputPaddingX};
`;

export default Input;
