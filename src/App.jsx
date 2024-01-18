import { useState } from "react";
import "./App.css";
import * as XLSX from "xlsx";

import { Document, Page } from "@react-pdf/renderer";

function App() {
  const [data, setData] = useState([]);
  //const [file, setFile] = useState(null);
  const [pdfs, setPdfs] = useState(null);

  // funcion para extraer los datos de un archivo excel
  const handelFile = (e) => {
    const file = e.target.files[0];

    const reader = new FileReader();

    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const excelData = XLSX.utils.sheet_to_json(sheet);
      setData(excelData);
    };
    reader.readAsArrayBuffer(file);
  };

  //funcion para mostrar y extraer los archivos de un pdf
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    // const fileURL = URL.createObjectURL(selectedFile);
    //setFile(selectedFile);
    const formData = new FormData();
    formData.append("pdfFile", selectedFile);
    formData.append("userData", JSON.stringify(data));

    try {
      const response = await fetch("http://localhost:3000/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error al subir el archivo");
      }

     /*  const pdfData = await response.json();
      console.log(pdfData); */
     // setPdfs(pdfData.files);

      
      /*  pdfData.files.forEach((pdf,index) => {
        
        const blob = new Blob([pdf]);
        const url = window.URL.createObjectURL(blob);
        console.log(url)
         const link = document.createElement('a')
        link.href = url
        link.setAttribute('download',`${index}.pdf`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)  
      })  */
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'archivo.pdf');

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link)  
    } catch (error) {
      console.error("Error:", error);
    }
  };

  console.log(pdfs);

  const obtenerBackend = async () => {
    /* try {
      const response = await fetch("http://localhost:3000/");
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.log(error);
    } */
  };

  return (
    <div className="body">
      <div className="section1">
        <h2>Welcome to Certif-Convert</h2>
        <footer>
          <p>V0.0 Derechos Reservados Hiatum</p>
        </footer>
      </div>
      <div className="section2">
        <input type="file" onChange={handelFile} />
        <ul>
          {data.map((item, index) => {
            return <li key={index}>{item.nombre}</li>;
          })}
        </ul>
        <input type="file" onChange={handleFileChange} accept=".pdf" />
        <button onClick={obtenerBackend}>obtener backend</button>
        
      </div>
    </div>
  );
}

export default App;
