import {
  changeTreeNodeName,
  createEmptyTree,
  getTreeNode,
  getTreeNodeChildNames,
  getTreeNodePayload,
  hasTreeNodeChildren,
  moveSubtree,
  removeTreeNode,
  setTreeNode,
  setTreeNodePayload,
  Tree,
} from './tree';

type StringTree = Tree<string>;

describe('hasTreeNodeChildren', () => {
  it('should return true for nodes with children', () => {
    const t = createEmptyTree();
    setTreeNodePayload(t, ['Foo', 'Bar'], 'Foo/Bar Payload');
    expect(hasTreeNodeChildren(t)).toBe(true);
    expect(hasTreeNodeChildren(t.children['Foo']!)).toBe(true);
  });

  it('should return false for nodes without children', () => {
    const t = createEmptyTree();
    setTreeNodePayload(t, ['Foo', 'Bar'], 'Foo/Bar Payload');
    expect(hasTreeNodeChildren(getTreeNode(t, ['Foo', 'Bar'])!)).toBe(false);
  });
});

describe('getTreeNodeChildNames', () => {
  it('should return the names of all children', () => {
    const t = createEmptyTree();
    expect(getTreeNodeChildNames(t)).toEqual([]);

    setTreeNodePayload(t, ['Foo', 'Bar'], 'Foo Bar');
    setTreeNodePayload(t, ['Foo', 'Baz'], 'Foo Baz');
    expect(getTreeNodeChildNames(t)).toEqual(['Foo']);
    expect(getTreeNodeChildNames(getTreeNode(t, ['Foo'])!)).toEqual([
      'Bar',
      'Baz',
    ]);
  });
});

test('getTreeNode', () => {
  const t: StringTree = {
    children: {
      Foo: {
        children: {
          FooChild1: {
            children: {},
            payload: 'Payload of FooChild1',
          },
        },
        payload: 'The payload of Foo',
      },
      Bar: {
        children: {},
        payload: 'The payload of Bar',
      },
    },
    payload: undefined,
  };

  expect(getTreeNode(t, [])).toEqual(t);

  expect(getTreeNode(t, ['Foo'])).toEqual({
    children: {
      FooChild1: {
        children: {},
        payload: 'Payload of FooChild1',
      },
    },
    payload: 'The payload of Foo',
  });

  expect(getTreeNode(t, ['Foo', 'FooChild1'])).toEqual({
    children: {},
    payload: 'Payload of FooChild1',
  });

  expect(getTreeNode(t, ['Bar'])).toEqual({
    children: {},
    payload: 'The payload of Bar',
  });

  expect(getTreeNode(t, ['Not existent'])).toBeUndefined();
});

describe('setTreeNode', () => {
  it('should create intermediate nodes', () => {
    const t = createEmptyTree();
    setTreeNode(t, ['Foo', 'Bar'], {
      children: {},
      payload: 'Foo/Bar content',
    });
    expect(t).toEqual({
      children: {
        Foo: {
          children: {
            Bar: { children: {}, payload: 'Foo/Bar content' },
          },
          payload: undefined,
        },
      },
      payload: undefined,
    });
    expect(getTreeNode(t, ['Foo', 'Bar'])).toEqual({
      children: {},
      payload: 'Foo/Bar content',
    });
  });

  it('should work while adding nested nodes', () => {
    const t2 = createEmptyTree();
    setTreeNode(t2, [], {
      children: {
        Foo: {
          children: {
            FooChild1: {
              children: {},
              payload: 'Payload of FooChild1',
            },
          },
          payload: 'The payload of Foo',
        },
      },
      payload: undefined,
    });
    expect(t2).toEqual({
      children: {
        Foo: {
          children: {
            FooChild1: {
              children: {},
              payload: 'Payload of FooChild1',
            },
          },
          payload: 'The payload of Foo',
        },
      },
      payload: undefined,
    });
    expect(getTreeNode(t2, ['Foo', 'FooChild1'])).toEqual({
      children: {},
      payload: 'Payload of FooChild1',
    });
  });
});

test('getTreeNodePayload', () => {
  const t: StringTree = {
    children: {
      Foo: {
        children: {
          FooChild1: {
            children: {},
            payload: 'Payload of FooChild1',
          },
        },
        payload: 'The payload of Foo',
      },
      Bar: {
        children: {},
        payload: 'The payload of Bar',
      },
    },
    payload: 'Root',
  };

  expect(getTreeNodePayload(t, [])).toBe('Root');
  expect(getTreeNodePayload(t, ['Foo'])).toBe('The payload of Foo');
  expect(getTreeNodePayload(t, ['Bar'])).toBe('The payload of Bar');
  expect(getTreeNodePayload(t, ['Baz'])).toBeUndefined();
  expect(getTreeNodePayload(t, ['Foo', 'FooChild1'])).toBe(
    'Payload of FooChild1'
  );
  expect(getTreeNodePayload(t, ['Foo', 'FooChild1', 'Bar'])).toBeUndefined();
});

