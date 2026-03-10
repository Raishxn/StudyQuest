import * as React from 'react';

declare module 'lucide-react' {
  import { LucideProps } from 'lucide-react';
  // Override the strict return type to be compatible with older React/@types/react configurations
  // The actual implementation is fine, it's just a TS mismatch 
  export type Icon = React.FC<LucideProps>;
  export type LucideIcon = React.FC<LucideProps>;
  
  export const ArrowRight: Icon;
  export const Bell: Icon;
  export const BookOpen: Icon;
  export const Clock: Icon;
  export const Folder: Icon;
  export const Home: Icon;
  export const MessageCircle: Icon;
  export const MessageSquare: Icon;
  export const Moon: Icon;
  export const Pause: Icon;
  export const Play: Icon;
  export const Search: Icon;
  export const Settings: Icon;
  export const Square: Icon;
  export const Sun: Icon;
  export const Swords: Icon;
  export const Trophy: Icon;
  export const User: Icon;
  export const XCircle: Icon;
}
