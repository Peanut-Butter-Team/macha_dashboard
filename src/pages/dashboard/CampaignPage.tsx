import { useState, useEffect } from 'react';
import { CampaignTab } from '../../components/tabs/CampaignTab';
import {
  useInfluencers,
  useSeedingList,
  useAffiliateLinks,
  useContentList,
  useAIAnalysis,
} from '../../hooks/useApi';
import type { SeedingItem } from '../../types';

export function CampaignPage() {
  const [localSeedingList, setLocalSeedingList] = useState<SeedingItem[]>([]);

  // API 데이터
  const { data: influencers, loading: influencersLoading } = useInfluencers();
  const { data: seedingList, loading: seedingLoading } = useSeedingList();
  const { loading: affiliateLoading } = useAffiliateLinks();
  const { data: contentList, loading: contentLoading } = useContentList();
  const { data: aiAnalysis, loading: aiLoading } = useAIAnalysis();

  // seedingList가 로드되면 localSeedingList 초기화
  useEffect(() => {
    if (seedingList) {
      setLocalSeedingList(seedingList);
    }
  }, [seedingList]);

  const isLoading = influencersLoading || seedingLoading || affiliateLoading || contentLoading || aiLoading;

  return (
    <CampaignTab
      influencers={influencers}
      seedingList={localSeedingList}
      contentList={contentList}
      aiAnalysis={aiAnalysis}
      loading={isLoading}
    />
  );
}
