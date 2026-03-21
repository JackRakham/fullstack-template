"use client"

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/react-table';
import { usersControllerFindAll } from '@/src/api/generated/identity/identity/identity';
import { UserResponseDto } from '@/src/api/generated/identity/models';
import { DataTable } from '@/src/components/ui/data-table';
import { Button } from '@/src/components/ui/button';

export default function UsersPage() {
  const { t } = useTranslation(['identity', 'common']);

  // Data State
  const [data, setData] = useState<UserResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageCount, setPageCount] = useState(1);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch from Orval Client
  useEffect(() => {
    let active = true;

    async function fetchUsers() {
      setIsLoading(true);
      try {
        const response = await usersControllerFindAll({
          page: pageIndex,
          page_size: pageSize,
        });
        
        // Ensure component is still mounted
        if (active) {
          // Assuming standard generic paginated response: { items: [], meta: { totalPages: N } }
          // If the API returns differently, adjust map safely:
          const items = Array.isArray(response) ? response : (response as any).items || [];
          const pages = (response as any).meta?.totalPages || 1;
          
          setData(items);
          setPageCount(pages);
        }
      } catch (error) {
        console.error("Failed to fetch users", error);
        if (active) {
          setData([]);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    fetchUsers();

    return () => {
      active = false;
    };
  }, [pageIndex, pageSize]);

  // Define Columns with Tanstack
  const columns: ColumnDef<UserResponseDto>[] = [
    {
      accessorKey: 'id',
      header: t('common:id'),
    },
    {
      accessorKey: 'name',
      header: t('identity:userName'),
    },
    {
      accessorKey: 'email',
      header: t('identity:userEmail'),
    },
    {
      id: 'actions',
      header: t('common:actions'),
      cell: ({ row }) => {
        const user = row.original;
        return (
          <Button variant="link" className="p-0 text-blue-600 h-auto" onClick={() => console.log('Edit user', user.id)}>
            {t('common:edit')}
          </Button>
        );
      },
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <main className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-zinc-100">
            {t('identity:usersManagement')}
          </h2>
          <Button className="font-medium">
            {t('identity:addUser')}
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={data}
          pageCount={pageCount}
          isLoading={isLoading}
          onPaginationChange={(newPage, newLimit) => {
            setPageIndex(newPage);
            setPageSize(newLimit);
          }}
        />
      </main>
    </div>
  );
}
