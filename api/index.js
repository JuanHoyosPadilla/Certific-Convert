/* import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import pkg from "pdf-lib";
const { PDFDocument, PDFLib, StandardFonts, rgb } = pkg;
import path from "path";

const upload = multer({ dest: "/uploads" });

const app = express();
app.locals.dirname = path.resolve();
app.use(cors());
app.use(express.json());
const PORT = 3000; // Puerto en el que se ejecutará el servidor

// Ruta principal
app.get("/", (req, res) => {
  res.json({ msg: "hola mundo" });
});

app.post("/", upload.single("pdfFile"), async (req, res) => {
  let responseSent = false;
  try {
    if (!req.file) {
      return res.status(400).send({
        error: "Por favor, Selecciona un archivo",
      });
    }

    //console.log(req.file);

    if (!req.body) {
      return res.status(400).send({
        error: "Por favor, ingresa los datos del usuario",
      });
    }

    const { userData } = req.body;
    const users = JSON.parse(userData);

    // Crear el directorio para los archivos modificados si no existe
    const modifiedDir = path.join(app.locals.dirname, "archivos_modificados");
    if (!fs.existsSync(modifiedDir)) {
      fs.mkdirSync(modifiedDir);
    }

    const pdfs = [];
    for (const user of users) {
      //leer el archivo pdf subido
      const existingPdfBytes = await fs.promises.readFile(req.file.path);
      // Crea un nuevo documento PDF
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica); // Agrega una página al PDF
      const page = pdfDoc.getPages()[0];
      const { width, height } = page.getSize();

      // Agrega texto dinámico a la página
      const fontSize = 30;
      const text = `${user.nombre} ${user.apellido}`; // Aquí puedes personalizar el texto según los datos del usuario

      const textWidth = helveticaFont.widthOfTextAtSize(text, fontSize);
      page.drawText(text, {
        x: (width + 200 - textWidth) / 2,
        y: height - 300,
        size: fontSize,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });

      // Guarda el PDF modificado
      const modifiedPdfBytes = await pdfDoc.save();

      // Ruta donde se guardará el nuevo PDF
      const outputPath = path.join(modifiedDir, `${user.nombre}_file.pdf`);

      await fs.promises.writeFile(outputPath, modifiedPdfBytes);
      pdfs.push(outputPath);
    }

    const combinedPdfDoc = await PDFDocument.create();

    for (const pdfPath of pdfs) {
      const existingPdfBytes = await fs.promises.readFile(pdfPath);
      const externalPdf = await PDFDocument.load(existingPdfBytes);
      const externalPages = externalPdf.getPages();

      for (const page of externalPages) {
        const copiedPage = await combinedPdfDoc.copyPages(externalPdf, [page]);
        combinedPdfDoc.addPage(copiedPage[0]);
      }
    }

    const unifiedPdfBytes = await combinedPdfDoc.save();
    const outputPath = path.join(modifiedDir, "pdf_unificado.pdf");

    // Guardar el PDF combinado en disco
    await fs.promises.writeFile(outputPath, unifiedPdfBytes);

    //res.download(outputPath)
    
    await new Promise((resolve,rejects) => {
      res.download(outputPath, (err) => {
        if (err) {
          console.log(err)
          rejects(err)
        }else {
          resolve();
        }
      })
    })
  } catch (error) {
    console.log(error);
    if (!responseSent) {
      responseSent = true;
      res.status(500).send({ error: "Error en el servidor" });
    }
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
 */

import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import path from "path";

const upload = multer({ dest: "/uploads" });

const app = express();
app.locals.dirname = path.resolve();
app.use(cors());
app.use(express.json());
const PORT = 3000;

app.get("/", (req, res) => {
  res.json({ msg: "Hola mundo" });
});

app.post("/", upload.single("pdfFile"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({
        error: "Por favor, selecciona un archivo",
      });
    }

    if (!req.body) {
      return res.status(400).send({
        error: "Por favor, ingresa los datos del usuario",
      });
    }

    const { userData } = req.body;
    const users = JSON.parse(userData);

    const modifiedDir = path.join(app.locals.dirname, "archivos_modificados");
    if (!fs.existsSync(modifiedDir)) {
      fs.mkdirSync(modifiedDir);
    }

    const pdfs = [];
    for (const user of users) {
      const existingPdfBytes = await fs.promises.readFile(req.file.path);
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const page = pdfDoc.getPages()[0];
      const { width, height } = page.getSize();

      const fontSize = 30;
      const text = `${user.nombre} ${user.apellido}`;

      const textWidth = helveticaFont.widthOfTextAtSize(text, fontSize);
      page.drawText(text, {
        x: (width + 200 - textWidth) / 2,
        y: height - 300,
        size: fontSize,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });

      const modifiedPdfBytes = await pdfDoc.save();
      const outputPath = path.join(modifiedDir, `${user.nombre}_file.pdf`);

      await fs.promises.writeFile(outputPath, modifiedPdfBytes);
      pdfs.push(outputPath);
    }
    /*   // Elimina el archivo original una vez que se han generado todos los documentos modificados
    fs.unlinkSync(req.file.path);
    return res.json({ file: `http://localhost:8081/uploads/${pdfs[0]}`, files
    : pdfs}); */
    //return res.json({ files: pdfs });
    const pdfDoc = await PDFDocument.create();
    for(let pdfPath of pdfs){
      const pdfBytes = await fs.promises.readFile(pdfPath);
      const donorPdfDoc = await PDFDocument.load(pdfBytes)
      const [donorPage] = await pdfDoc.copyPages(donorPdfDoc,[0])
      pdfDoc.addPage(donorPage)
    }
    const combinedPdfPath = path.join(modifiedDir, `copiado_file.pdf`);
    const unifiedPdfBytes = await pdfDoc.save();
    await fs.promises.writeFile(combinedPdfPath, unifiedPdfBytes);
    
    console.log('PDF combinado creado y guardado:', combinedPdfPath);
    res.download(combinedPdfPath)
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Error en el servidor" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
