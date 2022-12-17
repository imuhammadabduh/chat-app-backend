const Message = require("../models/Message");

const router = require("express").Router();

router.get("/:id", async (req, res) => {
  try {
    const {id} = req.params
    console.log(id)
    const result = await Message.findOne({to:id}, [], { sort: { updatedAt: -1 } });
    res.status(201).json(result);
  } catch (e) {
    console.log(e);
    res.status(400).json(msg);
  }
});

module.exports = router;
