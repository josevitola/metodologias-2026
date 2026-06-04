import { StyledButton } from './Button.styles';

export const Button = ({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) => {
  return <StyledButton onClick={onClick}>{label}</StyledButton>;
};
