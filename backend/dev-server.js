import http from 'http';

const PORT = 3000;

const server = http.createServer((req, res) => {
	res.writeHead(200, { 'Content-Type': 'application/json' });
	res.end(JSON.stringify({ message: 'Hello from the dev server!' }));
});

server.listen(PORT, () => {
	console.log(`Dev server is running at http://localhost:${PORT}`);
});
