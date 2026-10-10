import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
export default function Dashboard() {
  const [data,setData] = useState(null);
  const [error,setError] = useState('');
  const navigate = useNavigate();
  useEffect(()=>{ let active=true; api('/dashboard').then(d=>{if(active)setData(d);}).catch(e=>{if(active)setError(e.message);}); return ()=>{active=false;}; },[]);
  async function logout() { try { await api('/auth/logout',{method:'POST'}); } finally {sessionStorage.removeItem('readscapeToken');navigate('/login');} }
  return <main className="dashboard-page">
    <section className="dashboard-hero"><div className="hero-copy"><p className="dashboard-date">{new Date().toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})}</p><h1>Your reading dashboard</h1><p className="hero-description">{data?`Welcome back, ${data.user.name}.`:'Loading your library…'}</p></div><button className="secondary-button" onClick={logout}>Log out</button></section>
    {error && <p role="alert">{error}</p>}
    <div className="featured-actions"><Link className="primary-button" to="/search">Search books</Link><Link className="secondary-button" to="/library">View library</Link></div>
    {data && <><section className="reading-progress-section"><div className="reading-progress-grid">{[[data.counts.reading,'Currently reading'],[data.counts.finished,'Finished'],[data.counts.want,'Want to read'],[data.pagesRead,'Pages read']].map(([value,label])=><div className="progress-stat" key={label}><strong>{value}</strong><span>{label}</span></div>)}</div></section>
    <section><h2>Currently reading</h2><div className="library-grid">{data.books.filter(b=>b.status==='reading').map(b=><article className="library-book" key={b.id}>{b.cover&&<img className="library-book-cover" src={b.cover} alt={`${b.title} cover`}/>}<h3>{b.title}</h3><p>{b.author}</p><p>{b.currentPage} / {b.pages || '?'} pages</p><Link to="/library">Update progress →</Link></article>)}</div>{!data.counts.reading&&<p>Start a book from your library to see it here.</p>}</section>
    <section className="queue-section"><h2>Want to read</h2>{data.books.filter(b=>b.status==='want').slice(0,5).map(b=><p key={b.id}>{b.title} — {b.author}</p>)}{!data.books.length&&<p>Your library is empty. Search for your first book.</p>}</section></>}
  </main>;
}
