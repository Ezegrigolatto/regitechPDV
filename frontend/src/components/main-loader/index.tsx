import { cn } from '@/lib/utils';
import { useThemeStore } from '@/stores/theme.store';

interface MainLoaderProps {
  className?: string;
}

export default function MainLoader({ className }: MainLoaderProps) {
  const { theme } = useThemeStore();

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center gap-12 bg-background',
        className,
      )}
    >

      {/* animation */}
      <div className="relative w-32 h-32 flex items-center justify-center">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="absolute w-7 h-7 bg-primary"
            style={{
              animation: `morph-${i} 4s infinite ease-in-out`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
