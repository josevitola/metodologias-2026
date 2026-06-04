import styled from 'styled-components';

export const StyledWebcamContainer = styled.div`
  & > canvas {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
`;

export const StyledVideo = styled.video``;
