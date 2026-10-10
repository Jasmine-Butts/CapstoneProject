import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../services/api';
export default function BookDetails() {
 const {id}=useParams();const [book,setBook]=useState(null);const [message,setMessage]=useState('Loading book…');
 useEffect(()=>{let active=true;api('/library').then(d=>{if(!active)return;const found=d.books.find(b=>b.id===id);setBook(found);setMessage(found?'':'Book not found in your library.');}).catch(e=>{if(active)setMessage(e.message);});return ()=>{active=false;};},[id]);
 return <main className="library-page"><Link to="/library">← Library</Link><p role="status">{message}</p>{book&&<article><h1>{book.title}</h1><p>{book.author}</p>{book.cover&&<img src={book.cover} alt={`${book.title} cover`}/>}<p>{book.pages || 'Unknown'} pages · {book.status}</p><p>{book.description.replace(/<[^>]*>/g,'')}</p></article>}</main>;
}
