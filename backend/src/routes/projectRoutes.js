const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const projectController = require("../controllers/projectController");

const router = Router();

router.use(requireAuth);

router.get("/", projectController.list);
router.post("/", projectController.create);
router.get("/:id", projectController.getOne);
router.put("/:id", projectController.update);
router.delete("/:id", projectController.remove);

module.exports = router;
