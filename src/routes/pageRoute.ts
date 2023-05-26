import router from './router';
import path = require('path');

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

export default router;