import { useEffect, useState } from "react";
import { useAuth } from "../services/AuthContext";

export default function BookRecommendations() {
    const { token } = useAuth();
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        if (!token) {
            setLoading(false);
            return;
        }

        const controller = new AbortController();

        async function loadRecommendations() {
            try {
                setLoading(true);

                const response = await fetch("http://localhost:8080/recommendations", 
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        },

                        signal: controller.signal
                    }
                );

                if (!response.ok) {
                    throw new Error("Unable to load book recommendations. Please try again later.");
                }

                const data = await response.json();
                setBooks(data);
                setError(""); 

             } catch (err) {
                
                if (err.name !== "AbortError") {
                    setError(err.message);
                }

             } finally {
                
                if (!controller.signal.aborted) {
                    setLoading(false);
                }

             }
        }

        loadRecommendations();

        return () => controller.abort();

    }, [token]);

    if (loading) return <p>Finding books for you...</p>;
    if (error) return <p>{error}</p>;

    return (
        <section>
            <h2>Recommended for You</h2>

            {books.length === 0 && (
                <p>Add some books to get some recommendations!</p>
            )}

            <div className="book-recommendations">
                {books.map((book) => (
                    <article key={book.googleBooksId}>
                        {book.thumbnail && (
                            <img
                                src={book.thumbnail}
                                alt={`Cover of ${book.title}`}
                            />
                        )}

                        <h3>{book.title}</h3>
                        <p>{book.author}</p>
                        <p>{book.recommendationReason}</p>

                    </article>

                ))}
            </div>
        </section>
    )

}