import { useTranslation } from 'react-i18next';
import { Heading } from '@/components/ui';
import VideocamIcon from '@/assets/icons/videocam.svg?react';
import { cn } from '@/shared';

type HeaderVariant = 'solid' | 'transparent';

interface HeaderProps {
  variant?: HeaderVariant;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export const Header = ({ variant = 'solid', actions, children }: HeaderProps) => {
  const { t } = useTranslation();

  const isTransparent = variant === 'transparent';

  return (
    <header
      className={cn(
        'w-full z-50 flex items-center justify-between px-6 md:px-8 py-5',
        isTransparent ? 'absolute top-0 bg-transparent' : 'bg-white border-b border-gray-200',
      )}
    >
      <div className="flex items-center gap-2">
        <div className="bg-primary p-1.5 rounded-lg text-white">
          <VideocamIcon className="w-6 h-6" />
        </div>
        <Heading level={2} className="text-xl font-bold tracking-tight text-slate-800">
          {t('common.appName')}
        </Heading>
      </div>

      {children}

      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </header>
  );
};
