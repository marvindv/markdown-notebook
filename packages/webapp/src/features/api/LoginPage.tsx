import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Button from 'src/components/Button';
import styled from 'styled-components';
import { ApiId, apis, changeCurrentApi } from './apiSlice';

const Container = styled.div`
  max-width: 400px;
  text-align: center;
  margin: 5rem auto;
  padding: 0 1rem;

  p {
    margin-bottom: 3rem;
  }
`;

const Footer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: ${props => props.theme.baseColors.default};
  padding: 1rem;
`;

const ApiButton = styled(Button)`
  display: block;
  width: 100%;

  &.active {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }

  & + & {
    margin-top: 1rem;
  }
`;

const ApiLoginUiWrapper = styled.div`
  border: ${props => props.theme.borders.width}
    ${props => props.theme.borders.color} solid;
  padding: 2rem;
  background-color: ${props => props.theme.baseColors.default};
  border-bottom-left-radius: ${props => props.theme.base.borderRadius};
  border-bottom-right-radius: ${props => props.theme.base.borderRadius};
`;

export default function LoginPage() {
  const [selected, setSelected] = useState<ApiId | null>(null);
  const dispatch = useDispatch();
  const history = useHistory();

  let ApiLoginUi: any = (onDone: () => void) => <></>;
  if (selected) {
    ApiLoginUi = apis[selected as ApiId].getLoginUi();
  }

  const handleLoggedIn = () => {
    dispatch(changeCurrentApi(selected));
    history.replace('/');
  };

  return (
    <Container>
      <h1>markdown-notebook</h1>
      <p>How do you want to save your notes?</p>

      {Object.keys(apis).map(
        apiId =>
          (!selected || selected === apiId) && (
            <ApiButton
              themeColor='secondary'
              className={selected === apiId ? 'active' : ''}
              type='button'
              key={apiId}
              onClick={() =>
                selected === apiId
                  ? setSelected(null)
                  : setSelected(apiId as ApiId)
              }
            >
              {apis[apiId as ApiId].getLoginButtonText()}
            </ApiButton>
          )
      )}

      {selected && (
        <ApiLoginUiWrapper>
          <ApiLoginUi onDone={handleLoggedIn} />
        </ApiLoginUiWrapper>
      )}

      <Footer>
        <a href='https://github.com/marvindv/markdown-notebook'>GitHub</a>
      </Footer>
    </Container>
  );
}
