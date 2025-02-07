import { Router } from "express";
const router = Router();
import { query as _query } from "../db";

// Fetching compounds with filters
router.get("/", async (req, res) => {
  try {
    const { search, molecularWeightMin, molecularWeightMax } = req.query;

    let query = `SELECT * FROM molecule_dictionary 
                 JOIN compound_properties ON molecule_dictionary.molregno = compound_properties.molregno
                 WHERE LOWER(pref_name) LIKE LOWER($1)`;
    let values = [`%${search}%`];

    if (molecularWeightMin && molecularWeightMax) {
      query += ` AND full_mwt BETWEEN $2 AND $3`;
      values.push(molecularWeightMin, molecularWeightMax);
    }

    const result = await _query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

export default router;
