import styled from 'styled-components';

export interface GridContainerProps {
  cols: number;
  rows: number;
}

export const GridContainer = styled.div<GridContainerProps>`
  display: grid;
  grid-template-columns: repeat(${({ cols }: { cols: number }) => cols}, 1fr);
  grid-template-rows: repeat(${({ rows }: { rows: number }) => rows}, 1fr);
  gap: 10px;
`;
