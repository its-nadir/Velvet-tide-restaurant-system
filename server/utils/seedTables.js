const Table = require("../models/Table");

const buildDefaultTables = () => {
  const definitions = [];
  let tableNumber = 1;

  const addTables = (count, seats, label) => {
    for (let i = 0; i < count; i += 1) {
      definitions.push({
        table_number: tableNumber,
        position: `${label} ${Math.floor(i / 2) + 1}`,
        number_of_chairs: seats,
      });
      tableNumber += 1;
    }
  };

  addTables(8, 2, "Intimate Nook");
  addTables(8, 4, "Family Corner");
  addTables(5, 6, "Gathering Bay");
  addTables(2, 8, "Celebration Hall");

  return definitions;
};

const seedTables = async () => {
  const existingCount = await Table.countDocuments();
  if (existingCount > 0) {
    return;
  }

  const defaultTables = buildDefaultTables();
  await Table.insertMany(defaultTables);
  console.log(`Seeded ${defaultTables.length} dining tables`);
};

module.exports = seedTables;
