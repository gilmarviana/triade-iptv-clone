import React, { useEffect } from 'react';
import { loadGoogleTagManager } from '../utils/scriptLoader';

/**
 * Componente para carregar Google Tag Manager de forma otimizada
 * Carrega apenas após interação do usuário para melhorar performance
 */
const GTMLoader = ({ containerId = 'GTM-5FJ948RV' }) => {
  useEffect(() => {
    // Carregar GTM após interação do usuário
    const events = ['click', 'scroll', 'keydown', 'touchstart', 'mousemove'];
    let hasInteracted = false;

    const loadGTM = () => {
      if (hasInteracted) return;
      hasInteracted = true;

      // Remover listeners
      events.forEach(event => {
        document.removeEventListener(event, loadGTM);
      });

      // Carregar GTM com delay maior para melhor performance
      setTimeout(() => {
        loadGoogleTagManager(containerId).catch(error => {
          console.warn('Failed to load GTM:', error);
        });
      }, 3000); // Aumentado para 3 segundos
    };

    // Adicionar listeners para interação
    events.forEach(event => {
      document.addEventListener(event, loadGTM, { once: true, passive: true });
    });

    // Fallback: carregar após 30 segundos (aumentado)
    setTimeout(loadGTM, 30000);

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, loadGTM);
      });
    };
  }, [containerId]);

  return null; // Componente não renderiza nada
};

export default GTMLoader; 