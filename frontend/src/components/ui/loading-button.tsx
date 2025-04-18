import { Loader2 } from 'lucide-react';
import { Button } from './button';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  isLoading?: boolean;
  children: React.ReactNode;
}

export default function LoadingButton({
  isLoading,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <Button className={`${className} ${isLoading ? 'cursor-not-allowed' : ''}`}>
      {isLoading ? (
        <Loader2 style={{ animation: 'spin 0.5s linear infinite' }} />
      ) : (
        props.children
      )}
    </Button>
  );
}
