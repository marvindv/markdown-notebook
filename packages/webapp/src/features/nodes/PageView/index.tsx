import 'github-markdown-css';
import React from 'react';
import { Path } from 'src/models/node';
import styled from 'styled-components';
import Editor from './Editor';
import Markdown from './Markdown';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: auto;
`;

const StyledEditor = styled(Editor)`
  width: 100%;
  height: 100%;
`;

const StyledMarkdown = styled(Markdown)``;

const PageContent = styled.div`
  max-height: 100%;
  overflow: hidden;
  flex: 1;
  display: flex;

  ${StyledEditor}, ${StyledMarkdown} {
    width: 50%;
  }

  ${StyledEditor}:only-child, ${StyledMarkdown}:only-child {
    flex: 1;
    width: 100%;
  }

  ${StyledEditor} + ${StyledMarkdown} {
    border-left: ${props => props.theme.borders.width} solid ${props =>
  props.theme.borders.color}
  }
`;

export type ViewMode = 'editor' | 'preview' | 'side-by-side';

export interface Props {
  className?: string;
  content: string;
  path: Path;
  viewMode: ViewMode;
  onChange: (content: string) => void;
  onSaveClick: (path: Path) => void;
  onSaveAllClick: () => void;
}

export default function PageView(props: Props) {
  const {
    className,
    content,
    path,
    viewMode,
    onChange,
    onSaveClick,
    onSaveAllClick,
  } = props;

  return (
    <Container className={className}>
      <PageContent className='PageContent'>
        {(viewMode === 'editor' || viewMode === 'side-by-side') && (
          <StyledEditor
            path={path}
            content={content}
            onContentChange={onChange}
            onSave={() => onSaveClick(props.path)}
            onSaveAll={onSaveAllClick}
          />
        )}
        {/*
          apply https://github.com/sindresorhus/github-markdown-css with
          .markdown-body
        */}
        {(viewMode === 'preview' || viewMode === 'side-by-side') && (
          <Markdown content={content} />
        )}
      </PageContent>
    </Container>
  );
}
