import express from 'express';
import routes from './routes/index';

const PORT = process.env.PORT || 5000;
const app = express();
app.use(express.json());
app.use('/', routes);

app.listen(PORT, () => {
  console.log(`server is listening to port ${PORT}`);
});

export default app;
