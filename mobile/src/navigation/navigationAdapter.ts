import { useRouter } from 'expo-router';

export interface AppNavigation {
  navigate: (route: string, params?: any) => void;
  goBack: () => void;
  push: (route: string, params?: any) => void;
  replace: (route: string) => void;
}

export function useAppNavigation(): AppNavigation {
  const router = useRouter();

  return {
    navigate: (route: string, params?: any) => {
      switch (route) {
        case 'PlayerModal':
          router.push('/player');
          break;
        case 'ChatTab':
          router.push('/chat');
          break;
        case 'SearchTab':
          router.push('/search');
          break;
        case 'ProfileTab':
          router.push('/profile');
          break;
        case 'HomeTab':
          router.push('/');
          break;
        case 'GenreSelect':
        case 'OnboardingGenres':
          router.push({ pathname: '/genre-select', params });
          break;
        case 'UsernameInput':
          router.push('/username-input');
          break;
        case 'Login':
          router.replace('/login');
          break;
        default:
          router.push(route as any);
          break;
      }
    },
    goBack: () => {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/');
      }
    },
    push: (route: string, params?: any) => router.push({ pathname: route as any, params }),
    replace: (route: string) => router.replace(route as any),
  };
}