describe('setTreeNodePayload', () => {
  it('should work for root payload', () => {
    const t = createEmptyTree();
    setTreeNodePayload(t, [], 'Root Payload');
    expect(t).toEqual({
      children: {},
      payload: 'Root Payload',
    });
  });

  it('should create intermediate nodes', () => {
    const t = createEmptyTree();
    setTreeNodePayload(t, ['Foo', 'Bar'], 'Bar Payload');
    expect(t).toEqual({
      children: {
        Foo: {
          payload: undefined,
          children: {
            Bar: {
              children: {},
              payload: 'Bar Payload',
            },
          },
        },
      },
      payload: undefined,
    });

    expect(getTreeNode(t, ['Foo', 'Bar'])).toEqual({
      children: {},
      payload: 'Bar Payload',
    });
  });

  it('should leave the children untouched', () => {
    const t = createEmptyTree();
    setTreeNodePayload(t, ['Foo', 'Bar'], 'Bar Payload');
    setTreeNodePayload(t, ['Foo'], 'Foo Payload');

    expect(getTreeNodePayload(t, ['Foo'])).toBe('Foo Payload');
    expect(getTreeNodePayload(t, ['Foo', 'Bar'])).toBe('Bar Payload');
  });
});

test('moveSubtree', () => {
  const t1 = createEmptyTree();
  setTreeNodePayload(t1, ['Foo', 'Bar', 'Baz'], 'Foo/Bar/Baz Payload');
  moveSubtree(t1, ['Foo'], ['New', 'Parent']);

  expect(getTreeNode(t1, ['Foo'])).toBeUndefined();
  expect(getTreeNode(t1, ['New', 'Parent', 'Foo'])).toEqual({
    payload: undefined,
    children: {
      Bar: {
        payload: undefined,
        children: {
          Baz: {
            payload: 'Foo/Bar/Baz Payload',
            children: {},
          },
        },
      },
    },
  });
  expect(
    getTreeNodePayload(t1, ['New', 'Parent', 'Foo', 'Bar', 'Baz'])
  ).toEqual('Foo/Bar/Baz Payload');
});

test('changeTreeNodeName', () => {
  const t = createEmptyTree();
  setTreeNodePayload(t, ['Foo', 'Bar'], 'Foo/Bar Payload');
  const tOrig = JSON.parse(JSON.stringify(t));

  // It should do nothing for non existing paths.
  changeTreeNodeName(t, ['Something', 'Bar'], 'Baz');
  expect(t).toEqual(tOrig);

  // It should change node name for existing paths.
  changeTreeNodeName(t, ['Foo', 'Bar'], 'Baz');
  expect(getTreeNodePayload(t, ['Foo', 'Bar'])).toBeUndefined();
  expect(getTreeNodePayload(t, ['Foo', 'Baz'])).toEqual('Foo/Bar Payload');

  // It should handle old name === new name correctly.
  changeTreeNodeName(t, ['Foo', 'Baz'], 'Baz');
  expect(getTreeNodePayload(t, ['Foo', 'Baz'])).toEqual('Foo/Bar Payload');
});

describe('removeTreeNode', () => {
  it('should remove a node and the node and its children should be gone', () => {
    const t = createEmptyTree();
    setTreeNodePayload(t, ['Foo'], 'Hello');
    setTreeNodePayload(t, ['Foo', 'Bar'], 'World');
    removeTreeNode(t, ['Foo']);
    expect(getTreeNodePayload(t, ['Foo', 'Bar'])).toBeUndefined();
    expect(getTreeNodePayload(t, ['Foo'])).toBeUndefined();
  });

  it('should remove a node but not its parent if the parent has a payload', () => {
    const t = createEmptyTree();
    setTreeNodePayload(t, ['Foo'], 'Hello');
    setTreeNodePayload(t, ['Foo', 'Bar'], 'World');
    removeTreeNode(t, ['Foo', 'Bar']);
    expect(getTreeNodePayload(t, ['Foo', 'Bar'])).toBeUndefined();
    expect(getTreeNodePayload(t, ['Foo'])).toBe('Hello');
  });
  it('should remove a node but not its parent if the parent has another child', () => {
    const t = createEmptyTree();
    setTreeNodePayload(t, ['Foo', 'Bar'], 'Foo/Bar Payload');
    setTreeNodePayload(t, ['Foo', 'Baz'], 'Foo/Baz Payload');
    removeTreeNode(t, ['Foo', 'Bar']);
    expect(getTreeNodePayload(t, ['Foo', 'Bar'])).toBeUndefined();
    expect(getTreeNodePayload(t, ['Foo', 'Baz'])).toBe('Foo/Baz Payload');
  });

  it('should do nothing on an empty tree', () => {
    const t = createEmptyTree();
    removeTreeNode(t, []);
    removeTreeNode(t, ['Foo', 'Bar']);
    expect(t).toEqual({ children: {}, payload: undefined });
  });

  it('should clear the tree with an empty path', () => {
    const t = createEmptyTree();
    setTreeNodePayload(t, ['Foo', 'Bar'], 'Foo/Bar Payload');
    setTreeNodePayload(t, ['Foo', 'Baz'], 'Foo/Baz Payload');
    setTreeNodePayload(t, ['Foo'], 'Foo Payload');
    removeTreeNode(t, []);
    expect(t).toEqual({ children: {}, payload: undefined });
  });
});
