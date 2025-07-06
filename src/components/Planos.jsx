import React from 'react';
import './Planos.css';

const planos = [
  {
    nome: 'Mensal',
    preco: 'R$ 10,00',
    descricao: [
      '1 Tela',
      '+30.000 Conteúdo',
      'Qualidade 4K/FHD/HD/SD',
      'Guia de Programação [EPG]',
      'Assista em qualquer dispositivo',
      'Programação Adultos [Opcional]',
      'Rádios e Clipes Online',
      'Cortesias: Pacote Filmes e Séries',
    ],
    selo: null,
  },
  {
    nome: 'Semestral',
    preco: 'R$ 79,00',
    descricao: [
      '2 Telas',
      '+30.000 Conteúdo',
      'Qualidade 4K/FHD/HD/SD',
      'Guia de Programação [EPG]',
      'Assista em qualquer dispositivo',
      'Programação Adultos [Opcional]',
      'Rádios Online',
      'Planos a partir de',
    ],
    selo: null,
  },
  {
    nome: 'Anual',
    preco: 'R$ 99,00',
    descricao: [
      '3 Telas',
      '+30.000 Conteúdo',
      'Qualidade 4K/FHD/HD/SD',
      'Guia de Programação [EPG]',
      'Assista em qualquer dispositivo',
      'Programação Adultos [Opcional]',
      'Rádios Online',
      'Cortesias: Pacote Filmes e Séries',
    ],
    selo: 'Promoção',
  },
];

const whatsappLink = "https://api.whatsapp.com/send?phone=5519998305956&text=Ol%C3%A1,%20Gostaria%20de%20testar%20o%20Barato%20IPTV!";

const Planos = () => (
  <section className="planos" id="planos">
    <h2>Planos</h2>
    <div className="planos__cards">
      {planos.map((plano) => (
        <div className={`plano__card${plano.selo ? ' selo' : ''}`} key={plano.nome}>
          {plano.selo && <div className="plano__selo">{plano.selo}</div>}
          <h3>{plano.nome}</h3>
          <div className="plano__preco">{plano.preco} <span></span></div>
          <ul>
            {plano.descricao.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
          <a href={whatsappLink} className="plano__btn" target="_blank" rel="noopener noreferrer">Testar Agora</a>
        </div>
      ))}
    </div>
  </section>
);

export default Planos; 