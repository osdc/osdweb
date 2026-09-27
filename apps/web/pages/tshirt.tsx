import Head from 'next/head';
import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import formStyles from '../components/TshirtForm.module.css';

const sizes = [
  { label: 'XS', chest: 40, length: 27, shoulder: 18.5 },
  { label: 'S', chest: 42, length: 27.5, shoulder: 19.5 },
  { label: 'M', chest: 44, length: 27.5, shoulder: 20.5 },
  { label: 'L', chest: 46, length: 28.5, shoulder: 21.5 },
  { label: 'XL', chest: 48, length: 28.5, shoulder: 22.5 },
  { label: 'XXL', chest: 50, length: 29.5, shoulder: 23.5 },
];

export default function TshirtPage() {
  const [design, setDesign] = useState<'open-source-tees-design-1' | 'cosmic-expansion-design-2'>('open-source-tees-design-1');
  const [state, setState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  useEffect(() => {
    document.documentElement.classList.add('osdc-scroll-page');
    document.body.classList.add('osdc-scroll-page');
    return () => { document.documentElement.classList.remove('osdc-scroll-page'); document.body.classList.remove('osdc-scroll-page'); };
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState('sending');
    setMessage('');
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    try {
      const response = await fetch('/api/tshirt', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!response.ok) throw new Error('Registration could not be sent. Please try again later.');
      form.reset();
      setState('success');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Registration could not be sent.');
      setState('error');
    }
  }
  return <div className={formStyles.retroPage}>
    <Head><title>Register for an OSDC T-shirt</title><meta name="description" content="Register your size and contact details for an OSDC T-shirt." /></Head>
    <header className={formStyles.header}><Link href="/" className={formStyles.brand}>OSDC<span className={formStyles.brandMark}>✳</span></Link><nav><Link href="/">Back to Clubbook ↗</Link></nav></header>
    <main className={formStyles.main}><p className={formStyles.eyebrow}>/Pocket/OSDC/T-shirts</p><h1>Wear the<br /><em>community.</em></h1><p className={formStyles.intro}>Choose a design and size. We’ll follow up with availability and pickup details.</p>
      <section className={`${formStyles.design} ${design === 'open-source-tees-design-1' ? formStyles.selectedDesign : ''}`} aria-labelledby="design-title">
        <div className={formStyles.artworkLink}><img src="/images/tshirts/open-source-tees-poster.png" alt="Design 1 poster showing the beige OSDC T-shirt with open source city artwork and ₹699 price" width="1254" height="1254" /></div>
        <div className={formStyles.designDetails}><span className={formStyles.eyebrow}>Design 01</span><h2 id="design-title">The Open Source Tees</h2><p>Hand-drawn open source city on a beige, oversized T-shirt.</p><strong>₹699</strong><a className={formStyles.previewLink} href="/images/tshirts/open-source-tees-artwork.png" target="_blank" rel="noreferrer">See the artwork up close ↗</a><button className={formStyles.chooseDesign} type="button" aria-pressed={design === 'open-source-tees-design-1'} onClick={() => setDesign('open-source-tees-design-1')}>{design === 'open-source-tees-design-1' ? 'Selected ✓' : 'Choose Design 1'}</button></div>
      </section>
      <section className={`${formStyles.design} ${design === 'cosmic-expansion-design-2' ? formStyles.selectedDesign : ''}`} aria-labelledby="design-two-title">
        <div className={`${formStyles.artworkLink} ${formStyles.darkArtwork}`}><img src="/images/tshirts/osdc-cosmic-expansion-design-2.png" alt="Design 2 black OSDC T-shirt with white cosmic expansion and open-source artwork" width="960" height="1280" /></div>
        <div className={formStyles.designDetails}><span className={formStyles.eyebrow}>Design 02</span><h2 id="design-two-title">Cosmic Expansion</h2><p>Black OSDC T-shirt with a white illustrated timeline from the Big Bang to open source.</p><strong>₹699</strong><button className={formStyles.chooseDesign} type="button" aria-pressed={design === 'cosmic-expansion-design-2'} onClick={() => setDesign('cosmic-expansion-design-2')}>{design === 'cosmic-expansion-design-2' ? 'Selected ✓' : 'Choose Design 2'}</button></div>
      </section>
      <section className={formStyles.sizeGuide} aria-labelledby="size-title">
        <div className={formStyles.sizeHeading}><div><p className={formStyles.eyebrow}>Design 1 · oversized fit</p><h2 id="size-title">Find your size</h2></div><a href="/images/tshirts/open-source-tees-size-chart.jpg" target="_blank" rel="noreferrer">Open size chart ↗</a></div>
        <div className={formStyles.sizeContent}><a className={formStyles.chartImage} href="/images/tshirts/open-source-tees-size-chart.jpg" target="_blank" rel="noreferrer" aria-label="Open the original size chart full size"><img src="/images/tshirts/open-source-tees-size-chart.jpg" alt="Design 1 oversized fit size chart showing chest, length and shoulder measurements" width="957" height="1280" /></a><div className={formStyles.tableScroll}><table><caption>Design 1 measurements in inches</caption><thead><tr><th scope="col">Size</th>{sizes.map(size => <th scope="col" key={size.label}>{size.label}</th>)}</tr></thead><tbody><tr><th scope="row">Chest</th>{sizes.map(size => <td key={size.label}>{size.chest}</td>)}</tr><tr><th scope="row">Length</th>{sizes.map(size => <td key={size.label}>{size.length}</td>)}</tr><tr><th scope="row">Shoulder</th>{sizes.map(size => <td key={size.label}>{size.shoulder}</td>)}</tr></tbody></table><p className={formStyles.sizeNote}>Design 2 measurements are not available yet. Choose your usual size and we’ll confirm the fit before finalizing.</p></div></div>
      </section>
      {state === 'success' ? <div className={formStyles.result} role="status"><h2>Registration sent.</h2><p>We’ve received your T-shirt request. Watch your email for the next steps.</p><button type="button" onClick={() => setState('idle')}>Register another person</button></div> :
      <form onSubmit={submit} className={formStyles.form}>
        <input type="hidden" name="design" value={design} />
        <label>Full name<input name="name" type="text" autoComplete="name" minLength={2} maxLength={100} required /></label>
        <label>Email address<input name="email" type="email" autoComplete="email" maxLength={200} required /></label>
        <label>Phone number<input name="phone" type="tel" autoComplete="tel" minLength={8} maxLength={20} required /></label>
        <label>T-shirt size<select name="size" defaultValue="" required><option value="" disabled>Select a size</option><option>XS</option><option>S</option><option>M</option><option>L</option><option>XL</option><option>XXL</option></select></label>
        <label className={formStyles.full}>College / organization<input name="organization" type="text" maxLength={120} required /></label>
        <label className={formStyles.honeypot} aria-hidden="true">Leave this empty<input name="website" type="text" tabIndex={-1} autoComplete="off" /></label>
        {state === 'error' && <p className={formStyles.error} role="alert">{message}</p>}
        <button className={formStyles.submit} disabled={state === 'sending'} type="submit">{state === 'sending' ? 'Sending…' : 'Register for a T-shirt ↗'}</button>
      </form>}
    </main><footer className={formStyles.footer}><span>OSDC · JIIT, Noida</span><Link href="/">Back to Clubbook</Link></footer>
  </div>;
}
