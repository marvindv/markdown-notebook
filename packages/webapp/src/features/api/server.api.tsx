import fetch from 'cross-fetch';
import { decode } from 'jsonwebtoken';
import React, { SyntheticEvent, useEffect, useRef, useState } from 'react';
import Button from 'src/components/Button';
import Input from 'src/components/Input';
import LoadingIndicatorButton from 'src/components/LoadingIndicatorButton';
import Node, { DirectoryNode, FileNode, Path } from 'src/models/node';
import styled from 'styled-components';
import Api, {
  ApiError,
  ConnectionError,
  DuplicateError,
  InvalidCredentialsError,
  NotFoundError,
} from './api';

/**
 * The definition of a single node as received from the http api.
 *
 * @interface ApiNode
 */
interface ApiNode {
  nodeId: number;
  nodeName: string;

  parentId: number | null;

  isDirectory: boolean;
  content: string | undefined;
}

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
 * centralized stored notes for multiple users, secured by password
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
  async fetchNodes(): Promise<Node[]> {
    const res = await fetch(`${this.baseUrl}/node`, {
      headers: this.getAuthHeader(),
    });

    if (!res.ok) {
      throw this.responseToError(res);
    }

    const apiNodes: ApiNode[] = await res.json();

    // Transform nodes list into tree structure with a list of root nodes.
    // Construct a Node instance from each ApiNode and put it in a lookup object
    // mapping the NodeId (used by the http api) to the Node instance it is
    // associated to.
    const lookup: { [nodeId: string]: Node } = {};
    for (const apiNode of apiNodes) {
      const node = this.convertApiNode(apiNode);
      lookup[apiNode.nodeId] = node;
    }

    // For each ApiNode attach the associated Node instance to the children map
    // of its parent or add it to the list of root nodes if the node doesn't
    // have a parent.
    const rootNodes: Node[] = [];
    for (const apiNode of apiNodes) {
      if (apiNode.parentId === null) {
        rootNodes.push(lookup[apiNode.nodeId]);
      } else {
        const parent = lookup[apiNode.parentId];
        const node = lookup[apiNode.nodeId];

        if (!parent) {
          throw new Error(
            'Parent of a node not found: ' + JSON.stringify(apiNode)
          );
        }

        if (!parent.isDirectory) {
          throw new Error(
            'Parent of a node is not a directory: ' + JSON.stringify(apiNode)
          );
        }

        parent.children[node.name] = node;
      }
    }

    return rootNodes;
  }

  /**
   * @inheritdoc
   * @memberof ServerApi
   */
  async addNode<T extends Node>(
    parent: Path,
    node: T
  ): Promise<{ parent: Path; node: T }> {
    const res = await fetch(this.baseUrl + '/node', {
      method: 'POST',
      headers: {
        ...this.contentTypeJson,
        ...this.getAuthHeader(),
      },
      body: JSON.stringify({ parent, node }),
    });

    if (!res.ok) {
      throw this.responseToError(res);
    }

    const apiNode: ApiNode = await res.json();
    return { parent, node: this.convertApiNode(apiNode) as T };
  }

  /**
   * @inheritdoc
   * @memberof ServerApi
   */
  async setPageContent(path: Path, newContent: string): Promise<void> {
    const res = await fetch(this.baseUrl + '/node/content', {
      method: 'PUT',
      headers: {
        ...this.contentTypeJson,
        ...this.getAuthHeader(),
      },
      body: JSON.stringify({ path, newContent }),
    });

    if (!res.ok) {
      throw this.responseToError(res);
    }
  }

  /**
   * @inheritdoc
   * @memberof ServerApi
   */
  async changeNodeName(
    path: Path,
    newName: string
  ): Promise<{ oldPath: Path; newName: string }> {
    const res = await fetch(this.baseUrl + '/node/name', {
      method: 'PUT',
      headers: {
        ...this.contentTypeJson,
        ...this.getAuthHeader(),
      },
      body: JSON.stringify({ path, newName }),
    });

    if (!res.ok) {
      throw this.responseToError(res);
    }

    const apiNode: ApiNode = await res.json();
    return { oldPath: path, newName: apiNode.nodeName };
  }

  /**
   * @inheritdoc
   * @memberof ServerApi
   */
  async deleteNode(path: Path): Promise<{ path: Path }> {
    const res = await fetch(this.baseUrl + '/node', {
      method: 'DELETE',
      headers: {
        ...this.contentTypeJson,
        ...this.getAuthHeader(),
      },
      body: JSON.stringify({ path }),
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
  async moveNode(
    nodePath: Path,
    newParentPath: Path
  ): Promise<{ oldPath: Path; newPath: Path }> {
    const res = await fetch(this.baseUrl + '/node/parent', {
      method: 'PUT',
      headers: {
        ...this.contentTypeJson,
        ...this.getAuthHeader(),
      },
      body: JSON.stringify({ nodePath, newParentPath }),
    });

    if (!res.ok) {
      throw this.responseToError(res);
    }

    const data: { oldPath: Path; newPath: Path } = await res.json();
    return data;
  }

  private convertApiNode(apiNode: ApiNode): Node {
    let node: Node;
    if (apiNode.isDirectory) {
      const dir: DirectoryNode = {
        isDirectory: true,
        name: apiNode.nodeName,
        children: {},
      };
      node = dir;
    } else {
      const file: FileNode = {
        isDirectory: false,
        name: apiNode.nodeName,
        content: apiNode.content || '',
      };
      node = file;
    }

    return node;
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
    this.token = token;
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
