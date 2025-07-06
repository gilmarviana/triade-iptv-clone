import React, { useState } from 'react';
import './Contato.css';

const whatsappNumber = '5519998305956';

const Contato = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const texto = `Olá, gostaria de entrar em contato!%0A%0ANome: ${encodeURIComponent(nome)}%0AEmail: ${encodeURIComponent(email)}%0AMensagem: ${encodeURIComponent(mensagem)}`;
    const url = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${texto}`;
    window.open(url, '_blank');
  };

  return (
    <section className="contato" id="contato">
      <h2>Contato</h2>
      <div className="contato__info">
        <p>Telefone: <a href="tel:19971243873">19 97124 3873</a></p>
        <p>Email: <a href="mailto:contato@tradeiptv.com.br">contato@tradeiptv.com.br</a></p>
      </div>
      <form className="contato__form" onSubmit={handleSubmit}>
        <input type="text" placeholder="Seu nome" required value={nome} onChange={e => setNome(e.target.value)} />
        <input type="email" placeholder="Seu email" required value={email} onChange={e => setEmail(e.target.value)} />
        <textarea placeholder="Sua mensagem" required value={mensagem} onChange={e => setMensagem(e.target.value)}></textarea>
        <button type="submit">Enviar</button>
      </form>
    </section>
  );
};

export default Contato; 