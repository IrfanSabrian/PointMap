import { body, validationResult } from "express-validator";

router.post(
  "/",
  verifyToken,
  [
    body("nama").notEmpty().withMessage("Nama gedung wajib diisi"),
    body("kode").notEmpty().withMessage("Kode gedung wajib diisi"),
    body("jumlah_lantai")
      .isInt({ min: 1 })
      .withMessage("Jumlah lantai harus angka minimal 1"),
    body("jenis_gedung").notEmpty().withMessage("Jenis gedung wajib diisi"),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  addGedung
);
