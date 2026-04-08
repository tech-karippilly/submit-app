/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'react-quill' {
  import { ComponentType } from 'react';
  interface ReactQuillProps {
    theme?: string;
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    onChangeSelection?: (range: unknown, source: unknown, editor: unknown) => void;
    onFocus?: (range: unknown, source: unknown, editor: unknown) => void;
    onBlur?: (previousRange: unknown, source: unknown, editor: unknown) => void;
    placeholder?: string;
    modules?: Record<string, unknown>;
    formats?: string[];
    style?: React.CSSProperties;
    className?: string;
    readOnly?: boolean;
    preserveWhitespace?: boolean;
  }
  const ReactQuill: ComponentType<ReactQuillProps>;
  export default ReactQuill;
}
