import { useEffect, useRef } from 'react';
import * as ChannelService from '@channel.io/channel-web-sdk-loader';
import type { User } from '../contexts/AuthContext';

const PLUGIN_KEY = import.meta.env.VITE_CHANNEL_TALK_PLUGIN_KEY;

/**
 * 채널톡 SDK 초기화 및 사용자 연동 훅
 * - 로그인 시: 멤버로 부트 (사용자 정보 연동)
 * - 로그아웃 시: shutdown 후 익명 부트
 */
export function useChannelTalk(user: User | null, isAuthenticated: boolean) {
  const isBootedRef = useRef(false);
  const prevUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    // 플러그인 키가 없으면 초기화하지 않음
    if (!PLUGIN_KEY) {
      console.warn('[ChannelTalk] VITE_CHANNEL_TALK_PLUGIN_KEY가 설정되지 않았습니다.');
      return;
    }

    // SDK 스크립트 로드 (최초 1회)
    ChannelService.loadScript();

    // 사용자 변경 감지 (로그인/로그아웃/다른 계정 로그인)
    const currentUserId = user?.id || null;
    const userChanged = prevUserIdRef.current !== currentUserId;

    if (userChanged && isBootedRef.current) {
      // 이전 세션 종료
      ChannelService.shutdown();
      isBootedRef.current = false;
    }

    // 부트 옵션 설정
    if (isAuthenticated && user) {
      // 로그인 상태: 멤버로 부트
      ChannelService.boot({
        pluginKey: PLUGIN_KEY,
        memberId: user.id,
        profile: {
          name: user.name || user.email,
          email: user.email,
        },
      });
    } else {
      // 비로그인 상태: 익명으로 부트
      ChannelService.boot({
        pluginKey: PLUGIN_KEY,
      });
    }

    isBootedRef.current = true;
    prevUserIdRef.current = currentUserId;
  }, [user, isAuthenticated]);
}
