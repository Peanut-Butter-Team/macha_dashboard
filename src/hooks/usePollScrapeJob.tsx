import { useState } from "react";
import { fetchMetaDash } from "../services/metaDashApi";
import { useAuth } from "../contexts/AuthContext";
import {  MensionResponse } from "../types/mension-response.type";

interface StatusResponse {
  status: 'processing' | 'completed' | 'error';
  result: MensionResponse[] | null;
  error: string | null;
}

type Props = {
  campaignId: string;  
  onComplete?: (result: MensionResponse[]) => void;
}

export const usePollScrapeJob = ({ campaignId, onComplete }: Props) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    const pollJobStatus = async (jobId: string): Promise<void> => {
        setLoading(true);
        const maxAttempts = 1000;
        let attempts = 0;
    
        const poll = setInterval(async () => {
          attempts++;
    
          try {
            const response = await fetch(`http://3.25.179.50:3001/api/status/mension/${jobId}`).then<StatusResponse>(res => res.json())
            const { status, result: jobResult, error: jobError } = response;

            if (status === 'completed') {
              clearInterval(poll);
              setLoading(false);
              
              if(jobResult) {
                const yyyyMmDd = (() => {
                  const d = new Date();
                  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                })();
                
                const campaignData = jobResult.map(post => ({
                  "dashMemberId": user?.id,
                  "campaignId": campaignId,
                  "time": yyyyMmDd,
                  "postId": post.id,
                  "postType": post.postType,
                  "shortCode": post.shortCode,
                  "postUrl": post.postUrl,
                  "caption": post.caption,
                  "likesCount": post.likesCount,
                  "commentsCount": post.commentsCount,
                  "videoPlayCount": post.videoPlayCount,
                  "igPlayCount": post.igPlayCount,
                  "reshareCount": post.reshareCount,
                  "videoDuration": post.videoDuration,
                  "postedAt": post.postedAt?.replace(/Z$/, ''),
                  "ownerId": post.ownerId,
                  "ownerUsername": post.ownerUsername,
                  "ownerFullName": post.ownerFullName,
                  "ownerProfilePicUrl": post.ownerProfilePicUrl,
                  "displayUrl": post.displayUrl,
                  "videoUrl": post.videoUrl,
                  "images": post.images,
                  "hashtags": post.hashtags,
                  "mentions": post.mentions,
                  "taggedUsers": post.taggedUsers,
                  "musicInfo": post.musicInfo,
                  "coauthorProducers": post.coauthorProducers,
                  "childPosts": post.childPosts,
                }))

                await fetchMetaDash('/api/v1/dash-campaigns/result/create', {
                  method: 'POST',
                  body: JSON.stringify(campaignData)
                })
              }

              onComplete?.(jobResult ?? []);
              setError(null);
            } else if (status === 'error') {
              clearInterval(poll);
              setLoading(false);
              setError(jobError || '스크래핑 중 오류가 발생했습니다');
            } else if (attempts >= maxAttempts) {
              clearInterval(poll);
              setLoading(false);
              setError('요청 시간이 초과되었습니다');
            }
          } catch (err) {
            clearInterval(poll);
            setLoading(false);
            setError(err instanceof Error ? err.message : '상태 확인 중 오류가 발생했습니다');
          }
        }, 500);
      };

      return { loading, error, pollJobStatus };
}