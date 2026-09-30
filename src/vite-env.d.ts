/// <reference types="vite/client" />
import type * as React from 'react';

declare module '*?raw' {
  const content: string;
  export default content;
}

declare global {
  namespace JSX {
    interface IntrinsicAttributes {
      key?: React.Key;
    }
  }
}
