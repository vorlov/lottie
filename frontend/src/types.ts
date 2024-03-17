export enum MessageType {
  EditStart = 'EditStart',
  EditEnd = 'EditEnd',
  Text = 'Text',
}

export type StoredAnimation = {
  data: LottieAnimation;
  url: string;
  scale: number;
};

export type Message = {
  name?: string;
  message?: string;
  type: MessageType;
  editBy?: string;
  animation?: StoredAnimation
};

export enum EventType { 
  ChatMessage = 'ChatMessage',
  Edit = 'Edit'
}

export type LottieAnimation = {
  v: string; // Version
  fr: number; // Frame rate
  ip: number; // In point (start frame)
  op: number; // Out point (end frame)
  w: number; // Width
  h: number; // Height
  nm?: string; // Name
  ddd?: number; // 3D layer flag
  assets: Asset[];
  layers: Layer[];
  meta?: { g: string }; // Metadata
};

type Asset = {
  id: string;
  w?: number;
  h?: number;
  u?: string; // URI
  p?: string; // Path
  e?: number;
  layers?: Layer[];
};

type Layer = {
  ddd?: number; // 3D layer
  ind: number; // Index
  ty: number; // Type
  nm?: string; // Name
  sr?: number; // Stretch
  st?: number; // Start
  op?: number; // Out point
  ip?: number; // In point
  hd?: boolean; // Hidden
  ks: Transform; // Transform keyframes
  shapes?: Shape[];
  hasMask?: boolean;
  masksProperties?: MaskProperty[];
  ao?: number; // Auto-Orient
};

type Transform = {
  a?: KeyframeValue<Point>; // Anchor point
  p?: KeyframeValue<Point>; // Position
  s?: KeyframeValue<Point>; // Scale
  r?: KeyframeValue<number>; // Rotation
  o?: KeyframeValue<number>; // Opacity
  sk?: KeyframeValue<number>; // Skew
  sa?: KeyframeValue<number>; // Skew Axis
};

export type Shape = {
  ty: string; // Type
  nm?: string; // Name
  gr?: GroupShape; // Group shape properties
  sh?: ShapePath; // Shape path properties
  c?: ShapeColor; // Color config
  it?: Shape[]; // Array of shapes in the group
};

type ShapeColor = {
  a?: 0 | 1; // Animated flag
  k: number[]; // Color keyframes
}

type GroupShape = {
  it: Shape[]; // Array of shapes in the group
};

type ShapePath = {
  ks: ShapePathKeyframes; // Shape path keyframes
  c?: boolean; // Closed path flag
};

type ShapePathKeyframes = {
  a?: KeyframeValue<Point>; // Anchor point keyframes
  p?: KeyframeValue<Point>; // Position keyframes
  s?: KeyframeValue<Point>; // Scale keyframes
  r?: KeyframeValue<number>; // Rotation keyframes
  o?: KeyframeValue<number>; // Opacity keyframes
  sk?: KeyframeValue<number>; // Skew keyframes
  sa?: KeyframeValue<number>; // Skew Axis keyframes
  hd?: KeyframeValue<boolean>; // Hidden keyframes
  ix?: number; // Index
};

type MaskProperty = {
  // Define mask properties
};

type KeyframeValue<T> = {
  a: 0 | 1; // Animated flag
  k: T | Keyframe<T>[]; // Value or keyframe array
};

type Keyframe<T> = {
  t: number; // Time
  s: T; // Start value
  e?: T; // End value
  // Add more easing and interpolation properties as needed
};

type Point = number[]; // Typically [x, y] or [x, y, z]
