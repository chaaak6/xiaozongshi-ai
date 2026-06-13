import type { ModelProviderCard } from '@/types/llm';

const NewAPI: ModelProviderCard = {
  chatModels: [],
  checkModel: 'gpt-4o-mini',
  description: '企业内部 AI 中转站，统一接入多种 AI 模型服务',
  enabled: true,
  id: 'newapi',
  name: 'AI 中转站',
  settings: {
    proxyUrl: {
      placeholder: 'https://your-company-newapi.com',
      desc: '公司内部部署的 New API 中转服务器地址',
      title: '服务器地址',
    },
    sdkType: 'router',
    showModelFetcher: true,
    supportResponsesApi: true,
  },
  url: 'https://github.com/QuantumNous/new-api',
};

export default NewAPI;
