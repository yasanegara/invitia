const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
try {
  const adapter1 = new PrismaPg({ connectionString: "test" });
  console.log("Constructor 1 worked");
} catch(e) { console.error("Err 1", e.message); }
