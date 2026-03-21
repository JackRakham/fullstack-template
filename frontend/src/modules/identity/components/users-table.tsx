'use client';

import { Modal } from '@/src/components/common/modal';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/src/components/ui/button';

export const UsersTable = () => {
  const { t } = useTranslation(['identity', 'common']);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-zinc-100">{t('identity:usersManagement')}</h2>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="font-medium"
        >
          {t('identity:addUser')}
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              <th className="py-3 px-4 font-semibold text-sm text-gray-600 dark:text-gray-400">{t('common:id')}</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-600 dark:text-gray-400">{t('identity:userName')}</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-600 dark:text-gray-400">{t('identity:userEmail')}</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-600 dark:text-gray-400">{t('common:actions')}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
              <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">1</td>
              <td className="py-4 px-4 text-sm font-medium text-gray-800 dark:text-zinc-100">Admin User</td>
              <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">admin@example.com</td>
              <td className="py-4 px-4 text-sm">
                <Button variant="link" className="h-auto p-0 text-blue-600 hover:text-blue-700 font-medium">
                  {t('common:edit')}
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="md">
        <div className="p-6">
          <h3 className="text-lg font-bold mb-4 dark:text-zinc-100">{t('identity:addNewUser')}</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('identity:demoDescription')}
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              {t('common:cancel')}
            </Button>
            <Button
              onClick={() => setIsModalOpen(false)}
            >
              {t('common:save')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
