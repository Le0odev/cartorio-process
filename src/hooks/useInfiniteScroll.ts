import { useEffect, useCallback, useRef } from 'react';

interface UseInfiniteScrollOptions {
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  threshold?: number; // Distância do final para disparar o carregamento (em pixels)
}

export const useInfiniteScroll = ({
  hasMore,
  loading,
  onLoadMore,
  threshold = 200
}: UseInfiniteScrollOptions) => {
  const containerRef = useRef<HTMLElement | null>(null);

  const handleScroll = useCallback(() => {
    if (!containerRef.current || loading || !hasMore) return;

    const container = containerRef.current;
    const { scrollTop, scrollHeight, clientHeight } = container;
    
    // Verificar se chegou próximo ao final
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    if (distanceFromBottom < threshold) {
      onLoadMore();
    }
  }, [loading, hasMore, onLoadMore, threshold]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  // Função para definir o container de scroll
  const setScrollContainer = useCallback((element: HTMLElement | null) => {
    containerRef.current = element;
  }, []);

  return { setScrollContainer };
};