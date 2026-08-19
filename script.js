// Server (Node.js)
io.on('connection', (socket) => {
  socket.on('send_message', (data) => {
    io.emit('receive_message', data); // отправка всем
  });
});
async function fetchExchangeRates() {
  const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
  const data = await response.json();
  console.log(`Курс EUR к USD: ${data.rates.EUR}`);
}