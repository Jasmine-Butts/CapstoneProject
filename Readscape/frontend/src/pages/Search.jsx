import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
export default function Search() {
  const [query,setQuery] = useState('');
  const [books,setBooks] = useState([]);
  const [busy,setBusy] = useState(false);
  const [saving,setSaving] = useState(null);
  const [message,setMessage] = useState('');
  const [searched,setSearched] = useState(false);
  async function search(event) {
    event.preventDefault(); setBusy(true); setMessage(''); setBooks([]); setSearched(false);
    try { const data = await api(`/books/search?q=${encodeURIComponent(query)}`); setBooks(data.books); setSearched(true); }
    catch(error) { setMessage(error.message); } finally { setBusy(false); }
  }
  async function add(book) {
    setSaving(book.id); setMessage('');
    try { await api('/library', { method:'POST', body:JSON.stringify({ googleBookId:book.id }) }); setMessage(`${book.title} added to your library.`); }
    catch(error) { setMessage(error.message); } finally { setSaving(null); }
  }
  return <main className="library-page">
    <Link to="/dashboard">← Dashboard</Link>
    <section className="library-hero"><div><p className="small-label">DISCOVER YOUR NEXT BOOK</p><h1>Search books</h1><p>Find a title or author and add a book to your collection.</p></div><Link to="/library">My library →</Link></section>
    <form className="library-controls" onSubmit={search}><input aria-label="Book title or author" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Title or author" required maxLength={200}/><button className="primary-button" disabled={busy}>{busy?'Searching…':'Search'}</button></form>
    <p role="status">{message}</p>
    {searched && !books.length && <p>No books found. Try another title or author.</p>}
    <section className="library-grid">{books.map(book=><article className="library-book" key={book.id}>
      {book.cover && <img className="library-book-cover" src={book.cover} alt={`${book.title} cover`}/>}
      <h2>{book.title}</h2><p>{book.authors.join(', ') || 'Unknown author'}</p><p>{book.pages ? `${book.pages} pages`:'Page count unavailable'}</p>
      <button className="start-reading-button" disabled={saving!==null} onClick={()=>add(book)}>{saving===book.id?'Saving…':'Add to library'}</button>
    </article>)}</section>
  </main>;
}
