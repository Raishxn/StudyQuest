import * as React from 'react';

// Bypasses the strict ReactNode requirements causing TS2786 element return type errors
// during migrations between React 18 types and libraries assuming React 19 types.
declare global {
  namespace JSX {
    interface Element extends React.ReactElement<any, any> {}
    interface ElementClass extends React.Component<any> {
      render(): React.ReactNode;
    }
    interface ElementAttributesProperty {
      props: {};
    }
    interface ElementChildrenAttribute {
      children: {};
    }
    interface IntrinsicAttributes extends React.Attributes {}
    interface IntrinsicClassAttributes<T> extends React.ClassAttributes<T> {}
  }
}

// Ensure the file is treated as a module
export {};
