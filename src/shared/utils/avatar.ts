export const getAvatarColor = (str: string) => {
  const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500'];

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

export const getInitialsFromName = (label: string): string => {
  const name = label.trim();
  if (!name) return '?';

  const parts = name.split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0][0]?.toUpperCase() ?? '?';
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};
