import React, { PropsWithChildren } from 'react';
import styled from 'styled-components';

const Element = styled.li`
  color: ${props => props.theme.typo.mutedColor};
  padding: 1rem;
`;

export type Props = PropsWithChildren<{
  className?: string;
}>;

/**
 * This is a placeholder element that can be used for empty navigation columns.
 *
 * @export
 * @param {Props} props
 * @returns
 */
export default function EmptyElement(props: Props) {
  return <Element {...props}>{props.children}</Element>;
}
