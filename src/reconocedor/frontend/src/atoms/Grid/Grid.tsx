import { GridContainer, GridContainerProps } from './Grid.styles';

interface GridProps extends GridContainerProps {
  children: React.ReactNode;
}

export const Grid: React.FC<GridProps> = ({ cols, rows, children }) => (
  <GridContainer {...{ cols, rows }}>{children}</GridContainer>
);
