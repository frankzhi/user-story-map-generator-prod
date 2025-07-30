import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center space-x-2">
      <Globe className="w-4 h-4 text-gray-600" />
      <select
        value={i18n.language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="px-2 py-1 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="en">{t('common.english')}</option>
        <option value="zh">{t('common.chinese')}</option>
      </select>
    </div>
  );
};

export default LanguageSwitcher; 