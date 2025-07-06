import React from 'react';
import './FAQ.css';

const faqs = [
  {
    pergunta: 'Como Funciona?',
    resposta: 'Você precisa de uma internet com no mínimo 10MB de velocidade e um desses aparelhos: Smart TV, BoxTV, Smartphone (android ou IOS), Tablet, PC, Notebook, Play Station 4 ou XBoxOne.'
  },
  {
    pergunta: 'Suporte e Atualizações?',
    resposta: 'Suporte qualificado via Chat e WhatsApp, qualquer problema que ocorrer estaremos à disposição.'
  },
  {
    pergunta: 'Como funciona o Pagamento?',
    resposta: 'Possuímos planos mensais e mais longos como os anuais com grandes descontos, sem fidelidade.'
  },
  {
    pergunta: 'Devo utilizar IPTV ou P2P?',
    resposta: 'O sistema IPTV conta com incrível compatibilidade com diversos dispositivos. O sistema P2P funciona somente em Android, requer menos internet, mas tem maior atraso (delay).' 
  },
];

const FAQ = () => (
  <section className="faq" id="faq">
    <h2>Perguntas & Respostas</h2>
    <div className="faq__list">
      {faqs.map((faq, idx) => (
        <div className="faq__item" key={idx}>
          <h3>{faq.pergunta}</h3>
          <p>{faq.resposta}</p>
        </div>
      ))}
    </div>
  </section>
);

export default FAQ; 