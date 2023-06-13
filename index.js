const express = require("express");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const sass = require("sass");

const { Client } = require('pg')

var client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'tw',
  user: 'horia',
  password: '123',
})
client.connect()

app.get('/produse', async (req, res) => {
  let produse = []
  let subcategorii = new Set()

  if (req.query.categ) {
    let categ = req.query.categ
    rez = await client.query('select * from produse where categorie = $1', [categ])
    produse = rez.rows
  } else {
    rez = await client.query('select * from produse')
    produse = rez.rows
  }

  let min = 0,
    max = 10000,
    accesorii = new Set(),
    chei = [],
    nume = [],
    intensitati = new Set()

  rez = await client.query(
    'SELECT pg_type.typname AS enumtype, pg_enum.enumlabel AS enumlabel FROM pg_type JOIN pg_enum ON pg_enum.enumtypid = pg_type.oid;'
  )

  intensitati.add('Toate')
  rez.rows.forEach((c) => {
    if (c.enumtype == 'intensitati') intensitati.add(c.enumlabel)
  })

  produse.forEach((produs) => {
    produs.imagine = '/resurse/imagini/produse' + produs.imagine

    subcategorii.add(produs.subcategorie)
    nume.push(produs.nume)
    if (produs.accesorii)
      produs.accesorii.split(', ').forEach((acc) => {
        accesorii.add(acc)
      })
    if (produs.descriere)
      produs.descriere.split(' ').forEach((cuv) => {
        if (cuv.length > 3) chei.push(cuv)
      })
    if (produs.intensitate) intensitati.add(produs.intensitate)
    if (min > produs.pret) min = produs.pret
    if (max < produs.pret) max = produs.pret
  })

  res.render('pagini/produse', {
    categorii: obGlobal.categorii,
    produse: produse,
    subcategorii: subcategorii,
    accesorii: accesorii,
    chei: chei,
    min: min,
    max: max,
    nume: nume,
    intensitati: intensitati,
  })
})

app.get('/produse/:id', (req, res) => {
  let id = req.params.id
  let produs = null
  client.query('select * from produse where id = $1', [id], (err, rez) => {
    if (err) {
      afisEroare(res, '500')
    } else {
      if (rez.rows.length == 0) {
        afisEroare(res, '404')
      } else {
        produs = rez.rows[0]
        console.log(produs)
        res.render('pagini/produs', {
          categorii: obGlobal.categorii,
          produs: produs,
        })
      }
    }
  })
})

obGlobal = {
  obErori: null,
  obImagini: null,
  folderScss: path.join(__dirname, "resources/scss"),
  folderCss: path.join(__dirname, "resources/css"),
  folderBackup: path.join(__dirname, "backup"),
  optiuniMeniu: [],
};

app = express();
console.log("Folder proiect", __dirname);
console.log("Cale fisier", __filename);
console.log("Director de lucru", process.cwd());

const folderScss = path.join(__dirname, "resources/scss");
const folderCss = path.join(__dirname, "resources/css");

vectorFoldere = ["temp", "temp1", "backup"];
for (let folder of vectorFoldere) {
  //let caleFolder=__dirname+"/"+folder;
  let caleFolder = path.join(__dirname, folder);
  if (!fs.existsSync(caleFolder)) {
    fs.mkdirSync(caleFolder);
  }
}

function compileazaScss(caleScss, caleCss) {
  if (!caleCss) {
    let numeFisExt = path.basename(caleScss);

    let numeFis = numeFisExt.split(".")[0];
    caleCss = numeFis + ".css";
  }

  if (!path.isAbsolute(caleScss)) {
    caleScss = path.join(obGlobal.folderScss, caleScss);
  }
  if (!path.isAbsolute(caleCss)) {
    caleCss = path.join(obGlobal.folderCss, caleCss);
  }

  let caleBackup = path.join(obGlobal.folderBackup, "resurse/css");
  if (!fs.existsSync(caleBackup)) {
    fs.mkdirSync(caleBackup, { recursive: true });
  }

  let numeFisCss = path.basename(caleCss).split(".")[0];
  if (fs.existsSync(caleCss)) {
    fs.copyFileSync(
      caleCss,
      path.join(caleBackup, numeFisCss + "_" + new Date().getTime() + ".css")
    );
  }

  rez = sass.compile(caleScss, { sourceMap: true });
  fs.writeFileSync(caleCss, rez.css);
}

let vScss = fs.readdirSync(obGlobal.folderScss);
vScss.forEach((numeFis) => {
  let caleScss = path.join(obGlobal.folderScss, numeFis);
  compileazaScss(caleScss);
});

fs.watch(obGlobal.folderScss, (eveniment, fisier) => {
  if (eveniment == "change" || eveniment == "rename") {
    let caleCompleta = path.join(obGlobal.folderScss, fisier);
    if (fs.existsSync(caleCompleta)) {
      compileazaScss(caleCompleta);
    }
  }
});

