/**
 @typedef Drepturi
 @type {Object}
 @property {Symbol} vizualizareUtilizatori Dreptul de a intra pe  pagina cu tabelul de utilizatori.
 @property {Symbol} stergereUtilizatori Dreptul de a sterge un utilizator
 @property {Symbol} cumparareProduse Dreptul de a cumpara

 @property {Symbol} vizualizareGrafice Dreptul de a vizualiza graficele de vanzari

 @property {Symbol} vizualizareGalerie Dreptul de a vizualiza galeria de imagini
 @property {Symbol} vizualizareFacturi Dreptul de a vizualiza facturile
 @property {Symbol} trimitereCerereContact Dreptul de a trimite cererea de contact
 */

/**
 * @name module.exports.Drepturi
 * @type Drepturi
 */
const Drepturi = {
  vizualizareUtilizatori: Symbol("vizualizareUtilizatori"),
  stergereUtilizatori: Symbol("stergereUtilizatori"),
  cumparareProduse: Symbol("cumparareProduse"),
  vizualizareGrafice: Symbol("vizualizareGrafice"),
  vizualizareGalerie: Symbol('vizualizareGalerie'),
  vizualizareFacturi: Symbol('vizualizareFacturi'),
  trimitereCerereContact: Symbol('trimiteCerere')
};

module.exports = Drepturi;

