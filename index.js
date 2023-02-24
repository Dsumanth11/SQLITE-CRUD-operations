const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
const dbPath = path.join(__dirname, "goodreads.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// Get Books API
app.get("/books/", async (request, response) => {
  const getBooksQuery = `
    SELECT
      *
    FROM
      book
    ORDER BY
      book_id;`;
  const booksArray = await db.all(getBooksQuery);
  response.send(booksArray);
});

//Get Book API
app.get("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  const getBooksQuery = `
    SELECT *
    FROM
      book
    where book_id=${bookId};`;
  const booksArray = await db.get(getBooksQuery);
  response.send(booksArray);
});

// add book at server
app.use(express.json());
app.post("/books/", async (request, response) => {
  try {
    const bookDetails = request.body;
    const {
      title,
      authorId,
      rating,
      ratingCount,
      reviewCount,
      description,
      pages,
      dateOfPublication,
      editionLanguage,
      price,
      onlineStores,
    } = bookDetails;
    const bookQuery = `
        Insert into book(title,author_id,rating,rating_count,review_count,description,pages,date_of_publication,edition_language,price,online_stores)
        values('${title}',${authorId},${rating},${ratingCount},${reviewCount},'${description}',${pages},'${dateOfPublication}','${editionLanguage}',${price},'${onlineStores}');
        `;
    const responseVal = await db.run(bookQuery);
    const bookId = responseVal.lastID;
    console.log(bookId);
    response.send({ bookId: bookId });
  } catch (err) {
    response.send(err);
  }
});

app.put("/books/:bookId", async (request, response) => {
  try {
    const { bookId } = request.params;
    const bookDetails = request.body;
    const {
      title,
      authorId,
      rating,
      ratingCount,
      reviewCount,
      description,
      pages,
      dateOfPublication,
      editionLanguage,
      price,
      onlineStores,
    } = bookDetails;
    console.log(title);
    const bookUpdateQuery = `
        UPDATE 
        BOOK
        SET 
            title='${title}',
            author_id=${authorId},
            rating=${rating},
            rating_count=${ratingCount},
            review_count=${reviewCount},
            description='${description}',
            pages=${pages},
            date_of_publication='${dateOfPublication}',
            edition_language='${editionLanguage}',
            price=${price},
            online_stores='${onlineStores}'
        WHERE
            book_id=${bookId};
        `;
    await db.run(bookUpdateQuery);
    response.send("book Updated Successfully");
  } catch (err) {
    response.send(err);
  }
});

app.delete("/books/:bookId/", async (request, response) => {
  try {
    const { bookId } = request.params;
    const deleQuery = `
        delete from book 
        where book_id=${bookId};
        `;
    db.run(deleQuery);
    response.send("Deleted Successfully");
  } catch (err) {
    response.send(err);
  }
});

app.get("/authors/:authorId/books/", async (request, response) => {
  try {
    const { authorId } = request.params;
    const getBooksQuery = `
        select * 
        from book
        where author_id=${authorId};
        `;
    const books = await db.all(getBooksQuery);
    response.send(books);
  } catch (error) {
    response.send(error);
  }
});
