export type SlotKey = 'province' | 'score' | 'uni' | 'major' | 'career' | 'year' | 'mbti';

export interface CtaAction {
  type: 'route' | 'link';
  path: string;
  params?: Record<string, string>;
}

export interface TemplateBlockBase {
  type: 'title' | 'text' | 'list' | 'cta' | 'disclaimer';
}

export interface TemplateBlockTitle extends TemplateBlockBase {
  type: 'title';
  content: string;
}

export interface TemplateBlockText extends TemplateBlockBase {
  type: 'text';
  content: string;
}

export interface TemplateBlockList extends TemplateBlockBase {
  type: 'list';
  items: string[];
}

export interface TemplateBlockCta extends TemplateBlockBase {
  type: 'cta';
  label: string;
  description?: string;
  action: CtaAction;
}

export interface TemplateBlockDisclaimer extends TemplateBlockBase {
  type: 'disclaimer';
  content: string;
}

export type TemplateBlock =
  | TemplateBlockTitle
  | TemplateBlockText
  | TemplateBlockList
  | TemplateBlockCta
  | TemplateBlockDisclaimer;

export interface TemplateVariant {
  blocks: TemplateBlock[];
  quickReplies?: string[];
}

export interface TemplateGroup {
  variants: TemplateVariant[];
}

export interface Intent {
  id: string;
  keywords: string[];
  regex?: string[];
  negative?: string[];
  requiredSlots: SlotKey[];
  templateGroup: string;
  slotPrompts?: Partial<Record<SlotKey, string>>;
}
