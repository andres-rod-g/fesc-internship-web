// Generate semesters from current year to 5 years in the future
// Format: YYYY-01, YYYY-02 (01 = first semester, 02 = second semester)

export function generateSemesters() {
  const currentYear = new Date().getFullYear();
  const endYear = currentYear + 5;
  const semesters = [];

  for (let year = currentYear; year <= endYear; year++) {
    semesters.push({
      value: `${year}-01`,
      label: `${year}-01`
    });
    semesters.push({
      value: `${year}-02`,
      label: `${year}-02`
    });
  }

  return semesters;
}

export function getSemesterLabel(semestre) {
  if (!semestre) return "Sin semestre";
  return semestre;
}
