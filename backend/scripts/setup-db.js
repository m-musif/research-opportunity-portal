const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function main() {
  const schemaPath = path.join(__dirname, "..", "..", "database", "schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf8");
  const host = process.env.DB_HOST || "localhost";
  const port = Number(process.env.DB_PORT) || 3306;

  const connection = await mysql.createConnection({
    host,
    port,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    multipleStatements: true,
  });

  await connection.query(sql);
  await connection.end();
  console.log("Database research_portal is ready.");
}

main().catch((error) => {
  if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
    console.error("Could not connect to MySQL. Start MySQL, then run this again.");
  } else {
    console.error(error.message);
  }
  process.exit(1);
});
