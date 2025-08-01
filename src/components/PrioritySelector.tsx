import React from 'react';
import { ChevronDown, Circle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type Priority = 'high' | 'medium' | 'low';

interface PrioritySelectorProps {
  priority: Priority;
  onPriorityChange: (priority: Priority) => void;
  className?: string;
}

export const PrioritySelector: React.FC<PrioritySelectorProps> = ({
  priority,
  onPriorityChange,
  className = ''
}) => {
  const { t } = useTranslation();

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-blue-500';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <select
        value={priority}
        onChange={(e) => onPriorityChange(e.target.value as Priority)}
        className="appearance-none bg-white border border-gray-300 rounded px-3 py-1 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="high">{t('storyMap.priority.high')}</option>
        <option value="medium">{t('storyMap.priority.medium')}</option>
        <option value="low">{t('storyMap.priority.low')}</option>
      </select>
      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      <div className={`absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full ${getPriorityColor(priority)}`} />
    </div>
  );
};

export const PriorityBadge: React.FC<{ priority: Priority; className?: string }> = ({
  priority,
  className = ''
}) => {
  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-blue-500';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${className}`}>
      <div className={`w-2 h-2 rounded-full ${getPriorityColor(priority)}`} />
      {priority}
    </div>
  );
};

// New component for priority icon in bottom-right corner
export const PriorityIcon: React.FC<{ priority: Priority; className?: string }> = ({
  priority,
  className = ''
}) => {
  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-blue-500';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <Circle 
      className={`w-3 h-3 ${getPriorityColor(priority)} ${className}`} 
      fill="currentColor"
    />
  );
}; 