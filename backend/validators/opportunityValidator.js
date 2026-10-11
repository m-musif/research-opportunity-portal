const STATUSES = ["Open", "Closed"];

const FIELDS = [
  "title",
  "description",
  "researchArea",
  "facultyName",
  "department",
  "requiredSkills",
  "availablePositions",
  "applicationDeadline",
  "status",
];

function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === "";
}

function checkText(errors, body, key, label, maxLength) {
  if (isBlank(body[key])) {
    errors.push(`${label} is required`);
    return;
  }
  if (String(body[key]).trim().length > maxLength) {
    errors.push(`${label} must be at most ${maxLength} characters`);
  }
}

function checkPositions(errors, value) {
  if (value === undefined || value === null || value === "") {
    errors.push("Available positions is required");
    return;
  }
  const positions = Number(value);
  if (!Number.isInteger(positions) || positions < 0) {
    errors.push("Available positions must be a whole number, 0 or greater");
  }
}

function checkDeadline(errors, value) {
  if (isBlank(value)) {
    errors.push("Application deadline is required");
    return;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
    errors.push("Application deadline must be a date in YYYY-MM-DD form");
    return;
  }
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    errors.push("Application deadline is not a real date");
  }
}

function checkStatus(errors, value) {
  if (isBlank(value)) {
    errors.push("Status is required");
    return;
  }
  if (!STATUSES.includes(value)) {
    errors.push("Status must be Open or Closed");
  }
}

function validateCreate(body) {
  const errors = [];
  const source = body || {};
  checkText(errors, source, "title", "Title", 200);
  checkText(errors, source, "description", "Description", 5000);
  checkText(errors, source, "researchArea", "Research area", 120);
  checkText(errors, source, "facultyName", "Faculty name", 120);
  checkText(errors, source, "department", "Department", 120);
  checkText(errors, source, "requiredSkills", "Required skills", 255);
  checkPositions(errors, source.availablePositions);
  checkDeadline(errors, source.applicationDeadline);
  checkStatus(errors, source.status);
  return errors;
}

function validateUpdate(body) {
  const source = body || {};
  const present = FIELDS.filter((key) => source[key] !== undefined);
  if (present.length === 0) {
    return ["At least one field is required to update an opportunity"];
  }

  const errors = [];
  if (source.title !== undefined) checkText(errors, source, "title", "Title", 200);
  if (source.description !== undefined) {
    checkText(errors, source, "description", "Description", 5000);
  }
  if (source.researchArea !== undefined) {
    checkText(errors, source, "researchArea", "Research area", 120);
  }
  if (source.facultyName !== undefined) {
    checkText(errors, source, "facultyName", "Faculty name", 120);
  }
  if (source.department !== undefined) {
    checkText(errors, source, "department", "Department", 120);
  }
  if (source.requiredSkills !== undefined) {
    checkText(errors, source, "requiredSkills", "Required skills", 255);
  }
  if (source.availablePositions !== undefined) {
    checkPositions(errors, source.availablePositions);
  }
  if (source.applicationDeadline !== undefined) {
    checkDeadline(errors, source.applicationDeadline);
  }
  if (source.status !== undefined) checkStatus(errors, source.status);
  return errors;
}

module.exports = { validateCreate, validateUpdate };
