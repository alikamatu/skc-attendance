const pool = require('../config/db');

class Attendance {
  static async create({ student_id, name, session, action, date }) {
    try {
      // Check if student already signed in today
      if (action === 'sign-in') {
        const existing = await pool.query(
          `SELECT * FROM attendance 
           WHERE student_id = $1 AND date = $2 AND signed_out_at IS NULL`,
          [student_id, date]
        );
        
        if (existing.rows.length > 0) {
          throw new Error('Student already signed in today');
        }
      }

      // For sign-out, find the open attendance record
      if (action === 'sign-out') {
        const openRecord = await pool.query(
          `SELECT * FROM attendance 
           WHERE student_id = $1 AND date = $2 AND signed_out_at IS NULL 
           ORDER BY signed_in_at DESC LIMIT 1`,
          [student_id, date]
        );
        
        if (openRecord.rows.length === 0) {
          throw new Error('No active sign-in found for this student today');
        }

        const result = await pool.query(
          `UPDATE attendance 
           SET signed_out_at = NOW(), status = 'completed'
           WHERE id = $1 RETURNING *`,
          [openRecord.rows[0].id]
        );
        
        return result.rows[0];
      }

      // For new sign-in
      const result = await pool.query(
        `INSERT INTO attendance 
         (student_id, student_name, session, date, signed_in_at, status) 
         VALUES ($1, $2, $3, $4, NOW(), 'present') 
         RETURNING *`,
        [student_id, name, session, date]
      );
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findByDate(date) {
    try {
      const result = await pool.query(
        `SELECT a.id, s.name AS student_name, a.date, 
         a.signed_in_at, a.signed_out_at, a.status, s.session
         FROM attendance a
         JOIN students s ON a.student_id = s.id
         WHERE a.date = $1
         ORDER BY s.session, s.name`,
        [date]
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async getHistory({ start, end, session, page = 1, limit = 10 }) {
    try {
      const offset = (page - 1) * limit;
      let query = `
        SELECT a.id, s.name AS student_name, a.date, 
        a.signed_in_at, a.signed_out_at, a.status, s.session
        FROM attendance a 
        JOIN students s ON a.student_id = s.id
        WHERE a.date BETWEEN $1 AND $2
      `;
      
      const values = [start, end];
      
      if (session) {
        query += " AND s.session = $3";
        values.push(session);
      }
      
      query += ` ORDER BY a.date ASC, s.session 
                LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
      values.push(limit, offset);
      
      const { rows } = await pool.query(query, values);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async getCurrentAttendance(date) {
    try {
      const result = await pool.query(
        `SELECT a.id, s.name AS student_name, a.date, 
         a.signed_in_at, a.signed_out_at, a.status, s.session
         FROM attendance a
         JOIN students s ON a.student_id = s.id
         WHERE a.date = $1 AND a.signed_out_at IS NULL
         ORDER BY s.session, s.name`,
        [date]
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Attendance;