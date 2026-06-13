'use client';

import { NewAPIProviderCard } from 'model-bank/modelProviders';
import { useTranslation } from 'react-i18next';

import ProviderDetail from '../default';

const Page = () => {
  const { t } = useTranslation('modelProvider');

  return (
    <ProviderDetail
      {...NewAPIProviderCard}
      settings={{
        ...NewAPIProviderCard.settings,
        proxyUrl: {
          desc: t('newapi.apiUrl.desc'),
          placeholder: 'https://your-company-newapi.com',
          title: t('newapi.apiUrl.title'),
        },
      }}
    />
  );
};

export default Page;
