const generateSlots = (startTime, endTime, duration) => {
  const slots = [];

  let [startH, startM] = startTime.split(":").map(Number);
  let [endH, endM] = endTime.split(":").map(Number);

  let start = new Date();
  start.setHours(startH, startM, 0, 0);

  let end = new Date();
  end.setHours(endH, endM, 0, 0);

  while (start < end) {
    slots.push(start.toTimeString().slice(0, 5));
    start = new Date(start.getTime() + duration * 60000);
  }

  return slots;
};

export default generateSlots;