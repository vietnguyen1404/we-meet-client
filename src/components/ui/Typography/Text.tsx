type TextVariant = 'body' | 'caption' | 'muted';

interface TextProps {
  variant?: TextVariant;
  as?: 'p' | 'span';
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<TextVariant, string> = {
  body: 'text-base text-gray-900',
  caption: 'text-sm text-gray-500',
  muted: 'text-sm text-gray-400',
};

export function Text({ variant = 'body', as: Tag = 'p', children, className }: TextProps) {
  return <Tag className={className ?? variantStyles[variant]}>{children}</Tag>;
}
