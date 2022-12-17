const Feed = require("../models/Feeds");

const router = require("express").Router();

router.get("/", async (req, res) => {
  try {
    const result = await Feed.find({}, [], { sort: { updatedAt: -1 } });
    res.status(201).json(result);
  } catch (e) {
    console.log(e);
    res.status(400).json(msg);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Feed.find({ user_id: id }, [], {
      sort: { updatedAt: -1 },
    });
    res.status(201).json(result);
  } catch (e) {
    console.log(e);
    res.status(400).json(msg);
  }
});

router.post("/", async (req, res) => {
  try {
    const { user_nama, user_id, user_content } = req.body;
    const result = await Feed.create({ user_nama, user_id, user_content });
    res.status(200).json(result);
  } catch (e) {
    console.log(e);
    res.status(400).json(e.message);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Feed.findOneAndDelete({ _id: id });
    res.status(200).json(result);
  } catch (e) {
    console.log(e);
    res.status(400).json(e.message);
  }
});

module.exports = router;
