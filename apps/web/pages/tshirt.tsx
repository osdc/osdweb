import Head from 'next/head';
import Link from 'next/link';
import { FormEvent, useEffect, useRef, useState } from 'react';
import styles from '../components/TshirtForm.module.css';

type Design = 'open-source-tees-design-1' | 'cosmic-expansion-design-2';
const sizes = [
  { label: 'XS', chest: 40 }, { label: 'S', chest: 42 }, { label: 'M', chest: 44 },
  { label: 'L', chest: 46 }, { label: 'XL', chest: 48 }, { label: 'XXL', chest: 50 },
];
const designs = [
  { id: 'open-source-tees-design-1' as const, number: '01', title: 'The Open Source Tees', image: '/images/tshirts/open-source-tees-poster.png', alt: 'Beige OSDC T-shirt with hand-drawn open source city artwork', description: 'Hand-drawn open source city on a beige oversized T-shirt.' },
  { id: 'cosmic-expansion-design-2' as const, number: '02', title: 'Cosmic Expansion', image: '/images/tshirts/osdc-cosmic-expansion-design-2.png', alt: 'Black OSDC T-shirt with white cosmic expansion artwork', description: 'Black OSDC T-shirt with an illustrated timeline from the Big Bang to open source.' },
];

export default function TshirtPage() {
  const [design, setDesign] = useState<Design>('open-source-tees-design-1');
  const [openModal, setOpenModal] = useState<Design | null>(null);
  const [state, setState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const formRef = useRef<HTMLElement>(null);
  useEffect(() => {
    document.documentElement.classList.add('osdc-scroll-page'); document.body.classList.add('osdc-scroll-page');
    return () => { document.documentElement.classList.remove('osdc-scroll-page'); document.body.classList.remove('osdc-scroll-page'); };
  }, []);
  useEffect(() => {
    if (!openModal) return;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpenModal(null); };
    document.addEventListener('keydown', close); return () => document.removeEventListener('keydown', close);
  }, [openModal]);
  function choose(next: Design) {
    setDesign(next); setOpenModal(null);
    window.setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState('sending'); setMessage(''); const form = event.currentTarget;
    try {
      const response = await fetch('/api/tshirt', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
      if (!response.ok) throw new Error('Registration could not be sent. Please try again later.');
      form.reset(); setState('success');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Registration could not be sent.'); setState('error'); }
  }
  const modal = designs.find((item) => item.id === openModal);
  return <div className={styles.retroPage}>
    <Head><title>Register for an OSDC T-shirt</title><meta name="description" content="Choose an OSDC T-shirt design and register your size." /></Head>
    <header className={styles.header}><Link href="/" className={styles.brand}>OSDC<span> ✳</span></Link><Link href="/">Back to Clubbook ↗</Link></header>
    <main className={styles.main}>
      <p className={styles.eyebrow}>/Pocket/OSDC/T-shirts</p><h1>Pick your<br /><em>uniform.</em></h1><p className={styles.intro}>Two designs. ₹699 each. Open one for details, choose it, then register below.</p>
      <section className={styles.designGrid} aria-label="T-shirt designs">
        {designs.map((item) => <button type="button" className={`${styles.designCard} ${design === item.id ? styles.selected : ''}`} key={item.id} onClick={() => setOpenModal(item.id)}>
          <img src={item.image} alt={item.alt} /><span><small>DESIGN {item.number}</small><strong>{item.title}</strong><b>₹699 · {design === item.id ? 'SELECTED ✓' : 'VIEW DETAILS →'}</b></span>
        </button>)}
      </section>
      <section ref={formRef} className={styles.registration} aria-labelledby="registration-title">
        <p className={styles.eyebrow}>Selected: {design === 'open-source-tees-design-1' ? 'Design 01' : 'Design 02'}</p><h2 id="registration-title">Registration</h2>
        {state === 'success' ? <div className={styles.result} role="status"><h2>Registration sent.</h2><p>We’ve received your request. Watch your email for next steps.</p><button type="button" onClick={() => setState('idle')}>Register another person</button></div> :
        <form onSubmit={submit} className={styles.form}>
          <input type="hidden" name="design" value={design} />
          <label>Full name<input name="name" autoComplete="name" minLength={2} maxLength={100} required /></label>
          <label>Phone number<input name="phone" type="tel" inputMode="tel" autoComplete="tel" minLength={8} maxLength={20} required /></label>
          <label>Email address<input name="email" type="email" autoComplete="email" maxLength={200} required /></label>
          <label>T-shirt size<select name="size" defaultValue="" required><option value="" disabled>Select a size</option>{sizes.map(({ label }) => <option key={label}>{label}</option>)}</select></label>
          <label className={styles.full}>Address<textarea name="address" autoComplete="street-address" minLength={8} maxLength={300} rows={3} required /></label>
          <label className={styles.honeypot} aria-hidden="true">Leave empty<input name="website" tabIndex={-1} autoComplete="off" /></label>
          {state === 'error' && <p className={styles.error} role="alert">{message}</p>}
          <button className={styles.submit} disabled={state === 'sending'} type="submit">{state === 'sending' ? 'Sending…' : 'Send registration →'}</button>
        </form>}
      </section>
    </main><footer className={styles.footer}><span>OSDC · JIIT, Noida</span><Link href="/">Back to Clubbook</Link></footer>
    {modal && <div className={styles.backdrop} onMouseDown={(event) => { if (event.target === event.currentTarget) setOpenModal(null); }}>
      <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className={styles.titlebar}><strong>DESIGN_{modal.number}.APP</strong><button type="button" onClick={() => setOpenModal(null)} aria-label="Close">×</button></div>
        <div className={styles.modalBody}><div className={styles.modalImage}><img src={modal.image} alt={modal.alt} /></div><div className={styles.modalDetails}>
          <p className={styles.eyebrow}>Design {modal.number}</p><h2 id="modal-title">{modal.title}</h2><p>{modal.description}</p><strong className={styles.price}>₹699</strong>
          {modal.id === 'open-source-tees-design-1' ? <><a href="/images/tshirts/open-source-tees-size-chart.jpg" target="_blank" rel="noreferrer">Open size chart ↗</a><div className={styles.sizeStrip}>{sizes.map((size) => <span key={size.label}><b>{size.label}</b>{size.chest}&quot; chest</span>)}</div></> : <p className={styles.fitNote}>Size chart pending. Pick your usual size and the team will confirm the fit.</p>}
          <button className={styles.action} type="button" onClick={() => choose(modal.id)}>{design === modal.id ? 'Continue with this design' : 'Choose this design'}</button>
        </div></div>
      </section>
    </div>}
  </div>;
}
