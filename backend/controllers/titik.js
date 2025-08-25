import Titik from "../models/Titik.js";

// Get all titik
const getAllTitik = async (req, res) => {
  try {
    const titik = await Titik.findAll({
      order: [["id_titik", "ASC"]],
    });
    res.json(titik);
  } catch (error) {
    console.error("Error fetching titik:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get titik by ID
const getTitikById = async (req, res) => {
  try {
    const { id } = req.params;
    const titik = await Titik.findByPk(id);

    if (!titik) {
      return res.status(404).json({ error: "Titik not found" });
    }

    res.json(titik);
  } catch (error) {
    console.error("Error fetching titik by ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create new titik
const createTitik = async (req, res) => {
  try {
    const { nama, koordinat_x, koordinat_y, geometri } = req.body;

    if (!koordinat_x || !koordinat_y || !geometri) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const titik = await Titik.create({
      nama,
      koordinat_x,
      koordinat_y,
      geometri,
    });

    res.status(201).json(titik);
  } catch (error) {
    console.error("Error creating titik:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update titik
const updateTitik = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, koordinat_x, koordinat_y, geometri } = req.body;

    const titik = await Titik.findByPk(id);
    if (!titik) {
      return res.status(404).json({ error: "Titik not found" });
    }

    await titik.update({
      nama,
      koordinat_x,
      koordinat_y,
      geometri,
    });

    res.json({ message: "Titik updated successfully" });
  } catch (error) {
    console.error("Error updating titik:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete titik
const deleteTitik = async (req, res) => {
  try {
    const { id } = req.params;

    const titik = await Titik.findByPk(id);
    if (!titik) {
      return res.status(404).json({ error: "Titik not found" });
    }

    await titik.destroy();

    res.json({ message: "Titik deleted successfully" });
  } catch (error) {
    console.error("Error deleting titik:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export { getAllTitik, getTitikById, createTitik, updateTitik, deleteTitik };
