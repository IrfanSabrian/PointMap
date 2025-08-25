import Jalur from "../models/Jalur.js";

// Get all jalur
const getAllJalur = async (req, res) => {
  try {
    const jalur = await Jalur.findAll({
      order: [["id_jalur", "ASC"]],
    });
    res.json(jalur);
  } catch (error) {
    console.error("Error fetching jalur:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get jalur by ID
const getJalurById = async (req, res) => {
  try {
    const { id } = req.params;
    const jalur = await Jalur.findByPk(id);

    if (!jalur) {
      return res.status(404).json({ error: "Jalur not found" });
    }

    res.json(jalur);
  } catch (error) {
    console.error("Error fetching jalur by ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create new jalur
const createJalur = async (req, res) => {
  try {
    const { mode, arah, panjang, waktu_kaki, waktu_kendara, geometri } =
      req.body;

    if (!panjang || !waktu_kaki || !waktu_kendara || !geometri) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const jalur = await Jalur.create({
      mode: mode || "both",
      arah: arah || "twoway",
      panjang,
      waktu_kaki,
      waktu_kendara,
      geometri,
    });

    res.status(201).json(jalur);
  } catch (error) {
    console.error("Error creating jalur:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update jalur
const updateJalur = async (req, res) => {
  try {
    const { id } = req.params;
    const { mode, arah, panjang, waktu_kaki, waktu_kendara, geometri } =
      req.body;

    const jalur = await Jalur.findByPk(id);
    if (!jalur) {
      return res.status(404).json({ error: "Jalur not found" });
    }

    await jalur.update({
      mode,
      arah,
      panjang,
      waktu_kaki,
      waktu_kendara,
      geometri,
    });

    res.json({ message: "Jalur updated successfully" });
  } catch (error) {
    console.error("Error updating jalur:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete jalur
const deleteJalur = async (req, res) => {
  try {
    const { id } = req.params;

    const jalur = await Jalur.findByPk(id);
    if (!jalur) {
      return res.status(404).json({ error: "Jalur not found" });
    }

    await jalur.destroy();

    res.json({ message: "Jalur deleted successfully" });
  } catch (error) {
    console.error("Error deleting jalur:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export { getAllJalur, getJalurById, createJalur, updateJalur, deleteJalur };