app.set("view engine", "ejs");

app.use("/resources", express.static(__dirname + "/resources"));
app.use("/node_modules", express.static(__dirname + "/node_modules"));

app.use(/^\/resources(\/[a-zA-Z0-9]*)*$/, function (req, res) {
  afisareEroare(res, 403);
});

app.get(/\.ejs$/, (req, res) => {
  afisEroare(res, "400");
});

app.get("/favicon.ico", function (req, res) {
  res.sendFile(__dirname + "/resources/ico/favicon.ico");
});

app.get("/ceva", function (req, res) {
  console.log("cale:", req.url);
  res.send("<h1>altceva</h1> ip:" + req.ip);
});

app.get(["/index", "/", "/home"], function (req, res) {
  res.render("pagini/index", {
    ip: req.ip,
    imagini: obGlobal.obImagini.imagini,
  });
});

// ^\w+\.ejs$
app.get("/*.ejs", function (req, res) {
  afisareEroare(res, 400);
});

app.get("/*", function (req, res) {
  try {
    res.render("pagini" + req.url, function (err, rezRandare) {
      if (err) {
        console.log(err);
        if (err.message.startsWith("Failed to lookup view"))
          //afisareEroare(res,{_identificator:404, _titlu:"ceva"});
          afisareEroare(res, 404, "ceva");
        else afisareEroare(res);
      } else {
        console.log(rezRandare);
        res.send(rezRandare);
      }
    });
  } catch (err) {
    if (err.message.startsWith("Cannot find module"))
      //afisareEroare(res,{_identificator:404, _titlu:"ceva"});
      afisareEroare(res, 404);
    else afisareEroare(res);
  }
});

function initErori() {
  var continut = fs
    .readFileSync(__dirname + "/resources/json/erori.json")
    .toString("utf-8");
  // console.log(continut);
  obGlobal.obErori = JSON.parse(continut);
  let vErori = obGlobal.obErori.info_erori;
  //for (let i=0; i< vErori.length; i++ )
  for (let eroare of vErori) {
    eroare.imagine = "/" + obGlobal.obErori.cale_baza + "/" + eroare.imagine;
  }
}
initErori();

function initImagini() {
  var continut = fs
    .readFileSync(path.join(__dirname, "resources/json/galerie.json"))
    .toString("utf-8");
  obGlobal.obImagini = JSON.parse(continut);
  let caleAbs = path.join(__dirname, obGlobal.obImagini.cale_galerie);
  let caleAbsMediu = path.join(caleAbs, "mediu");
  let caleAbsMic = path.join(caleAbs, "mic");

  if (!fs.existsSync(caleAbsMediu)) {
    fs.mkdirSync(caleAbsMediu);
  }
  if (!fs.existsSync(caleAbsMic)) {
    fs.mkdirSync(caleAbsMic);
  }

  obGlobal.obImagini.imagini.forEach((imagine) => {
    [numeFis, ext] = imagine.fisier.split(".");
    imagine.fisier_mediu =
      "/" +
      path.join(obGlobal.obImagini.cale_galerie, "mediu", numeFis + ".webp");
    imagine.fisier_mic =
      "/" +
      path.join(obGlobal.obImagini.cale_galerie, "mic", numeFis + ".webp");

    sharp(path.join(caleAbs, imagine.fisier))
      .resize(400)
      .toFile(path.join(__dirname, imagine.fisier_mediu));
    sharp(path.join(caleAbs, imagine.fisier))
      .resize(200)
      .toFile(path.join(__dirname, imagine.fisier_mic));

    imagine.fisier =
      "/" + path.join(obGlobal.obImagini.cale_galerie, imagine.fisier);
  });
}
initImagini();

function afisareEroare(
  res,
  _identificator,
  _titlu = "titlu default",
  _text,
  _imagine
) {
  let vErori = obGlobal.obErori.info_erori;
  let eroare = vErori.find(function (elem) {
    return elem.identificator == _identificator;
  });
  if (eroare) {
    let titlu1 = _titlu == "titlu default" ? eroare.titlu || _titlu : _titlu;
    let text1 = _text || eroare.text;
    let imagine1 = _imagine || eroare.imagine;
    if (eroare.status)
      res.status(eroare.identificator).render("pagini/eroare", {
        titlu: titlu1,
        text: text1,
        imagine: imagine1,
      });
    else
      res.render("pagini/eroare", {
        titlu: titlu1,
        text: text1,
        imagine: imagine1,
      });
  } else {
    let errDef = obGlobal.obErori.eroare_default;
    res.render("pagini/eroare", {
      titlu: errDef.titlu,
      text: errDef.text,
      imagine: obGlobal.obErori.cale_baza + "/" + errDef.imagine,
    });
  }
}

port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log("Server listening on port", port, "...");
});
