import { darken } from 'polished';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import styled from 'styled-components';

const Container = styled.div`
  margin: 0 auto;

  /* Based on https://github.com/sindresorhus/github-markdown-css#usage */
  .markdown-body {
    max-width: 980px;
    margin: 0 auto;
    padding: 45px;

    @media (max-width: 767px) {
      padding: 15px;
    }

    color: ${props => props.theme.baseColors.foreground};

    pre {
      background-color: ${props =>
        darken(0.05, props.theme.baseColors.contentBackground)};
    }
  }

  overflow: auto;
`;

export interface Props {
  className?: string;
  content: string;
}

export default function Markdown(props: Props) {
  const { className, content } = props;
  return (
    <Container className={className}>
      <div className='markdown-body'>
        <ReactMarkdown source={content} />
      </div>
    </Container>
  );
}
