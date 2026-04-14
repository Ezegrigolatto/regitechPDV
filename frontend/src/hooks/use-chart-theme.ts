import { useThemeStore } from '@/stores/theme.store';

export function useChartTheme() {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  return {
    gridColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    axisColor: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
    tooltipBg: isDark ? '#1c1c1c' : '#ffffff',
    tooltipBorder: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    tooltipColor: isDark ? '#f5f5f5' : '#1a1a1a',
  };
}