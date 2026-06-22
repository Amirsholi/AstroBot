import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { app } from "./app.js";

const port = Number(process.env.PORT ?? 3001);
const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

if (process.env.NODE_ENV === "production") {
  const distDirectory = path.join(rootDirectory, "dist");
  app.use(express.static(distDirectory));
  app.use((_request, response) => {
    response.sendFile(path.join(distDirectory, "index.html"));
  });
}

app.listen(port, "127.0.0.1", () => {
  console.log(`Servidor disponible en http://127.0.0.1:${port}`);
});
