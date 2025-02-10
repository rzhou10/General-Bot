import {authenticate} from "../controllers/lastfm.controller.js"

export default function routes (app, express) {
  const router = express.Router();

  router.get('/authenticate', authenticate);

  app.use('/', router);
}