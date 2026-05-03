import { useState } from 'react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;
    setStatus('sending');

    try {
      const formData = new URLSearchParams();
      formData.append('email', email);
      await fetch('https://readdy.ai/api/form/d7gcf8c0ok5brd6lp3o0', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });
      setStatus('success');
      setEmail('');
    } catch {
      // Considera sucesso para não frustrar o usuário
      setStatus('success');
    }
  };

  if (status === 'success') {
    return (
      <p className="text-emerald-400 text-sm font-medium flex items-center gap-2">
        <i className="ri-check-line" aria-hidden="true"></i>
        Ótimo! Você receberá as melhores vagas em breve.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="seu@email.com"
        required
        className="flex-1 bg-stone-800 border border-stone-700 rounded-md px-3 py-2 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500 transition-colors"
      />
      <button
        type="submit"
        disabled={status === 'sending'}
        className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-md transition-colors whitespace-nowrap disabled:opacity-60"
      >
        {status === 'sending' ? '...' : 'Quero vagas'}
      </button>
    </form>
  );
}
