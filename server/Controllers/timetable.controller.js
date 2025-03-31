const GlobalTimetable = require('../Models/timetable.model');

class GlobalTimetableController {
  // Save or Update Global Timetable
  async saveGlobalTimetable(req, res) {
    try {
      const { year, term, scheduleType, semester, data } = req.body;
  
      // Ensure semester is always present
      if (!semester) {
        return res.status(400).json({ message: "Semester is required" });
      }
  
      // Check if timetable exists
      const existingTimetable = await GlobalTimetable.findOne({ year, term, scheduleType, semester });
  
      if (existingTimetable) {
        // Update existing document
        const updatedTimetable = await GlobalTimetable.findOneAndUpdate(
          { year, term, scheduleType, semester },
          { 
            data, 
            lastModifiedAt: new Date()
          },
          { new: true }
        );
        return res.status(200).json(updatedTimetable);
      } else {
        // Create new document
        const newTimetable = await GlobalTimetable.create({
          year, term, scheduleType, semester, data, lastModifiedAt: new Date()
        });
        return res.status(201).json(newTimetable);
      }
    } catch (error) {
      res.status(500).json({ 
        message: 'Error saving global timetable', 
        error: error.message 
      });
    }
  }
  

  // Retrieve Global Timetable
  async getGlobalTimetable(req, res) {
    try {
      const { year, term, scheduleType, semester } = req.query;

      const query = {
        year,
        term,
        scheduleType
      };

      // Add semester to query if provided
      if (semester) {
        query.semester = semester;
      }

      const timetable = await GlobalTimetable.findOne(query);

      if (!timetable) {
        return res.status(404).json({ message: 'No timetable found' });
      }

      res.status(200).json(timetable);
    } catch (error) {
      res.status(500).json({ 
        message: 'Error retrieving timetable', 
        error: error.message 
      });
    }
  }

  // Get Timetable Modification History
  async getTimetableHistory(req, res) {
    try {
      const { year, term, scheduleType, semester } = req.query;

      const query = {
        year,
        term,
        scheduleType
      };

      // Add semester to query if provided
      if (semester) {
        query.semester = semester;
      }

      const timetables = await GlobalTimetable.find(query)
        .sort({ lastModifiedAt: -1 });

      res.status(200).json(timetables);
    } catch (error) {
      res.status(500).json({ 
        message: 'Error retrieving timetable history', 
        error: error.message 
      });
    }
  }
}

module.exports = new GlobalTimetableController();