const Hapi = require('@hapi/hapi');
const { nanoid } = require('nanoid');

const init = async () => {
  const server = Hapi.server({
    port: 9000,
    host: 'localhost',
  });

  const books = [];

  server.route({
    method: 'POST',
    path: '/books',
    handler: (request, h) => {
      const {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
      } = request.payload;

      if (!name) {
        return h.response({
          status: 'fail',
          message: 'Gagal menambahkan buku. Mohon isi nama buku',
        }).code(400);
      }

      if (readPage > pageCount) {
        return h.response({
          status: 'fail',
          message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
        }).code(400);
      }

      const id = nanoid(10);
      const finished = pageCount === readPage;
      const insertedAt = new Date().toISOString();

      const newBook = {
        id,
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        finished,
        reading,
        insertedAt,
        updatedAt: insertedAt,
      };

      books.push(newBook);

      return h.response({
        status: 'success',
        message: 'Buku berhasil ditambahkan',
        data: {
          bookId: id,
        },
      }).code(201);
    },
  });

  server.route({
    method: 'GET',
    path: '/books',
    handler: (request, h) => {
      const { name, reading, finished } = request.query;

      let filteredBooks = [...books];

      if (name) {
        filteredBooks = filteredBooks.filter(
          (book) => book.name.toLowerCase().includes(name.toLowerCase())
        );
      }

      if (reading !== undefined) {
        const isReading = reading === '1';
        filteredBooks = filteredBooks.filter((book) => book.reading === isReading);
      }

      if (finished !== undefined) {
        const isFinished = finished === '1';
        filteredBooks = filteredBooks.filter((book) => book.finished === isFinished);
      }

      return h.response({
        status: 'success',
        data: {
          books: filteredBooks,
        },
      }).code(200);
    },
  });

  server.route({
    method: 'GET',
    path: '/books/{bookId}',
    handler: (request, h) => {
      const { bookId } = request.params;

      const book = books.find((book) => book.id === bookId);

      if (!book) {
        return h.response({
          status: 'fail',
          message: 'Buku tidak ditemukan',
        }).code(404);
      }

      return h.response({
        status: 'success',
        data: {
          book,
        },
      }).code(200);
    },
  });

  server.route({
    method: 'PUT',
    path: '/books/{bookId}',
    handler: (request, h) => {
      const { bookId } = request.params;

      const {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
      } = request.payload;

      if (!name) {
        return h.response({
          status: 'fail',
          message: 'Gagal memperbarui buku. Mohon isi nama buku',
        }).code(400);
      }

      if (readPage > pageCount) {
        return h.response({
          status: 'fail',
          message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
        }).code(400);
      }

      const bookIndex = books.findIndex((book) => book.id === bookId);

      if (bookIndex === -1) {
        return h.response({
          status: 'fail',
          message: 'Gagal memperbarui buku. Id buku tidak ditemukan',
        }).code(404);
      }

      const updatedAt = new Date().toISOString();
      const finished = pageCount === readPage;

      books[bookIndex] = {
        ...books[bookIndex],
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
        updatedAt,
        finished,
      };

      return h.response({
        status: 'success',
        message: 'Buku berhasil diperbarui',
      }).code(200);
    },
  });

  server.route({
    method: 'DELETE',
    path: '/books/{bookId}',
    handler: (request, h) => {
      const { bookId } = request.params;

      const bookIndex = books.findIndex((book) => book.id === bookId);

      if (bookIndex === -1) {
        return h.response({
          status: 'fail',
          message: 'Gagal menghapus buku. Id buku tidak ditemukan',
        }).code(404);
      }

      books.splice(bookIndex, 1);

      return h.response({
        status: 'success',
        message: 'Buku berhasil dihapus',
      }).code(200);
    },
  });

  await server.start();
  console.log('Server is running on', server.info.uri);
};

init().catch((err) => {
  console.error(err);
  process.exit(1);
});
