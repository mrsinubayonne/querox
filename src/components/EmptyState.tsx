
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ""
}) => {
  return (
    <Card className={`text-center ${className}`}>
      <CardHeader className="pb-4">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Icon className="h-8 w-8 text-gray-400" />
        </div>
        <CardTitle className="text-xl text-gray-900">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-6">{description}</p>
        {actionLabel && onAction && (
          <Button onClick={onAction} className="mx-auto">
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EmptyState;
