const validateAvailability = (req, res, next) => {
  const { dayOfWeek, slots, slotDuration } = req.body;

  if (dayOfWeek === undefined || !slots || !slotDuration) {
    return res.status(400).json({ message: "Missing fields" });
  }

  next();
};
module.exports = validateAvailability;