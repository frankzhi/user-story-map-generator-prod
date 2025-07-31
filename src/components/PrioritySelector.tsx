import React from 'react';
import { ChevronDown } from 'lucide-react';
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
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityText = (priority: Priority) => {
    return t(`storyMap.priority.${priority}`);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <select
        value={priority}
        onChange={(e) => onPriorityChange(e.target.value as Priority)}
        className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-1 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="high">{t('storyMap.priority.high')}</option>
        <option value="medium">{t('storyMap.priority.medium')}</option>
        <option value="low">{t('storyMap.priority.low')}</option>
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </div>
      <div className={`absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full ${getPriorityColor(priority)}`} />
    </div>
  );
};

export const PriorityBadge: React.FC<{ priority: Priority; className?: string }> = ({
  priority,
  className = ''
}) => {
  const { t } = useTranslation();

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(priority)} ${className}`}>
      <div className={`w-2 h-2 rounded-full mr-1 ${priority === 'high' ? 'bg-red-500' : priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`} />
      {t(`storyMap.priority.${priority}`)}
    </span>
  );
}; 