// app.js

// 1. Mengimpor Modul yang Dibutuhkan
const express = require('express'); // Mengimpor framework Express
const bodyParser = require('body-parser'); // Mengimpor body-parser untuk memproses body request

// 2. Membuat Instance Aplikasi Express
const app = express(); // app adalah objek utama aplikasi Express kita
const PORT = process.env.PORT || 3000; // Menentukan port server akan berjalan. Jika ada di environment, pakai itu, kalau tidak, pakai 3000.

// 3. Menggunakan Middleware
// Middleware adalah fungsi yang dijalankan sebelum rute kita diproses.
// body-parser.json() akan menguraikan (parse) body request yang masuk jika formatnya JSON.
// Ini penting agar kita bisa membaca data yang dikirim oleh klien (misalnya, data buku baru saat POST).
app.use(bodyParser.json());

// 4. Data Dummy (Simulasi Database Sederhana)
// Di aplikasi nyata, data ini akan disimpan di database sungguhan.
// Untuk tujuan belajar, kita simpan di array dalam memori.
let books = [
    { id: '1', title: 'The Lord of the Rings', author: 'J.R.R. Tolkien', year: 1954 },
    { id: '2', title: 'Pride and Prejudice', author: 'Jane Austen', year: 1813 },
];

// 5. Fungsi Pembantu (Helper Functions)
// Fungsi untuk mencari buku berdasarkan ID
function findBookById(id) {
    return books.find(book => book.id === id); // 'find' adalah metode array untuk mencari elemen
}

// Fungsi untuk menghasilkan ID baru secara otomatis
function generateNewId() {
    // Mengambil ID buku terakhir, mengubahnya jadi integer, menambah 1, lalu mengubahnya kembali jadi string.
    // Contoh: jika ID terakhir '2', akan jadi '3'.
    if (books.length === 0) return '1'; // Jika belum ada buku, mulai dari 1
    return (parseInt(books[books.length - 1].id) + 1).toString();
}

// --- Rute API (Endpoints) ---
// Inilah bagian inti yang mendefinisikan bagaimana API kita merespons berbagai permintaan HTTP

// GET: Mendapatkan semua buku
// Ketika klien mengirim permintaan GET ke http://localhost:3000/books
app.get('/books', (req, res) => {
    if (books.length > 0) {
        // Jika ada buku, kirim status 200 (OK) dan data buku dalam format JSON
        res.status(200).json({
            status: 'success', // Pesan status kustom
            message: 'Successfully retrieved all books',
            data: books // Data buku yang dikirim
        });
    } else {
        // Jika tidak ada buku, kirim status 404 (Not Found)
        res.status(404).json({
            status: 'fail',
            message: 'No books found'
        });
    }
});

// GET: Mendapatkan buku berdasarkan ID
// Ketika klien mengirim permintaan GET ke http://localhost:3000/books/ID_BUKU
app.get('/books/:id', (req, res) => {
    const { id } = req.params; // Mengambil 'id' dari URL (misal: '1' dari /books/1)
    const book = findBookById(id); // Memanggil fungsi helper untuk mencari buku

    if (book) {
        // Jika buku ditemukan, kirim status 200 dan data buku
        res.status(200).json({
            status: 'success',
            message: `Successfully retrieved book with id ${id}`,
            data: book
        });
    } else {
        // Jika buku tidak ditemukan, kirim status 404
        res.status(404).json({
            status: 'fail',
            message: `Book with id ${id} not found`
        });
    }
});

// POST: Menambah buku baru
// Ketika klien mengirim permintaan POST ke http://localhost:3000/books
// dengan data buku baru di body request
app.post('/books', (req, res) => {
    const { title, author, year } = req.body; // Mengambil data dari body request (JSON)

    // Validasi: pastikan semua field wajib ada
    if (!title || !author || !year) {
        return res.status(400).json({ // 400 Bad Request jika data tidak lengkap
            status: 'fail',
            message: 'Title, author, and year are required'
        });
    }

    const newBook = {
        id: generateNewId(), // Membuat ID baru secara otomatis
        title,
        author,
        year
    };
    books.push(newBook); // Menambahkan buku baru ke array books

    res.status(201).json({ // 201 Created jika berhasil membuat resource baru
        status: 'success',
        message: 'Book added successfully',
        data: newBook
    });
});

// PUT: Memperbarui seluruh data buku berdasarkan ID
// Ketika klien mengirim permintaan PUT ke http://localhost:3000/books/ID_BUKU
// dengan data buku yang diperbarui secara lengkap di body request
app.put('/books/:id', (req, res) => {
    const { id } = req.params;
    const { title, author, year } = req.body;
    const bookIndex = books.findIndex(book => book.id === id); // Mencari indeks buku dalam array

    if (bookIndex !== -1) { // Jika buku ditemukan
        // Validasi: pastikan semua field wajib ada untuk update lengkap
        if (!title || !author || !year) {
            return res.status(400).json({
                status: 'fail',
                message: 'Title, author, and year are required for a complete update'
            });
        }
        // Memperbarui objek buku di array dengan data baru
        books[bookIndex] = { ...books[bookIndex], title, author, year };
        res.status(200).json({ // 200 OK jika berhasil
            status: 'success',
            message: `Book with id ${id} updated successfully (full update)`,
            data: books[bookIndex]
        });
    } else {
        res.status(404).json({ // 404 Not Found jika buku tidak ditemukan
            status: 'fail',
            message: `Book with id ${id} not found`
        });
    }
});

// PATCH: Memperbarui sebagian data buku berdasarkan ID
// Ketika klien mengirim permintaan PATCH ke http://localhost:3000/books/ID_BUKU
// dengan sebagian data buku yang diperbarui di body request
app.patch('/books/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body; // Mengambil objek berisi field yang ingin diperbarui
    const bookIndex = books.findIndex(book => book.id === id);

    if (bookIndex !== -1) { // Jika buku ditemukan
        // Menggabungkan data lama dengan data pembaruan.
        // ...books[bookIndex] akan menyebar semua properti buku lama.
        // ...updates akan menimpa properti yang sama dari updates.
        books[bookIndex] = { ...books[bookIndex], ...updates };
        res.status(200).json({
            status: 'success',
            message: `Book with id ${id} updated successfully (partial update)`,
            data: books[bookIndex]
        });
    } else {
        res.status(404).json({
            status: 'fail',
            message: `Book with id ${id} not found`
        });
    }
});

// DELETE: Menghapus buku berdasarkan ID
// Ketika klien mengirim permintaan DELETE ke http://localhost:3000/books/ID_BUKU
app.delete('/books/:id', (req, res) => {
    const { id } = req.params;
    const initialLength = books.length; // Simpan panjang array sebelum dihapus
    // 'filter' akan membuat array baru yang hanya berisi buku yang ID-nya TIDAK sama dengan ID yang ingin dihapus.
    books = books.filter(book => book.id !== id);

    if (books.length < initialLength) { // Jika panjang array berkurang, berarti ada yang dihapus
        res.status(200).json({ // 200 OK jika berhasil dihapus
            status: 'success',
            message: `Book with id ${id} deleted successfully`
        });
    } else {
        res.status(404).json({ // 404 Not Found jika buku tidak ditemukan
            status: 'fail',
            message: `Book with id ${id} not found`
        });
    }
});

// 6. Menjalankan Server
// app.listen() membuat server kita "mendengarkan" permintaan pada port tertentu.
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Access API at http://localhost:${PORT}/books`);
});