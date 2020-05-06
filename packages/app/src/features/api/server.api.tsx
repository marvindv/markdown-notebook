import React, { SyntheticEvent, useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import fetch from 'cross-fetch';
import { decode } from 'jsonwebtoken';
import Button from 'components/Button';
import Input from 'components/Input';
import Notebook from 'models/notebook';
import Path, { PagePath } from 'models/path';
import Api, {
  InvalidPathError,
  InvalidCredentialsError,
  ConnectionError,
  NotFoundError,
  DuplicateError,
  ApiError,
} from './api';
import LoadingIndicatorButton from 'components/LoadingIndicatorButton';

const Wrapper = styled.div`
  text-align: left;
`;

const ErrorText = styled.div`
  color: ${props => props.theme.baseColors.danger};
  margin-bottom: 1rem;
`;

const Form = styled.form`
  label,
  ${Input} {
    display: block;
    width: 100%;
  }

  ${Button} {
    margin: 1rem auto 0;
    display: block;
  }

  label {
    margin: 0.5rem 0;
  }
`;

/**
 * API implementation for the backend server of this project, allowing for
 * centralized stored notebooks for multiple users, secured by password
 * authentication.
 *
 * @export
 * @class ServerApi
 * @extends {Api}
 */
export default class ServerApi extends Api {
  /**
   * The header key-value pair that defines the content-type to be
   * `application/json`.
   *
   * @private
   * @memberof ServerApi
   */
  private readonly contentTypeJson = {
    'Content-Type': 'application/json',
  };

  /**
   * The localStorage key where jwt of an authenticated user will be stored.
   *
   * @private
   * @memberof ServerApi
   */
  private readonly tokenKey = '_markdown_notebook_jwt';

  // TODO: Use config
  private readonly baseUrl = '/api/v1';

  /**
   * The current user jwt that will be used when submitting api http requests.
   *
   * @private
   * @type {(string | null)}
   * @memberof ServerApi
   */
  private token: string | null;

  constructor() {
    super();
    this.token = localStorage.getItem(this.tokenKey);
  }

  /**
   * @inheritdoc
   * @memberof ServerApi
   */
  getLoginButtonText() {
    const url = window.location.hostname;
    return (
      <div>
        <div>Login</div>
        <small>auf {url}</small>
      </div>
    );
  }

  /**
   * @inheritdoc
   * @memberof ServerApi
   */
  getLoginUi() {
    return (props: { onDone: () => void }) => {
      const [username, setUsername] = useState('');
      const [password, setPassword] = useState('');
      const [loginPending, setLoginPending] = useState(false);
      const [error, setError] = useState<
        InvalidCredentialsError | ConnectionError | any | null
      >(null);
      const usernameInputRef = useRef<HTMLInputElement>(null);

      // Focus the username input when this component is initially rendered.
      useEffect(() => {
        usernameInputRef.current?.focus();
      }, [usernameInputRef]);

      // Whenever the username or password input changes, reset the error
      // state.
      useEffect(() => {
        setError(null);
      }, [username, password]);

      // Perform the authentication request on submit.
      const handleSubmit = async (ev: SyntheticEvent) => {
        ev.preventDefault();
        setError(null);
        setLoginPending(true);
        try {
          await this.auth(username, password);
          props.onDone();
        } catch (ex) {
          console.warn('Login failed:', ex);
          setError(ex);
          setLoginPending(false);
        }
      };

      let errorBlock = null;
      if (error) {
        if (error instanceof InvalidCredentialsError) {
          errorBlock = (
            <ErrorText>Die eingegebenen Zugangsdaten sind falsch.</ErrorText>
          );
        } else if (error instanceof ConnectionError) {
          errorBlock = (
            <ErrorText>
              Es konnte keiner Verbindung zum Server hergestellt werden. Bitte
              versuche es später noch einmal.
            </ErrorText>
          );
        } else {
          errorBlock = (
            <ErrorText>
              Es ist ein Fehler aufgetreten. Bitte versuche es später noch
              einmal.
            </ErrorText>
          );
        }
      }

      return (
        <Wrapper>
          {errorBlock}

          <Form onSubmit={handleSubmit}>
            <label htmlFor=''>Benutzername</label>
            <Input
              ref={usernameInputRef}
              type='text'
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
            <label htmlFor=''>Passwort</label>
            <Input
              type='password'
              value={password}
              onChange={e => setPassword(e.target.value)}
            />

            <LoadingIndicatorButton
              showLoadingIndicator={loginPending}
              themeColor='primary'
              type='submit'
            >
              Login
            </LoadingIndicatorButton>
          </Form>
        </Wrapper>
      );
    };
  }

  /**
   * @inheritdoc
   * @memberof ServerApi
   */
  isValid() {
    if (!this.token) {
      return false;
    }

    const claims = decode(this.token) as { exp: number };
    if (!claims) {
      return false;
    }

    // Token is valid if claims.exp is in the future.
    const unixUtc = Math.floor(new Date().getTime() / 1000);
    return claims.exp > unixUtc;
  }

  /**
   * @inheritdoc
   * @memberof ServerApi
   */
  logout() {
    this.token = null;
    localStorage.removeItem(this.tokenKey);
  }

  /**
   * @inheritdoc
   * @memberof ServerApi
   */
  async fetchNotebooks(): Promise<Notebook[]> {
    const res = await fetch(`${this.baseUrl}/notebook`, {
      headers: this.getAuthHeader(),
    });

    if (!res.ok) {
      throw this.responseToError(res);
    }

    return res.json();
  }

  /**
   * @inheritdoc
   * @memberof ServerApi
   */
  async addEntity(path: Path): Promise<{ actualPath: Path }> {
    let url = this.baseUrl;
    let payload: any;
    // The function that will be called with the response payload to construct
    // the actual path.
    let pathmaker: (json: any) => Path;

    if (path.pageTitle) {
      let { notebookTitle, sectionTitle, pageTitle } = path;

      url += `/notebook/${notebookTitle}/section/${sectionTitle}/page`;
      pageTitle = pageTitle.trim();
      payload = { pageTitle, content: '' };
      pathmaker = (json: {
        pageId: number;
        pageTitle: string;
        content: string;
        sectionId: number;
      }) => ({
        notebookTitle,
        sectionTitle,
        pageTitle: json.pageTitle,
      });
    } else if (path.sectionTitle) {
      let { notebookTitle, sectionTitle } = path;

      url += `/notebook/${notebookTitle}/section`;
      payload = { sectionTitle: sectionTitle.trim() };
      pathmaker = (json: {
        sectionId: number;
        sectionTitle: string;
        notebookId: number;
      }) => ({ notebookTitle, sectionTitle: json.sectionTitle });
    } else if (path.pageTitle) {
      let { notebookTitle } = path;

      url += `/notebook`;
      payload = { notebookTitle: notebookTitle.trim() };
      pathmaker = (json: { notebookId: number; notebookTitle: string }) => ({
        notebookTitle: json.notebookTitle,
      });
    } else {
      throw new InvalidPathError();
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        ...this.contentTypeJson,
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw this.responseToError(res);
    }

    const json = await res.json();
    return { actualPath: pathmaker(json) };
  }

  /**
   * @inheritdoc
   * @memberof ServerApi
   */
  async changeEntityTitle(
    path: Path,
    newTitle: string
  ): Promise<{ oldPath: Path; newTitle: string }> {
    let url = this.baseUrl;
    let payload: any;
    let newTitleSelector: (json: any) => string;
    newTitle = newTitle.trim();

    if (path.pageTitle) {
      let { notebookTitle, sectionTitle, pageTitle } = path;
      url += `/notebook/${notebookTitle}/section/${sectionTitle}/page/${pageTitle}`;
      payload = { pageTitle: newTitle };
      newTitleSelector = json => json.pageTitle;
    } else if (path.sectionTitle) {
      let { notebookTitle, sectionTitle } = path;
      url += `/notebook/${notebookTitle}/section/${sectionTitle}`;
      payload = { sectionTitle: newTitle };
      newTitleSelector = json => json.sectionTitle;
    } else if (path.notebookTitle) {
      let { notebookTitle } = path;
      url += `/notebook/${notebookTitle}`;
      payload = { notebookTitle: newTitle };
      newTitleSelector = json => json.notebookTitle;
    } else {
      throw new InvalidPathError();
    }

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        ...this.contentTypeJson,
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw this.responseToError(res);
    }

    const json = await res.json();
    return { oldPath: path, newTitle: newTitleSelector(json) };
  }

  /**
   * @inheritdoc
   * @memberof ServerApi
   */
  async deleteEntity(path: Path): Promise<{ path: Path }> {
    let url = this.baseUrl;

    if (path.pageTitle) {
      let { notebookTitle, sectionTitle, pageTitle } = path;
      url += `/notebook/${notebookTitle}/section/${sectionTitle}/page/${pageTitle}`;
    } else if (path.sectionTitle) {
      let { notebookTitle, sectionTitle } = path;
      url += `/notebook/${notebookTitle}/section/${sectionTitle}`;
    } else if (path.notebookTitle) {
      let { notebookTitle } = path;
      url += `/notebook/${notebookTitle}`;
    } else {
      throw new InvalidPathError();
    }

    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        ...this.getAuthHeader(),
      },
    });

    if (!res.ok) {
      throw this.responseToError(res);
    }

    return { path };
  }

  /**
   * @inheritdoc
   * @memberof ServerApi
   */
  async setPageContent(path: PagePath, content: string): Promise<void> {
    let { notebookTitle, sectionTitle, pageTitle } = path;
    const url = `${this.baseUrl}/notebook/${notebookTitle}/section/${sectionTitle}/page/${pageTitle}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        ...this.contentTypeJson,
        ...this.getAuthHeader(),
      },
      body: JSON.stringify({ content }),
    });

    if (!res.ok) {
      throw this.responseToError(res);
    }
  }

  private getAuthHeader() {
    return { Authorization: 'Bearer ' + this.token };
  }

  /**
   * Issues a authentication request with the given username and password. If
   * the user has been successfully authenticated, the token will be stored in
   * the localStorage for further use.
   *
   * @private
   * @param {string} username
   * @param {string} password
   * @returns {Promise<void>}
   * @memberof ServerApi
   */
  private async auth(username: string, password: string): Promise<void> {
    const url = `${this.baseUrl}/user/auth`;
    let res: Response;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: this.contentTypeJson,
        body: JSON.stringify({ username, password }),
      });
    } catch (ex) {
      throw new ConnectionError(ex.toString());
    }

    if (!res.ok) {
      throw this.responseToError(res);
    }

    const { token } = (await res.json()) as { token: string };
    localStorage.setItem(this.tokenKey, token);
  }

  private responseToError(res: Response): Error {
    switch (res.status) {
      case 401:
        return new InvalidCredentialsError();
      case 404:
        return new NotFoundError();
      case 409:
        return new DuplicateError();
      default:
        return new ApiError('Status ' + res.status + ' ' + res.statusText);
    }
  }
}
