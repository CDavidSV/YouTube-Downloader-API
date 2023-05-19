import express from 'express';
import page from './routes/pageRoute';
import search from './routes/searchRoute';
import download from './routes/downloadsRoute';
import colors from 'colors';
import path from 'path';

colors.enable();
const app = express();
const port = 3000;

const staticPath = path.join(__dirname, './public');
app.use(express.static(staticPath));
app.use(express.json());
app.use('/', page);
app.use('/', search);
app.use('/download', download);

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`.green)
});

export default app;