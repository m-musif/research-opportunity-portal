const pool = require("../config/db");
const { validateCreate, validateUpdate } = require("../validators/opportunityValidator");

const COLUMN_BY_FIELD = {
  title: "title",
  description: "description",
  researchArea: "research_area",
  facultyName: "faculty_name",
  department: "department",
  requiredSkills: "required_skills",
  availablePositions: "available_positions",
  applicationDeadline: "application_deadline",
  status: "status",
};

function toOpportunity(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    researchArea: row.research_area,
    facultyName: row.faculty_name,
    department: row.department,
    requiredSkills: row.required_skills,
    availablePositions: row.available_positions,
    applicationDeadline: row.application_deadline,
    status: row.status,
  };
}

function parseId(value) {
  if (!/^\d+$/.test(String(value))) return null;
  const id = Number(value);
  return id > 0 ? id : null;
}

function sendDbError(res, error) {
  console.error(error);
  res.status(500).json({ error: "Internal server error" });
}

async function createOpportunity(req, res) {
  const errors = validateCreate(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: "Invalid research opportunity", details: errors });
  }

  const body = req.body;
  try {
    const [result] = await pool.execute(
      `INSERT INTO opportunities
        (title, description, research_area, faculty_name, department, required_skills,
         available_positions, application_deadline, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        String(body.title).trim(),
        String(body.description).trim(),
        String(body.researchArea).trim(),
        String(body.facultyName).trim(),
        String(body.department).trim(),
        String(body.requiredSkills).trim(),
        Number(body.availablePositions),
        body.applicationDeadline,
        body.status,
      ]
    );
    const [rows] = await pool.execute("SELECT * FROM opportunities WHERE id = ?", [result.insertId]);
    res.status(201).json(toOpportunity(rows[0]));
  } catch (error) {
    sendDbError(res, error);
  }
}

async function getOpportunities(req, res) {
  const status = req.query.status;
  if (status !== undefined && status !== "Open" && status !== "Closed") {
    return res.status(400).json({ error: "Status filter must be Open or Closed" });
  }

  try {
    const sql = status
      ? "SELECT * FROM opportunities WHERE status = ? ORDER BY application_deadline ASC, id DESC"
      : "SELECT * FROM opportunities ORDER BY application_deadline ASC, id DESC";
    const [rows] = status ? await pool.execute(sql, [status]) : await pool.execute(sql);
    res.status(200).json(rows.map(toOpportunity));
  } catch (error) {
    sendDbError(res, error);
  }
}

async function getOpportunity(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ error: "Opportunity id must be a positive number" });
  }

  try {
    const [rows] = await pool.execute("SELECT * FROM opportunities WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Research opportunity not found" });
    }
    res.status(200).json(toOpportunity(rows[0]));
  } catch (error) {
    sendDbError(res, error);
  }
}

async function updateOpportunity(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ error: "Opportunity id must be a positive number" });
  }

  const errors = validateUpdate(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: "Invalid research opportunity", details: errors });
  }

  const assignments = [];
  const values = [];
  for (const [field, column] of Object.entries(COLUMN_BY_FIELD)) {
    if (req.body[field] === undefined) continue;
    assignments.push(`${column} = ?`);
    const raw = req.body[field];
    values.push(field === "availablePositions" ? Number(raw) : String(raw).trim());
  }

  try {
    const [existing] = await pool.execute("SELECT id FROM opportunities WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: "Research opportunity not found" });
    }

    await pool.execute(
      `UPDATE opportunities SET ${assignments.join(", ")} WHERE id = ?`,
      [...values, id]
    );
    const [rows] = await pool.execute("SELECT * FROM opportunities WHERE id = ?", [id]);
    res.status(200).json(toOpportunity(rows[0]));
  } catch (error) {
    sendDbError(res, error);
  }
}

async function deleteOpportunity(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ error: "Opportunity id must be a positive number" });
  }

  try {
    const [result] = await pool.execute("DELETE FROM opportunities WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Research opportunity not found" });
    }
    res.status(200).json({ message: "Research opportunity deleted" });
  } catch (error) {
    sendDbError(res, error);
  }
}

module.exports = {
  createOpportunity,
  getOpportunities,
  getOpportunity,
  updateOpportunity,
  deleteOpportunity,
};
