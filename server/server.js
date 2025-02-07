// Add these imports at the top
import express, { json } from 'express';
import cors from 'cors';
import { Pool } from 'pg';

const app = express();
app.use(cors());
app.use(json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Updated compound search endpoint
app.get('/api/compounds', async (req, res) => {
  try {
    const {
      search,
      molWeightMin,
      molWeightMax,
      logPMin,
      logPMax,
      maxPhase,
      moleculeType,
      page = 1,
      limit = 10
    } = req.query;

    let query = `
      SELECT 
        md.molregno,
        md.chembl_id,
        md.pref_name,
        md.max_phase,
        md.molecule_type,
        cp.full_mwt,
        cp.alogp,
        cp.hbd,
        cp.hba,
        cp.psa,
        cp.rtb,
        cp.tpsa,
        cs.canonical_smiles,
        d.development_phase,
        moa.mechanism_of_action,
        STRING_AGG(DISTINCT t.pref_name, ', ') as target_names
      FROM molecule_dictionary md
      LEFT JOIN compound_properties cp ON md.molregno = cp.molregno
      LEFT JOIN compound_structures cs ON md.molregno = cs.molregno
      LEFT JOIN drug_mechanism dm ON md.molregno = dm.molregno
      LEFT JOIN mechanism_refs moa ON dm.mec_id = moa.mec_id
      LEFT JOIN drug_indication di ON md.molregno = di.molregno
      LEFT JOIN target_dictionary t ON di.target_id = t.tid
      LEFT JOIN drug_development_phase d ON md.molregno = d.molregno
      WHERE 1=1
    `;

    const queryParams = [];
    let paramCount = 1;

    if (search) {
      query += ` AND (md.chembl_id ILIKE $${paramCount} OR md.pref_name ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
      paramCount++;
    }

    if (molWeightMin) {
      query += ` AND cp.full_mwt >= $${paramCount}`;
      queryParams.push(molWeightMin);
      paramCount++;
    }

    if (molWeightMax) {
      query += ` AND cp.full_mwt <= $${paramCount}`;
      queryParams.push(molWeightMax);
      paramCount++;
    }

    if (maxPhase) {
      query += ` AND md.max_phase = $${paramCount}`;
      queryParams.push(maxPhase);
      paramCount++;
    }

    if (moleculeType) {
      query += ` AND md.molecule_type = $${paramCount}`;
      queryParams.push(moleculeType);
      paramCount++;
    }

    query += ` GROUP BY md.molregno, md.chembl_id, md.pref_name, md.max_phase, 
               md.molecule_type, cp.full_mwt, cp.alogp, cp.hbd, cp.hba, cp.psa, 
               cp.rtb, cp.tpsa, cs.canonical_smiles, d.development_phase, 
               moa.mechanism_of_action`;

    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(limit, (page - 1) * limit);

    const { rows } = await pool.query(query, queryParams);
    res.json(rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add endpoint for compound details
app.get('/api/compounds/:chemblId', async (req, res) => {
  try {
    const { chemblId } = req.params;
    const query = `
      SELECT 
        md.*,
        cp.*,
        cs.canonical_smiles,
        d.development_phase,
        moa.mechanism_of_action,
        json_agg(DISTINCT jsonb_build_object(
          'target_name', t.pref_name,
          'target_type', t.target_type,
          'organism', t.organism
        )) as targets,
        json_agg(DISTINCT jsonb_build_object(
          'activity_id', a.activity_id,
          'standard_type', a.standard_type,
          'standard_value', a.standard_value,
          'standard_units', a.standard_units
        )) as activities
      FROM molecule_dictionary md
      LEFT JOIN compound_properties cp ON md.molregno = cp.molregno
      LEFT JOIN compound_structures cs ON md.molregno = cs.molregno
      LEFT JOIN drug_mechanism dm ON md.molregno = dm.molregno
      LEFT JOIN mechanism_refs moa ON dm.mec_id = moa.mec_id
      LEFT JOIN drug_indication di ON md.molregno = di.molregno
      LEFT JOIN target_dictionary t ON di.target_id = t.tid
      LEFT JOIN activities a ON md.molregno = a.molregno
      LEFT JOIN drug_development_phase d ON md.molregno = d.molregno
      WHERE md.chembl_id = $1
      GROUP BY md.molregno, md.chembl_id, cp.molregno, cs.molregno, 
               d.development_phase, moa.mechanism_of_action
    `;

    const { rows } = await pool.query(query, [chemblId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Compound not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add visualization data endpoint
app.get('/api/visualization-data', async (req, res) => {
  try {
    const molWeightQuery = `
      SELECT 
        width_bucket(full_mwt, 0, 1000, 20) as bucket,
        count(*) as count,
        min(full_mwt) as min_weight,
        max(full_mwt) as max_weight
      FROM compound_properties
      WHERE full_mwt IS NOT NULL
      GROUP BY bucket
      ORDER BY bucket;
    `;

    const moleculeTypeQuery = `
      SELECT molecule_type, count(*) as count
      FROM molecule_dictionary
      GROUP BY molecule_type;
    `;

    const [molWeightData, moleculeTypeData] = await Promise.all([
      pool.query(molWeightQuery),
      pool.query(moleculeTypeQuery)
    ]);

    res.json({
      molecularWeights: molWeightData.rows,
      moleculeTypes: moleculeTypeData.rows
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));