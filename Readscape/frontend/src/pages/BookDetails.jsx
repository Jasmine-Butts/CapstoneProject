import { useParams } from "react-router-dom";

function BookDetails() {
  const { id } = useParams();

  return (
    <section>
      <h1>Book Details</h1>
      <p>Book ID: {id}</p>
    </section>
  );
}

export default BookDetails;